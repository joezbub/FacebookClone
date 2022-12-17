package edu.upenn.cis.nets2120.hw3.livy;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.apache.commons.io.output.ClosedOutputStream;
import org.apache.hadoop.shaded.com.google.common.math.PairedStatsAccumulator;
import org.apache.livy.LivyClient;
import org.apache.livy.LivyClientBuilder;

import edu.upenn.cis.nets2120.config.Config;

public class ComputeRanksLivy {
	public static void main(String[] args) throws IOException, URISyntaxException, InterruptedException, ExecutionException {
		
		LivyClient client = new LivyClientBuilder()
				  .setURI(new URI("http://ec2-18-215-33-176.compute-1.amazonaws.com:8998"))
				  .build();

		try {
			String jar = "target/nets2120-hw3-0.0.1-SNAPSHOT.jar";
			
		  System.out.printf("Uploading %s to the Spark context...\n", jar);
		  client.uploadJar(new File(jar)).get();
		  
		  String sourceFile = Config.SOCIAL_NET_PATH;

		  System.out.printf("Running SocialRankJob with %s as its input (with backlinks)...\n", sourceFile);
		  List<MyPair<Integer,Double>> result1 = client.submit(new SocialRankJob(true, sourceFile)).get();
		  System.out.println("With backlinks: " + result1);

		  System.out.printf("Running SocialRankJob with %s as its input (without backlinks)...\n", sourceFile);
		  List<MyPair<Integer,Double>> result2 = client.submit(new SocialRankJob(false, sourceFile)).get();
		  System.out.println("Without backlinks: " + result2);
		  
		  File file = new File("results1.txt");
		  BufferedWriter output = new BufferedWriter(new FileWriter(file));
		  
		  // Use hash map to count frequency of node ids
		  Map<Integer, Integer> count = new HashMap<>();
		  result1.stream().forEach(pair -> {
			 if (!count.containsKey(pair.left)) {
				 count.put(pair.left, 0);
			 }
			 count.put(pair.left, count.get(pair.left) + 1);
		  });
		  result2.stream().forEach(pair -> {
				 if (!count.containsKey(pair.left)) {
					 count.put(pair.left, 0);
				 }
				 count.put(pair.left, count.get(pair.left) + 1);
			  });
		  List<Integer> commonIDs = new ArrayList<>();
		  for (Entry<Integer, Integer> entry : count.entrySet()) {
			  // If frequency is 2, node is common to both lists
			  if (entry.getValue() == 2) {
				  commonIDs.add(entry.getKey());
			  }
		  }
		  
		  // Filter out nodes not in commonIDs list
		  List<Integer> exclusive1 = result1
				  .stream()
				  .map(pair -> {
					  return pair.left;
				  })
				  .filter(id -> {
					  return !commonIDs.contains(id);
				  })
				  .collect(Collectors.toList());
				  
		  List<Integer> exclusive2 = result2
				  .stream()
				  .map(pair -> {
					  return pair.left;
				  })
				  .filter(id -> {
				      return !commonIDs.contains(id);
				  })
				  .collect(Collectors.toList());
				
		  output.write("Nodes in both lists: " + commonIDs.toString() + "\n");
		  output.write("Nodes exclusive to backlinks computation: " + exclusive1.toString() + "\n");
		  output.write("Nodes exclusive to non-backlinks computation: " + exclusive2.toString() + "\n");
		  output.close();
		} finally {
		  client.stop(true);
		}
	}

}
