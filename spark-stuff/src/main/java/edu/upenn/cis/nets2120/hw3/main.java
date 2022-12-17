package edu.upenn.cis.nets2120.hw3;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.StructType;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import edu.upenn.cis.nets2120.config.Config;
import edu.upenn.cis.nets2120.storage.SparkConnector;
import scala.Tuple2;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.HashMap;

public class main {	

	static Logger logger = LogManager.getLogger(ComputeRanks.class);
	
	public static void main(String[] args) {
		//double dmax = 30;
		//int imax = 25;
		//boolean debug = false;
		//if (args.length >= 1) {
		//	dmax = Double.valueOf(args[0]);
		//}
		//if (args.length >= 2) {
		//	imax = Integer.valueOf(args[1]);
		//}
		//if (args.length >= 3) {
		//	debug = true;
		//}
		
		
		
		final ComputeRanks cr = new ComputeRanks();
		
		try {
			cr.initialize();

			JavaPairRDD<String, HashMap<String, Double>> res = cr.getCategories("News_Category_Dataset_v3.json");
			
			//res.sample(false, 0.001).foreach(x -> System.out.println(x));
			
			
		} catch (final IOException ie) {
			logger.error("I/O error: ");
			ie.printStackTrace();
		} catch (final InterruptedException e) {
			e.printStackTrace();
		} finally {
			cr.shutdown();
		}
	}
}