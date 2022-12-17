package edu.upenn.cis.nets2120.hw3;

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
				  .setURI(new URI("http://ec2-44-192-23-123.compute-1.amazonaws.com:8998"))
				  .build();

		try {
			String jar = "target/nets2120-hw3-0.0.1-SNAPSHOT.jar";
			
		  System.out.printf("Uploading %s to the Spark context...\n", jar);
		  client.uploadJar(new File(jar)).get();
		  
		  String sourceFile = "s3://newsdataset-nets2120/News_Category_Dataset_v3.json";

		  System.out.printf("Running SocialRankJob with %s as its input (with backlinks)...\n", sourceFile);
		  Integer result1 = client.submit(new SocialRankJob(sourceFile)).get();
		  System.out.println(result1);

		 
		} finally {
		  client.stop(true);
		}
	}

}
