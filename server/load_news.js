/* This code loads the news articles into a DynamoDB table. Partition key is index (line number) */

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var db = new AWS.DynamoDB();
var async = require('async');
const fs = require('fs');
const readline = require('readline');
var stemmer = require('porter-stemmer').stemmer;

/*
{
  "link": "https://www.huffpost.com/entry/covid-boosters-uptake-us_n_632d719ee4b087fae6feaac9", 
  "headline": "Over 4 Million Americans Roll Up Sleeves For Omicron-Targeted COVID Boosters", 
  "category": "U.S. NEWS", 
  "short_description": "Health experts said it is too early to predict whether demand would match up with the 171 million doses of the new boosters the U.S. ordered for the fall.", 
  "authors": "Carla K. Johnson, AP", 
  "date": "2022-09-23"
}
*/

async function createNewsTable() {
  const fileStream = fs.createReadStream('News_Category_Dataset_v3.json');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  var line_number = 0;
  for await (const line of rl) {
    var tmp = JSON.parse(line);
    var date = new Date(tmp.date);
    date.setFullYear(date.getFullYear() + 5);
    tmp.date = date.toDateString();
    tmp.index = line_number.toString();
    line_number++;
    articles.push(tmp);
  }
  console.log(articles.length);
  articles = articles.map(data => {
    let item = {};
    for (var key in data) {
      if (key === 'index') {
        item[key] = { N: data[key] }
      } else {
        item[key] = {
          S: data[key]
        };
      }
    }
    return item;
  });
  var params = {
    RequestItems: {
      "news": []
    }
  }
  articles.forEach(article => {
    params.RequestItems.news.push({
      PutRequest: {
        Item: article
      }
    })
    if (params.RequestItems.news.length == 25) {
      var processItemsCallback = function (err, data) {
        if (err) {
          console.log('error: ' + err);
        } else {
          var params = {
            RequestItems: {
              "news": []
            }
          };
          params.RequestItems.news = data.UnprocessedItems.news;
          if (!params.RequestItems || !params.RequestItems.news || params.RequestItems.news.length === 0) {
            return;
          } else {
            var now = new Date().getTime();
            while (new Date().getTime() < now + 200);
            db.batchWriteItem(params, processItemsCallback);
          }
        }
      };
      db.batchWriteItem(params, processItemsCallback);
      params = {
        RequestItems: {
          "news": []
        }
      };
    }
  });
}

// createNewsTable();

async function createNewsSearchTable() {
  var stopWords = new Set();
  const fileStream1 = fs.createReadStream('nlp_en_stop_words.txt');

  const r2 = readline.createInterface({
    input: fileStream1,
    crlfDelay: Infinity
  });

  for await (const line of r2) {
    stopWords.add(line);
  }

  const fileStream = fs.createReadStream('News_Category_Dataset_v3.json');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  var line_number = 0;
  var dict = {};
  for await (const line of rl) {
    var tmp = JSON.parse(line);
    var date = new Date(tmp.date);
    date.setFullYear(date.getFullYear() + 5);
    tmp.date = date.toDateString();
    var headline = tmp.headline;
    const keywords = headline.split(' ');
    var distinct = new Set();
    for (var keyword of keywords) {
      keyword = stemmer(keyword.toLowerCase());
      if (!keyword || keyword.length == 0 || /[^a-z]/.test(keyword) || stopWords.has(keyword)) {
        continue;
      } else if (distinct.has(keyword)) {
        continue;
      }
      distinct.add(keyword);
      if (!dict[keyword]) {
        dict[keyword] = [];
      }
      dict[keyword].push([tmp.date, line_number.toString()]);
    }
    line_number++;
  }
  var params = {
    RequestItems: {
      "search": []
    }
  }
  console.log(Object.keys(dict).length);
  for (const key of Object.keys(dict)) {
    var sorted = dict[key].sort(function (a, b) {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    var item = {};
    item['keyword'] = { S: key };
    item['type'] = { S: 'news' };
    item['data'] = { L: sorted.map(l => { return { M: { 'index': { 'N': l[1] }, 'date': { 'S': l[0] } } } }) };

    params.RequestItems.search.push({
      PutRequest: {
        Item: item
      }
    })

    if (params.RequestItems.search.length == 25) {
      var processItemsCallback = function (err, data) {
        if (err) {
          console.log('error: ' + err);
        } else {
          params = {
            RequestItems: {
              "search": []
            }
          };
          params.RequestItems.search = data.UnprocessedItems.search;
          if (!params.RequestItems || !params.RequestItems.search || params.RequestItems.search.length === 0) {
            return;
          } else {
            var now = new Date().getTime();
            while (new Date().getTime() < now + 200);
            db.batchWriteItem(params, processItemsCallback);
          }
        }
      };
      db.batchWriteItem(params, processItemsCallback);
      params = {
        RequestItems: {
          "search": []
        }
      };
    }
  }

  var processItemsCallback = function (err, data) {
    if (err) {
      console.log('error: ' + err);
    } else {
      params = {
        RequestItems: {
          "search": []
        }
      };
      params.RequestItems.search = data.UnprocessedItems.search;
      if (!params.RequestItems || !params.RequestItems.search || params.RequestItems.search.length === 0) {
        return;
      } else {
        var now = new Date().getTime();
        while (new Date().getTime() < now + 200);
        db.batchWriteItem(params, processItemsCallback);
      }
    }
  };
  db.batchWriteItem(params, processItemsCallback);
}

// createNewsSearchTable();

/* The function below checks whether a table with the above name exists, and if not,
   it creates such a table with a hashkey called 'keyword', which is a string. 
   Notice that we don't have to specify the additional columns in the schema; 
   we can just add them later. (DynamoDB is not a relational database!) */

var initTable = function (tableName, keyName, callback) {
  db.listTables(function (err, data) {
    if (err) {
      console.log(err, err.stack);
      callback('Error when listing tables: ' + err, null);
    } else {
      console.log("Connected to AWS DynamoDB");

      var tables = data.TableNames.toString().split(",");
      console.log("Tables in DynamoDB: " + tables);
      if (tables.indexOf(tableName) == -1) {
        console.log("Creating new table '" + tableName + "'");

        var params = {
          AttributeDefinitions:
            [
              {
                AttributeName: keyName,
                AttributeType: 'N'
              }
            ],
          KeySchema:
            [
              {
                AttributeName: keyName,
                KeyType: 'HASH'
              }
            ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 20,       // DANGER: Don't increase this too much; stay within the free tier!
            WriteCapacityUnits: 500       // DANGER: Don't increase this too much; stay within the free tier!
          },
          TableName: tableName /* required */
        };

        db.createTable(params, function (err, data) {
          if (err) {
            console.log(err)
            callback('Error while creating table ' + tableName + ': ' + err, null);
          }
          else {
            console.log("Table is being created; waiting for 20 seconds...");
            setTimeout(function () {
              console.log("Success");
              callback(null, 'Success');
            }, 20000);
          }
        });
      } else {
        console.log("Table " + tableName + " already exists");
        callback(null, 'Success');
      }
    }
  });
}