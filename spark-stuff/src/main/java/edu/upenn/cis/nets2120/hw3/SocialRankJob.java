package edu.upenn.cis.nets2120.hw3;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import com.google.gson.Gson;

import org.apache.livy.Job;
import org.apache.livy.JobContext;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.StructType;
import org.apache.commons.lang3.time.DateUtils;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.SparkConnector;
import scala.Tuple2;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import java.util.Iterator;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Comparator;

import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.StructType;
import org.json.JSONObject;
import org.json.JSONArray;

import com.amazonaws.services.connectparticipant.model.*;

import edu.upenn.cis.nets2120.storage.DynamoConnector;
import scala.Tuple2;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.dynamodbv2.document.UpdateItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;

import edu.upenn.cis.nets2120.config.Config;

public class SocialRankJob implements Job<Integer> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Connection to Apache Spark
	 */
	SparkSession spark;
	
	JavaSparkContext context;
	
	DynamoDB db;
	
	Table userss;
	Table articles;

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
		
		System.err.println("Connecting to DynamoDB...");
		db = DynamoConnector.getConnection(Config.DYNAMODB_URL);
		userss = db.getTable("users");
		articles = db.getTable("comments");
		
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
	public Integer run() throws IOException, InterruptedException {
		// Read into RDD with lines as strings
				List<String> raw = context.textFile(source, Config.PARTITIONS).collect();
				
				Date today = new Date();
				
				ArrayList<Tuple2<String, String>> is = new ArrayList<>();
				ArrayList<String> nds = new ArrayList<>();
				HashMap<String, String> dateMap = new HashMap<>();
				int index = 0;
				for (String x : raw) {
					JSONObject obj = new JSONObject(x);
					String rawD = obj.getString("date");
					String modified = (Integer.parseInt(rawD.substring(0,4)) + 5) + rawD.substring(4);
					Date d;
					try {
						d = new SimpleDateFormat("yyyy-MM-dd").parse(modified);
					} catch (ParseException p) {
						throw new RuntimeException();
					}
					
					if (d.compareTo(today) <= 0 || DateUtils.isSameDay(d, today)) {
						if (DateUtils.isSameDay(d, today)) {
							is.add(new Tuple2<String, String>("a:t" + index,"c: " + obj.getString("category")));
							is.add(new Tuple2<String, String>("c: " + obj.getString("category"),"a:t" + index));
							nds.add("a:t" + index);
							nds.add("c: " + obj.getString("category"));
							dateMap.put("a:t" + index, modified);
						} else {
							is.add(new Tuple2<String, String>("a: " + index,"c: " + obj.getString("category")));
							is.add(new Tuple2<String, String>("c: " + obj.getString("category"),"a: " + index));
							nds.add("a: " + index);
							nds.add("c: " + obj.getString("category"));
							dateMap.put("a: " + index, modified);
						}
						
					}
					index++;
				}
				JavaPairRDD<String, String> file = context.parallelizePairs(is);
				JavaRDD<String> nodes = context.parallelize(nds);
				
				System.out.println(index);
		
				
				ScanSpec params = new ScanSpec()
						.withAttributesToGet("username","news","friends");
				ItemCollection<ScanOutcome> items = userss.scan(params);
				
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
					List<String> likes = item2.getList("likes");
					
				
					
					
					System.out.println(likes);
					if (likes != null) {
						for (String l : likes) {
							if (dateMap.containsKey("a:t" + item2.getString("uuid"))) {
								userArticle.add(new Tuple2<String, String>("u: " + l, "a:t" + item2.getString("uid")));
								userArticle.add(new Tuple2<String, String>("a:t" + item2.getString("uuid"), "u: " + l));
								
							} else {
								userArticle.add(new Tuple2<String, String>("u: " + l, "a: " + item2.getInt("uuid")));
								userArticle.add(new Tuple2<String, String>("a: " + item2.getString("uuid"), "u: " + l));
								
							}
							
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
					
					System.out.println(i);
					
					Map<String, HashMap<String, Double>> currWeights = startWeights.collectAsMap();
						
							int j = i;
							
							JavaPairRDD<String, HashMap<String, Double>> destinations = nodes.flatMapToPair(x -> {
							
								HashMap<String, Double> rrf = rerefactored.get(x);
								ArrayList<Tuple2<String, HashMap<String, Double>>> parts = new ArrayList<>();
								
								if (rrf != null) {
								
									for (String y : rrf.keySet()) {
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
							

							System.out.println(i);
							
							destinations = destinations.reduceByKey((a,b) -> {
								HashMap<String, Double> combined = new HashMap<>();
								for (String s : a.keySet()) {
									combined.put(s, a.get(s) + b.get(s));
								}
								return combined;
							});
							
							Map<String, Double> userSums = destinations.flatMapToPair(x -> {
								ArrayList<Tuple2<String, Double>> al = new ArrayList<>();
								for (String u : x._2.keySet()) {
									al.add(new Tuple2<String, Double>(u,x._2.get(u)));
								}
								return(al.iterator());
							}).reduceByKey((a, b) -> a+b).collectAsMap();
							
							
							
							
							destinations = destinations.mapToPair(x -> {
								HashMap<String, Double> zeroWeights = new HashMap<>();
								if (x._1.substring(0,2).equals("u:")) {
									for (String user : users) {
										if (x._1.equals(user)) {
											zeroWeights.put(user, 1.0);
										} else {
											zeroWeights.put(user, x._2.get(user) / userSums.get(user));
										}
									}
								} else {
									for (String user : users) {
										zeroWeights.put(user, x._2.get(user) / userSums.get(user));
									}
								}
								return new Tuple2<String, HashMap<String, Double>>(x._1, zeroWeights);
								
							});
							
						System.out.println(i);
						
						
					//Map<String, HashMap<String, Double>> sw = startWeights.collectAsMap();
					//Map<String, HashMap<String, Double>> dest = destinations.collectAsMap();
					
					
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
					//double max = 0.001;
					
					if (max < 0.001) {
						good = false;
					}
					
					
					startWeights = destinations.mapToPair(x -> x);
					
					i++;
					if (i == 15) {
						good = false;
					}
					
				
				}
				
				
				List<MyPair<String, HashMap<String, Double>>> last = new ArrayList<>();
				
				for (Tuple2<String, HashMap<String, Double>> e : startWeights.collect()) {
					last.add(new MyPair<String, HashMap<String, Double>>(e._1, e._2));
				}
				
				//System.out.println(i);
				
				//startWeights.sample(true,0.001).foreach(x -> System.out.println(x));
				
				JavaPairRDD<String, Tuple2<String, Double>> uw = startWeights.flatMapToPair(x -> {
						ArrayList<Tuple2<String, Tuple2<String, Double>>> w = new ArrayList<>(); 
						if (x._1.charAt(2) == 't') {
							for (String u : x._2.keySet()) {
								w.add(new Tuple2<String, Tuple2<String, Double>>(u, new Tuple2<String, Double>(x._1, x._2.get(u))));
							}
						}	
						return w.iterator();
						
				});
				
				JavaPairRDD<String, Tuple2<String, Double>> fw = startWeights.flatMapToPair(x -> {
					ArrayList<Tuple2<String, Tuple2<String, Double>>> w = new ArrayList<>(); 
					if (x._1.charAt(0) == 'a') {
						for (String u : x._2.keySet()) {
							if (x._2.get(u) > 0.0001) {
								w.add(new Tuple2<String, Tuple2<String, Double>>(u, new Tuple2<String, Double>(x._1, x._2.get(u))));
							}
						}
					}	
					
					
					
					return w.iterator();
					
			});
				
				
				//for (Tuple2<String, Tuple2<String, Double>> x : fw.collect()) {
				//	if (Math.random() < 0.01) {
				//		System.out.println(x._2._2);
				//	}
				//}
				
				
				JavaPairRDD<String, HashMap<String, String>> userWeights = uw.combineByKey(
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
				}).mapToPair(x -> {
						int count = 0;
						Double sum = 0.0;
						for (String s : x._2.keySet()) {
							count++;
							sum += x._2.get(s);
						}
						HashMap<String, String> hm = new HashMap<>();
						for (String s : x._2.keySet()) {
							if (sum == 0) {
								hm.put(s, Double.toString(1.0/count));
							} else {
								hm.put(s, Double.toString(x._2.get(s)/sum));
							}
						}
						return new Tuple2<String, HashMap<String, String>>(x._1.substring(3), hm);
				});
				
				JavaPairRDD<String, HashMap<String, String>> fullWeights = fw.combineByKey(
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
				}).mapToPair(x -> {
						int count = 0;
						Double sum = 0.0;
						for (String s : x._2.keySet()) {
							count++;
							sum += x._2.get(s);
						}
						HashMap<String, String> hm = new HashMap<>();
						for (String s : x._2.keySet()) {
							if (sum == 0) {
								hm.put(s, String.format("%.6f", 1.0/count));
								//hm.put(s, Double.toString(1.0/count));
							} else {
								hm.put(s, String.format("%.6f", x._2.get(s)/sum));
								//hm.put(s, Double.toString(x._2.get(s)/sum));
							}
						}
						return new Tuple2<String, HashMap<String, String>>(x._1.substring(3), hm);
				});
				
				//for (Tuple2<String,Tuple2<HashMap<String, String>,HashMap<String, String>>> s : userWeights.join(fullWeights).collect()) {
				//	for (String t : s._2._2.keySet()) {
				//		if (Math.random() < 0.01) {
				//			System.out.println(s._2._2.get(t));
				//		}	
				//	}
				//	System.out.println("___________");
				//	
				//}
				
				
				JavaPairRDD<String, HashMap<String, HashMap<String, String>>> c2 = userWeights.join(fullWeights)
						.mapToPair(x -> {
							HashMap<String, HashMap<String, String>> cval = new HashMap<>();
							for  (String oa : x._2._2.keySet()) {
								HashMap<String, String> weightType = new HashMap<>();
								if (x._2._1.containsKey(oa)) {
									weightType.put("today", x._2._1.get(oa));
									weightType.put("old", x._2._2.get(oa));
									weightType.put("date", dateMap.get(oa));
									cval.put(oa.substring(3), weightType);
								} else {
									
									weightType.put("old", x._2._2.get(oa));
									weightType.put("today", "0");
									weightType.put("date", dateMap.get(oa));
									cval.put(oa.substring(3), weightType);
								}
								
								
							}
							for  (String oa : x._2._1.keySet()) {
								HashMap<String, String> weightType = new HashMap<>();
								if (!(x._2._2.containsKey(oa))) {
									weightType.put("today", x._2._1.get(oa));
									weightType.put("old", "0");
									weightType.put("date", dateMap.get(oa));
									cval.put(oa.substring(3), weightType);
								}
								
							}
							return new Tuple2<String, HashMap<String, HashMap<String, String>>>(x._1, cval);
							
						});
				
				
						
				for (Tuple2<String, HashMap<String, HashMap<String, String>>> x : c2.collect()) {
					System.out.println(x._2.size());
					for (HashMap<String, String> h : x._2.values()) {
						if (Math.random() < 0.001) {
							System.out.println(h);
						}
					}
					UpdateItemSpec uis = new UpdateItemSpec()
							.withPrimaryKey("username", x._1)
							.withUpdateExpression("set weights = :m")
							.withValueMap(new ValueMap()
									.withMap(":m", x._2));
					UpdateItemOutcome uio = userss.updateItem(uis);
				}
				
				Thread.sleep(20000);
				
				
				
				
				
				return -1;		
			}

	/**
	 * Graceful shutdown
	 */
	public void shutdown() {
		DynamoConnector.shutdown();

		if (spark != null) {
			spark.close();
		}	
		System.err.println("Shutting down");
	}
	
	public SocialRankJob(String source) {
		System.setProperty("file.encoding", "UTF-8");
		
		this.source = source;
	}

	@Override
	public Integer call(JobContext arg0) throws Exception {
		initialize();
		return run();
	}

}