package edu.upenn.cis.nets2120.hw3.livy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.livy.Job;
import org.apache.livy.JobContext;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.StructType;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.SparkConnector;
import scala.Tuple2;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

public class SocialRankJob implements Job<List<MyPair<Integer,Double>>> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Connection to Apache Spark
	 */
	SparkSession spark;
	
	JavaSparkContext context;

	private boolean useBacklinks;

	private String source;
	

	/**
	 * Initialize the database connection and open the file
	 * 
	 * @throws IOException
	 * @throws InterruptedException 
	 * @throws DynamoDbException 
	 */
	public void initialize() throws IOException, InterruptedException {
		System.err.println("Connecting to Spark...");
		spark = SparkConnector.getSparkConnection();
		context = SparkConnector.getSparkContext();
		
		System.err.println("Connected!");
	}
	
	/**
	 * Fetch the social network from the S3 path, and create a (followed, follower) edge graph
	 * 
	 * @param filePath
	 * @return JavaPairRDD: (followed: int, follower: int)
	 */
	JavaPairRDD<Integer,Integer> getSocialNetwork(String filePath) {
		// Read into RDD with lines as strings
		JavaRDD<String[]> file = context.textFile(filePath, Config.PARTITIONS)
			.map(line -> line.toString().split("\\s+"));

		JavaPairRDD<Integer, Integer> graph = file.mapToPair(
			line -> new Tuple2<>(Integer.parseInt(line[0]), Integer.parseInt(line[1]))
		).distinct();

		return graph;
	}
	
	private JavaRDD<Integer> getSinks(JavaPairRDD<Integer,Integer> network) {
		JavaRDD<Integer> nodes = network.flatMap(tup -> {
			return new ArrayList<Integer>(Arrays.asList(tup._1, tup._2)).iterator();
		}).distinct(); // Make edges distinct
		
		System.err.println("This graph contains " + nodes.count() + 
				" nodes and " + network.count() + " edges");
		
		// All nodes that have outgoing edges (nonsinks)
		JavaRDD<Integer> nonSinks = network.keys();
		return nodes.subtract(nonSinks);
	}

	/**
	 * Main functionality in the program: read and process the social network
	 * 
	 * @throws IOException File read, network, and other errors
	 * @throws DynamoDbException DynamoDB is unhappy with something
	 * @throws InterruptedException User presses Ctrl-C
	 */
	public List<MyPair<Integer,Double>> run() throws IOException, InterruptedException {
		System.err.println("Running");
		
		final double socialDecay = 0.15;
		final double dmax = 30;
		final int imax = 25;
		final boolean debug = false;

		// Load the social network
		// followed, follower rdd
		JavaPairRDD<Integer, Integer> edges = getSocialNetwork(source);

		JavaRDD<Integer> sinks = getSinks(edges);
		
		JavaPairRDD<Integer, Tuple2<Iterable<Integer>, Integer> > adjList = JavaPairRDD.fromJavaRDD(context.emptyRDD());
		
		if (useBacklinks) {
			// Which nodes each node is linked to by
			JavaPairRDD<Integer, Iterable<Integer> > linkedTo = edges
				.mapToPair(tup -> new Tuple2<>(tup._2, tup._1))
				.groupByKey();
			
			// Create new edge list of backlinks for sink nodes
			JavaPairRDD<Integer, Integer> backlinks = sinks.mapToPair(sink -> new Tuple2<>(sink, 1))
				.cogroup(linkedTo)
				.flatMapToPair(tup -> {
					List<Tuple2<Integer, Integer> > links = new ArrayList<>();
					if (tup._2._1.iterator().hasNext()) { // Is valid sink
						for (Integer neighbor : tup._2._2.iterator().next()) {
							links.add(new Tuple2<>(tup._1, neighbor));
						}
					}
					return links.iterator();
				});
			System.err.println("Added " + backlinks.count() + " backlinks");
			
			// Create adjacency list through a union of old edge list and new backlinks edge list
			// Store neighbor list and outdegree
			adjList = edges
					.union(backlinks)
					.groupByKey()
					.mapValues(neighbors -> {
						int len = 0;
						for (Integer node : neighbors) {
							len++;
						}
						return new Tuple2<Iterable<Integer>, Integer>(neighbors, len);
					});
		} else {
			JavaPairRDD<Integer, Tuple2<Iterable<Integer>, Integer> > sinksAdjList = sinks.mapToPair(sink -> {
				Tuple2<Iterable<Integer>, Integer> val = new Tuple2<Iterable<Integer>, Integer> (new ArrayList<Integer>(), 0);
				return new Tuple2<>(sink, val);
			});
			adjList = edges
					.groupByKey()
					.mapValues(neighbors -> {
						int len = 0;
						for (Integer node : neighbors) {
							len++;
						}
						return new Tuple2<Iterable<Integer>, Integer>(neighbors, len);
					})
					.union(sinksAdjList);
		}
						
		StructType schema = new StructType()
			.add("old_rank", "double")
			.add("new_rank", "double")
			.add("len", "int");
				
		JavaPairRDD<Integer, Tuple2<Row, Iterable<Integer> > > state = adjList.mapToPair(node -> {
			Object[] objs = new Object[3];
			objs[0] = Double.MAX_VALUE;
			objs[1] = 1.0;
			objs[2] = node._2._2;
			return new Tuple2<>(node._1, new Tuple2<>(new GenericRowWithSchema(objs, schema), node._2._1));
		});
		
		long nodeCount = adjList.count();
						
		// Loop imax times
		for (int i = 1; i <= imax; ++i) {
			// Difference between new rank and old rank less than dmax
			if (state.filter(x -> Math.abs((double)x._2._1.getAs("new_rank")
					- (double)x._2._1.getAs("old_rank")) <= dmax).count() == nodeCount) {
				break;
			}
			
			// Populate RDD with values to add to neighbor nodes
			JavaPairRDD<Integer, Double> transfer = state.flatMapToPair(tup -> {
				List<Tuple2<Integer, Double> > list = new ArrayList<>();
				Double val = (Double)tup._2._1.getAs("new_rank") / ((Integer)tup._2._1.getAs("len")).doubleValue();
				for (Integer neighbor : tup._2._2) {
					list.add(new Tuple2<>(neighbor, val));
				}
				return list.iterator();
			});
			
			JavaPairRDD<Integer, Tuple2<Iterable<Tuple2<Row, Iterable<Integer> > >, Iterable<Double> > > cg = state.cogroup(transfer);
			
			// Sum up values to add for each node ID
			state = cg.mapValues(tup -> {
				Double sum = 0.0;
				for (Double d : tup._2) {
					sum += d;
				}
				Object[] objs = new Object[3];
				objs[0] = tup._1.iterator().next()._1.getAs("new_rank");
				objs[1] = socialDecay + (1.0 - socialDecay) * sum;
				objs[2] = tup._1.iterator().next()._1.getAs("len");
				return new Tuple2<Row, Iterable<Integer> >(new GenericRowWithSchema(objs, schema), tup._1.iterator().next()._2);
			});
			
			if (debug) {
				JavaPairRDD<Integer, Double> debugRDD = state.mapValues(tup -> {
					return tup._1.getAs("new_rank");
				});
				System.err.println(debugRDD.collect());
			}
		}
				
		// Get rank, id PairRDD, sort by key, take 10, and print
		List<Tuple2<Double, Integer> > sortedRanks = state
			.mapToPair(tup -> {
				return new Tuple2<>((Double)tup._2._1.getAs("new_rank"), tup._1);
			})
			.sortByKey(false)
			.take(10);
		
		sortedRanks.forEach(tup -> {
			System.err.println(tup._2 + " " + tup._1);
		});
		
		List<MyPair<Integer, Double> > answer = sortedRanks
			.stream()
			.map(tup -> {
				return new MyPair<>(tup._2, tup._1);
			})
			.collect(Collectors.toList());
		
		System.err.println("*** Finished social network ranking! ***");

		return answer;
	}

	/**
	 * Graceful shutdown
	 */
	public void shutdown() {
		System.err.println("Shutting down");
	}
	
	public SocialRankJob(boolean useBacklinks, String source) {
		System.setProperty("file.encoding", "UTF-8");
		
		this.useBacklinks = useBacklinks;
		this.source = source;
	}

	@Override
	public List<MyPair<Integer,Double>> call(JobContext arg0) throws Exception {
		initialize();
		return run();
	}

}
