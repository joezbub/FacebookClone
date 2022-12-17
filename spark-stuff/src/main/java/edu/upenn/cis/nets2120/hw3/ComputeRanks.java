package edu.upenn.cis.nets2120.hw3;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.StructType;
import org.json.JSONObject;

import com.amazonaws.services.connectparticipant.model.*;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.SparkConnector;
import edu.upenn.cis.nets2120.storage.DynamoConnector;
import scala.Tuple2;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.DynamoConnector;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

public class ComputeRanks {
	/**
	 * The basic logger
	 */
	static Logger logger = LogManager.getLogger(ComputeRanks.class);

	/**
	 * Connection to Apache Spark
	 */
	SparkSession spark;
	
	DynamoDB db;
	
	Table users;
	Table articles;
	
	JavaSparkContext context;
		
	public ComputeRanks() {
		System.setProperty("file.encoding", "UTF-8");
	}

	/**
	 * Initialize the database connection and open the file
	 * 
	 * @throws IOException
	 * @throws InterruptedException 
	 */
	public void initialize() throws IOException, InterruptedException {
		logger.info("Connecting to Spark...");

		spark = SparkConnector.getSparkConnection();
		context = SparkConnector.getSparkContext();
		
		logger.info("Connecting to DynamoDB...");
		db = DynamoConnector.getConnection(Config.DYNAMODB_URL);
		users = db.getTable("users");
		articles = db.getTable("comments");
		
		logger.debug("Connected!");
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
	
	JavaPairRDD<String, HashMap<String, Double>> getCategories(String filePath) {
		// Read into RDD with lines as strings
		JavaRDD<String> raw = context.textFile(filePath, Config.PARTITIONS)
				.sample(false, 0.01);
		
		Date today = new Date();
		
		JavaPairRDD<String, String> file = raw
				.map(line -> line.toString())
				.flatMapToPair(
				x -> {
					JSONObject obj = new JSONObject(x);
					ArrayList<Tuple2<String, String>> items = new ArrayList<>();
					
					String rawD = obj.getString("date");
					String modified = (Integer.parseInt(rawD.substring(0,4)) + 5) + rawD.substring(4);
					
					Date d = new SimpleDateFormat("yyyy-MM-dd").parse(modified);
					
					if (d.compareTo(today) <= 0) {

						items.add(new Tuple2<String, String>("a: " + obj.getString("link"),"c: " + obj.getString("category")));
						items.add(new Tuple2<String, String>("c: " + obj.getString("category"),"a: " + obj.getString("link")));
					}
					
					return items.iterator();
				}
				);
		
		JavaRDD<String> nodes = raw
				.map(line -> line.toString())
				.flatMap(
						x -> {
							JSONObject obj = new JSONObject(x);
							ArrayList<String> items = new ArrayList<>();

							items.add("a: " + obj.getString("link"));
							items.add("c: " + obj.getString("category"));
							return items.iterator();
						}
						);
		
		ScanSpec params = new ScanSpec()
				.withAttributesToGet("username","news","friends");
		ItemCollection<ScanOutcome> items = users.scan(params);
		
		Map<String, String> names2 = new HashMap<>();
		names2.put("#t", "type");
		
		Map<String, Object> vals2 = new HashMap<>();
		vals2.put(":a", "article");
				
		ItemCollection<ScanOutcome> items2 = articles.scan("#t = :a", names2, vals2);	

		
		ArrayList<Tuple2<String, String>> vals = new ArrayList<>();
		ArrayList<Tuple2<String, String>> friendships = new ArrayList<>();
		
		ArrayList<String> users = new ArrayList<>();
		
		Iterator<Item> iterator = items.iterator();
		Item item = null;
		Set<String> urls = new HashSet<>();
		while (iterator.hasNext()) {
			item = iterator.next();
			
			users.add("u: " + item.getString("username"));
			
			List<String> news = item.getList("news");
			if (news != null) {
				for (String s : news) {
					vals.add(new Tuple2<String, String>("u: " + item.getString("username"),"c: " + s));
					vals.add(new Tuple2<String, String>("c: " + s,"u: " + item.getString("username")));
				}
			}
			
			List<String> friends = item.getList("friends");
			if (friends != null) {
				for (String s : friends) {
					friendships.add(new Tuple2<String, String>("u: " + item.getString("username"),"u: " + s));
					friendships.add(new Tuple2<String, String>("u: " + s,"u: " + item.getString("username")));
				}
			}
			
			
			
		}
		
		ArrayList<Tuple2<String, String>> userArticle = new ArrayList<>();
		Iterator<Item> iterator2 = items2.iterator();
		Item item2 = null;
		while (iterator2.hasNext()) {
			item2 = iterator2.next();
			List<String> likes = item.getList("likes");
			if (likes != null) {
				for (String l : likes) {
					userArticle.add(new Tuple2<String, String>("u: " + l, "a: " + item2.getString("link")));
					userArticle.add(new Tuple2<String, String>("a: " + item2.getString("link"), "u: " + l));
				}
			}
			
			
		}
		
		file = file.union(context.parallelizePairs(vals))
				.union(context.parallelizePairs(friendships))
				.union(context.parallelizePairs(userArticle));
		
		
		nodes = nodes.union(context.parallelize(users))
				.distinct();
		
		//add weights
		
		JavaPairRDD<Tuple2<String, String>,Double> custOut = file
				.filter(t -> t._1.substring(0, 2).equals("c:"))
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
				.reduceByKey((a, b) -> a+b)
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1/x._2))
				.join(file)
				.mapToPair(x -> new Tuple2<Tuple2<String, String>, Double>(
						new Tuple2<String, String>(x._1, x._2._2), x._2._1
						));
		
		
		JavaPairRDD<Tuple2<String, String>,Double> artOut = file
				.filter(t -> t._1.substring(0, 2).equals("a:"))
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
				.reduceByKey((a, b) -> a+b)
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1/x._2))
				.join(file)
				.mapToPair(x -> new Tuple2<Tuple2<String, String>, Double>(
						new Tuple2<String, String>(x._1, x._2._2), x._2._1
						));
		
		JavaPairRDD<Tuple2<String, String>,Double> uaOut = file
				.filter(t -> t._1.substring(0, 2).equals("u:") && t._2.substring(0,2).equals("a:"))
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
				.reduceByKey((a, b) -> a+b)
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 0.4/x._2))
				.join(file)
				.filter(t -> t._2._2.substring(0, 2).equals("a:"))
				.mapToPair(x -> new Tuple2<Tuple2<String, String>, Double>(
						new Tuple2<String, String>(x._1, x._2._2), x._2._1
						));
		
		JavaPairRDD<Tuple2<String, String>,Double> uuOut = file
				.filter(t -> t._1.substring(0, 2).equals("u:") && t._2.substring(0,2).equals("u:"))
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
				.reduceByKey((a, b) -> a+b)
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 0.3/x._2))
				.join(file)
				.filter(t -> t._2._2.substring(0, 2).equals("u:"))
				.mapToPair(x -> new Tuple2<Tuple2<String, String>, Double>(
						new Tuple2<String, String>(x._1, x._2._2), x._2._1
						));
		
		JavaPairRDD<Tuple2<String, String>,Double> ucOut = file
				.filter(t -> t._1.substring(0, 2).equals("u:") && t._2.substring(0,2).equals("c:"))
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
				.reduceByKey((a, b) -> a+b)
				.mapToPair(x -> new Tuple2<String, Double>(x._1, 0.3/x._2))
				.join(file)
				.filter(t -> t._2._2.substring(0, 2).equals("c:"))
				.mapToPair(x -> new Tuple2<Tuple2<String, String>, Double>(
						new Tuple2<String, String>(x._1, x._2._2), x._2._1
						));
		
		
		JavaPairRDD<Tuple2<String, String>, Double> edgeWeights = custOut
				.union(artOut)
				.union(uaOut)
				.union(uuOut)
				.union(ucOut);
		
		//begin adsorption
		
		JavaPairRDD<String, HashMap<String, Double>> startWeights = 
				nodes.mapToPair(x -> {
					HashMap<String, Double> zeroWeights = new HashMap<>();
					for (String user : users) {
						if (x.equals(user)) {
							zeroWeights.put(user, 1.0);
						} else {
							zeroWeights.put(user, 0.0);
						}
					}
					return new Tuple2<String, HashMap<String, Double>>(x, zeroWeights);
				});
		
		JavaPairRDD<String, Tuple2<String, Double>> refactored = edgeWeights
				.mapToPair(x -> new Tuple2<String, Tuple2<String, Double>>(x._1._1, new Tuple2<String, Double>(x._1._2, x._2)));
		
		Map<String, HashMap<String, Double>> rerefactored = refactored.combineByKey(
				x -> {
					HashMap<String, Double> h = new HashMap<>();
					h.put(x._1, x._2);
					return h;},
				(x, y) -> {
					HashMap<String, Double> h = new HashMap<>();
					h.putAll(x);
					h.put(y._1, y._2);
					return h;},
				(x, y) -> {
					HashMap<String, Double> h = new HashMap<>();
					h.putAll(x);
					h.putAll(y);
					return h;
				}).collectAsMap();
		
		//System.out.println(rerefactored);
	

		
		
		
		
		
		
		
		//TODO: FOR LOOP
		int i = 0;
		boolean good = true;
		
		while (good) {
			
			Map<String, HashMap<String, Double>> currWeights = startWeights.collectAsMap();
			
			
					
					ArrayList<Tuple2<String, HashMap<String, Double>>> parts = new ArrayList<>();
					
					for (String s : nodes.collect()) {
						HashMap<String, Double> zeroWeights = new HashMap<>();
						for (String user : users) {
							zeroWeights.put(user, 0.0);
						}
						parts.add(new Tuple2<String, HashMap<String, Double>> (s, zeroWeights));
					}
					
					JavaPairRDD<String, HashMap<String, Double>> destinations = nodes.flatMapToPair(x -> {
					//for (String x : nodes.collect()) {
						HashMap<String, Double> rrf = rerefactored.get(x);
						
						
						//List<Tuple2<Tuple2<String, String>, Double>> ew = edgeWeights
						//		.filter(t -> t._1._1.equals(x))
						//		.collect();
						if (rrf != null) {
						
							for (String y : rrf.keySet()) {
							//for (Tuple2<Tuple2<String, String>, Double> y : ew) {
								HashMap<String, Double> p = new HashMap<>();
								for (String s : users) {
									
									
									Double w = currWeights.get(x).get(s);	
									
									p.put(s, rrf.get(y) * w);
									
								}
								parts.add(new Tuple2<String, HashMap<String, Double>>(y, p));
								
							}
						}	
						return parts.iterator();
					});
					
					//JavaPairRDD<String, HashMap<String, Double>> destinations = context.parallelizePairs(parts);
					
					
					destinations = destinations.reduceByKey((a,b) -> {
						HashMap<String, Double> combined = new HashMap<>();
						for (String s : a.keySet()) {
							combined.put(s, a.get(s) + b.get(s));
						}
						return combined;
					})
					.mapToPair(x -> {
						HashMap<String, Double> zeroWeights = new HashMap<>();
						if (x._1.substring(0,2).equals("u:")) {
							for (String user : users) {
								if (x._1.equals(user)) {
									zeroWeights.put(user, 1.0);
								} else {
									zeroWeights.put(user, 0.0);
								}
							}
						} else {
							double sum = 0;
							for (String user : users) {
								sum += x._2.get(user);
							}
							if (sum == 0) {
								return x;
							}
							for (String user : users) {
								zeroWeights.put(user, x._2.get(user) / sum);
							}
						}
						return new Tuple2<String, HashMap<String, Double>>(x._1, zeroWeights);
						
					});
					
			
			JavaRDD<Double> maxs = startWeights.join(destinations)
					.map(x -> {
						double max = 0;
						for (String s : x._2._1.keySet()) {
							if (Math.abs(x._2._1.get(s) - x._2._2.get(s)) > max) {
								max = Math.abs(x._2._1.get(s) - x._2._2.get(s));
							}
						}
						return max;
					});
			
			double max = maxs.reduce((a, b) -> Math.max(a, b));	
			
			if (max < 0.001) {
				good = false;
			}
			
			
			startWeights = destinations.mapToPair(x -> x);
			
			i++;
			if (i == 15) {
				good = false;
			}
			
		
		}
		
		//System.out.println(i);
		
		//startWeights.foreach(x -> System.out.println(x));
		
		
		return startWeights;		
	}
	
	
	private JavaRDD<Integer> getSinks(JavaPairRDD<Integer,Integer> network) {
		JavaRDD<Integer> nodes = network.flatMap(tup -> {
			return new ArrayList<Integer>(Arrays.asList(tup._1, tup._2)).iterator();
		}).distinct(); // Make edges distinct
		
		System.out.println("This graph contains " + nodes.count() + 
				" nodes and " + network.count() + " edges");
		
		// All nodes that have outgoing edges (nonsinks)
		JavaRDD<Integer> nonSinks = network.keys();
		return nodes.subtract(nonSinks);
	}

	/**
	 * Main functionality in the program: read and process the social network
	 * 
	 * @throws IOException File read, network, and other errors
	 * @throws InterruptedException User presses Ctrl-C
	 */
	public void run(double dmax, int imax, boolean debug) throws IOException, InterruptedException {
		logger.info("Running");
		
		final double socialDecay = 0.15;

		// Load the social network
		// followed, follower rdd
		JavaPairRDD<Integer, Integer> edges = getSocialNetwork(Config.SMALL_SOCIAL_NET_PATH);
		
		JavaRDD<Integer> sinks = getSinks(edges);
		
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
		System.out.println("Added " + backlinks.count() + " backlinks");
		
		// Create adjacency list through a union of old edge list and new edge list
		// Store neighbor list and outdegree
		JavaPairRDD<Integer, Tuple2<Iterable<Integer>, Integer> > adjList = edges
				.union(backlinks)
				.groupByKey()
				.mapValues(neighbors -> {
					int len = 0;
					for (Integer node : neighbors) {
						len++;
					}
					return new Tuple2<Iterable<Integer>, Integer>(neighbors, len);
				});
		
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
			
			JavaPairRDD<Integer, Double> transfer = state.flatMapToPair(tup -> {
				List<Tuple2<Integer, Double> > list = new ArrayList<>();
				Double val = (Double)tup._2._1.getAs("new_rank") / ((Integer)tup._2._1.getAs("len")).doubleValue();
				for (Integer neighbor : tup._2._2) {
					list.add(new Tuple2<>(neighbor, val));
				}
				return list.iterator();
			});
			
			JavaPairRDD<Integer, Tuple2<Iterable<Tuple2<Row, Iterable<Integer> > >, Iterable<Double> > > cg = state.cogroup(transfer);
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
				System.out.println(debugRDD.collect());
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
			//System.out.println(tup._2 + " " + tup._1);
		});
			
		logger.info("*** Finished social network ranking! ***");
	}


	/**
	 * Graceful shutdown
	 */
	public void shutdown() {
		logger.info("Shutting down");
		DynamoConnector.shutdown();

		if (spark != null)
			spark.close();
	}
	

}