var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var db = new AWS.DynamoDB();

/*
Database method to verify login credentials. Accesses users table and checks if 
inputUsername is a key and verifies inputPassword is identical to the password.
*/
var myDB_verifyLoginCredentials = function (inputUsername, inputPassword, callback) {
  console.log('Checking users table for account: ' + inputUsername + ' ' + inputPassword);
  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: inputUsername }]
      }
    },
    TableName: "users",
    AttributesToGet: ['password']
  };

  db.query(params, function (err, data) {
    if (err || data.Items.length == 0) {
      callback("Unable to find user", null);
    } else if (data.Items[0].password.S !== inputPassword) {
      callback("Incorrect password", null);
    } else {
      callback(null, "Success");
    }
  });
}

/*
Database method to create user account in users table. Verifies username does not already exist.
*/
var myDB_createAccount = function (inputUsername, inputPassword, inputFullName, inputAddress, inputAffiliation, inputBirthday, inputDate, inputNews, callback) {
  console.log('Creating account: ' + inputUsername);
  var paramsLookup = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: inputUsername }]
      }
    },
    TableName: "users"
  };

  const account = {
    "username": { S: inputUsername },
    "password": { S: inputPassword },
    "fullname": { S: inputFullName },
    "email": { S: inputAddress },
    "affiliation": { S: inputAffiliation },
    "birthday": { S: inputBirthday },
    "date": { N: inputDate },
    "news": { L: inputNews }
  };

  var paramsCreate = {
    Item: account,
    TableName: "users",
    ReturnValues: 'NONE'
  };

  db.query(paramsLookup, function (err, data) {
    if (err) {
      callback(err, null);
    } else if (data.Items.length > 0) { // Non-zero items have username as key
      callback("Username is already in use", null);
    } else {
      db.putItem(paramsCreate, function (err, data1) {
        if (err)
          callback(err, null);
        else
          callback(null, "Success");
      });
    }
  });
}

/*
Updates a specified user attribute
*/
var myDB_updateUserAttribute = function (username, attribute, value, callback) {
  const params = {
    TableName: "users",
    Key: {
      "username": { S: username }
    },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeNames: {
      "#attr": attribute
    },
    ExpressionAttributeValues: {
      ":val": value
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

/*
Gets a specific user from the database.
*/
var myDB_getUserAttributes = function (username, callback) {
  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: username }]
      }
    },
    TableName: "users"
  };

  db.query(params, function (err, data) {
    if (err || data.Items.length == 0) {
      callback("Unable to get user", null);
    } else {
      callback(null, data.Items[0]);
    }
  });
}

/*
Database method to get list associated with keyword from search table.
*/
var myDB_getSearchMatchList = function (keyword, type) {
  var params = {
    KeyConditions: {
      keyword: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: keyword }]
      },
      type: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: type }]
      }
    },
    TableName: "search"
  };
  return db.query(params).promise();
}

/*
Database method to get all notifications for a specific user.
*/
var myDB_getNotifications = function (username, callback) {
  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: username }]
      }
    },
    ScanIndexForward: false,
    TableName: "notifications"
  };
  db.query(params, function (err, data) {
    if (err) {
      callback("Unable to get notifications", null);
    } else {
      callback(null, data.Items);
    }
  });
}

/*
Database method to add a notification to notifications table.
*/
var myDB_sendNotification = function (username, other, type, message, timestamp, uuid, name, people, callback) {
  const notification = {
    "username": { S: username },
    "timestamp": { N: timestamp },
    "uuid": { S: uuid },
    "other": { S: other },
    "type": { S: type },
    "message": { S: message }
  };

  if (name) {
    notification['name'] = { S: name };
  }
  if (people) {
    notification['people'] = { S: people };
  }

  var paramsCreate = {
    Item: notification,
    TableName: "notifications",
    ReturnValues: 'NONE'
  };

  db.putItem(paramsCreate, function (err, data) {
    if (err)
      callback(err, null);
    else
      callback(null, "Success");
  });
}

/*
Database method to delete notification from notifications table
*/
var myDB_deleteNotification = function (username, timestamp, uuid, callback) {
  const params = {
    TableName: "notifications",
    Key: {
      username: { S: username },
      timestamp: { N: timestamp }
    },
    ConditionExpression: "#attr1 = :val1",
    ExpressionAttributeNames: {
      "#attr1": "uuid",
    },
    ExpressionAttributeValues: {
      ":val1": { S: uuid },
    }
  }
  db.deleteItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback('Unable to delete notification', null);
    } else {
      callback(null, 'Success');
    }
  });
}

/*
Database method to add other to me's friend list
*/
var myDB_addFriend = function (me, other, callback) {
  var params = {
    TableName: "users",
    Key: {
      "username": { S: me }
    },
    UpdateExpression: "SET #f = list_append(if_not_exists(#f, :empty_list), :vals)",
    ExpressionAttributeNames: {
      "#f": "friends"
    },
    ExpressionAttributeValues: {
      ":vals": { L: [{ S: other }] },
      ":empty_list": { L: [] }
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      callback('Cannot update friends list', null);
    } else {
      callback(null, data.Attributes);
    }
  });
}

/*
Database method to remove other from me's friend list
*/
var myDB_deleteFriend = function (me, index, callback) {
  var params = {
    TableName: "users",
    Key: {
      "username": { S: me }
    },
    UpdateExpression: "REMOVE #f[" + index + "]",
    ExpressionAttributeNames: {
      "#f": "friends"
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback('Cannot remove item from friends list', null);
    } else {
      callback(null, data.Attributes);
    }
  });
}

/*
Database method to remove other from me's friend list
*/
var myDB_createPost = function (pk, sk, type, creator, recipient, wall, title, desc, date, commentroot, imageid) {
  var post = {
    'viewer': { S: pk },
    'timestamp': { S: sk },
    'type': { S: type },
    'creator': { S: creator },
    'recipient': { S: recipient },
    'title': { S: title },
    'description': { S: desc },
    'date': { S: date },
    'commentroot': { S: commentroot },
    'imageid': { S: imageid }
  }
  if (wall) {
    post['wall'] = { S: wall };
  }
  var params = {
    TableName: "posts",
    Item: post,
    ReturnValues: 'NONE'
  };
  return db.putItem(params).promise();
}

/*
Database method to query home page posts
*/
var myDB_queryPostViewers = function (username, timestamp, callback) {
  var params = {
    KeyConditionExpression: "#pk = :viewer AND #sk < :timestamp",
    ExpressionAttributeNames: {
      '#pk': 'viewer',
      '#sk': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':viewer': { S: username },
      ':timestamp': { S: timestamp }
    },
    ScanIndexForward: false,
    TableName: "posts",
    Limit: 5
  };
  db.query(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.Items);
    }
  });
}

/*
Database method to query wall posts
*/
var myDB_queryPostWall = function (username, timestamp, callback) {
  var params = {
    KeyConditionExpression: "#pk = :wall AND #sk < :timestamp",
    ExpressionAttributeNames: {
      '#pk': 'wall',
      '#sk': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':wall': { S: username },
      ':timestamp': { S: timestamp }
    },
    ScanIndexForward: false,
    TableName: "posts",
    IndexName: "wall-timestamp-index",
    Limit: 5
  };
  db.query(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.Items);
    }
  });
}

/*
Database method to add username to like list. Return list.
*/
var myDB_likeComment = function (username, id, type, callback) {
  const params = {
    TableName: "comments",
    Key: {
      "uuid": { S: id }
    },
    UpdateExpression: "set #likes = list_append(if_not_exists(#likes, :empty_list), :val), #t = :type",
    ExpressionAttributeNames: {
      "#likes": 'likes',
      "#t": 'type'
    },
    ExpressionAttributeValues: {
      ":val": { L: [{ S: username }] },
      ":empty_list": { L: [] },
      ":type": { S: type }
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data.Attributes.likes.L);
    }
  });
}

/*
Database method to remove user from likes list. Return list.
*/
var myDB_undoLike = function (id, index, callback) {
  var params = {
    TableName: "comments",
    Key: {
      "uuid": { S: id }
    },
    UpdateExpression: "REMOVE #likes[" + index + "] ",
    ExpressionAttributeNames: {
      "#likes": "likes"
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback('Cannot remove user from likes', null);
    } else {
      callback(null, data.Attributes.likes.L);
    }
  });
}

/*
Database method to get comment item from db
*/
var myDB_getComment = function (id, callback) {
  var params = {
    KeyConditionExpression: "#id = :val",
    ExpressionAttributeNames: {
      '#id': 'uuid',
    },
    ExpressionAttributeValues: {
      ':val': { S: id }
    },
    TableName: "comments",
  };
  db.query(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else if (data.Items.length === 0) {
      callback(null, null);
    } else {
      callback(null, data.Items[0]);
    }
  });
}

/*
Database method to get children of comment through GSI
*/
var myDB_getChildrenOfComment = function (id, callback) {
  var params = {
    KeyConditionExpression: "#pk = :parent",
    ExpressionAttributeNames: {
      '#pk': 'parentuuid'
    },
    ExpressionAttributeValues: {
      ':parent': { S: id }
    },
    TableName: "comments",
    IndexName: "parentuuid-timestamp-index",
    // Limit: 20
  };
  db.query(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.Items);
    }
  });
}

/*
Database method to create comment
*/
var myDB_createComment = function (id, parent, author, message, date, timestamp, level, type, callback) {
  var comment = {
    'uuid': { S: id },
    'timestamp': { S: timestamp },
    'likes': { L: [] },
    'replies': { N: '0' },
    'date': { S: date },
    'level': { N: '0' },
    'type': { S: type },
    'deleted': { S: 'false' }
  }
  if (parent) {
    comment['parentuuid'] = { S: parent };
  }
  if (author) {
    comment['author'] = { S: author };
  }
  if (message) {
    comment['message'] = { S: message };
  }
  if (level) {
    comment['level'] = { N: level };
  }
  var params = {
    TableName: "comments",
    Item: comment,
    ReturnValues: 'NONE'
  };
  return db.putItem(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "Success");
    }
  });
}

/*
Database method to update a comment's user-specified attribute
*/
var myDB_updateParentAttributes = function (id, attr, value, callback) {
  const params = {
    TableName: "comments",
    Key: {
      "uuid": { S: id }
    },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeNames: {
      "#attr": attr
    },
    ExpressionAttributeValues: {
      ":val": value
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback('Unable to update comment', null);
    } else {
      callback(null, data);
    }
  });
}

/*
Database method to add keyword to search table
*/
var myDB_addKeywordToSearch = function (prefix, type, data) {
  const params = {
    TableName: "search",
    Key: {
      "keyword": { S: prefix },
      "type": { S: type }
    },
    UpdateExpression: "SET #data = list_append(if_not_exists(#data, :empty_list), :val)",
    ExpressionAttributeNames: {
      "#data": 'data'
    },
    ExpressionAttributeValues: {
      ":val": { L: [data] },
      ":empty_list": { L: [] }
    },
    ReturnValues: "NONE"
  };
  return db.updateItem(params).promise();
}

/*
Database method to check if chat between people exists
*/
var myDB_checkChatExists = function (people, callback) {
  var paramsLookup = {
    KeyConditionExpression: "#gsi = :people",
    ExpressionAttributeNames: {
      '#gsi': 'people'
    },
    ExpressionAttributeValues: {
      ':people': { S: people }
    },
    TableName: "chats",
    IndexName: "people-index",
  };

  db.query(paramsLookup, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      for (const chat of data.Items) {
        if (chat.type.S === 'create') {
          callback(null, "exists");
          return;
        }
      }
      callback(null, "does not exist");
    }
  });
}

/*
Database method to create a chat. First, check if people are already in a chat. If not, 
create a new chat item in chats table.
*/
var myDB_createChat = function (people, uuid, timestamp, name, type, callback) {
  const chat = {
    "uuid": { S: uuid },
    "people": { S: people },
    "timestamp": { N: timestamp },
    "name": { S: name },
    "type": { S: type }
  };

  var paramsCreate = {
    Item: chat,
    TableName: "chats",
    ReturnValues: 'NONE'
  };

  db.putItem(paramsCreate, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    }
    else {
      callback(null, uuid);
    }
  });
}

/*
Database method to add a chat id to user's chat list
*/
var myDB_addIdToUserChatList = function (person, id) {
  const params = {
    TableName: "users",
    Key: {
      "username": { S: person },
    },
    UpdateExpression: "SET #chats = list_append(if_not_exists(#chats, :empty_list), :val)",
    ExpressionAttributeNames: {
      "#chats": 'chats'
    },
    ExpressionAttributeValues: {
      ":val": { L: [{ S: id }] },
      ":empty_list": { L: [] }
    },
    ReturnValues: "NONE"
  };
  return db.updateItem(params).promise();
}

/*
Database method to leave a chat. Remove chat id from user chat list and 
remove username from chats item.
*/
var myDB_leaveChat = function (username, id, callback) {
  var paramsLookup = {
    KeyConditionExpression: "#id = :val",
    ExpressionAttributeNames: {
      '#id': 'uuid'
    },
    ExpressionAttributeValues: {
      ':val': { S: id }
    },
    TableName: "chats"
  };

  db.query(paramsLookup, function (err, data) {
    if (err || data.Items.length === 0) {
      callback("Unable to find chat with given id", null);
    } else {
      var people = JSON.parse(data.Items[0].people.S).filter(person => {
        return person !== username;
      });
      const params = {
        TableName: "chats",
        Key: {
          "uuid": { S: id }
        },
        UpdateExpression: "set #attr = :val",
        ExpressionAttributeNames: {
          "#attr": "people"
        },
        ExpressionAttributeValues: {
          ":val": { S: JSON.stringify(people) }
        },
        ReturnValues: "ALL_NEW"
      };
      db.updateItem(params, function (err, data1) {
        if (err) {
          callback(err, null);
        } else {
          console.log(data1);
          callback(null, data1);
        }
      });
    }
  });
}

/*
Database method to get a chat item
*/
var myDB_getChat = function (id) {
  var paramsLookup = {
    KeyConditionExpression: "#id = :val",
    ExpressionAttributeNames: {
      '#id': 'uuid'
    },
    ExpressionAttributeValues: {
      ':val': { S: id }
    },
    TableName: "chats"
  };

  return db.query(paramsLookup).promise();
}

/*
Database method to get messages for a particular chat
*/
var myDB_getMessages = function (id, callback) {
  var params = {
    KeyConditions: {
      uuid: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: id }]
      }
    },
    ScanIndexForward: true,
    TableName: "messages"
  };

  db.query(params, function (err, data) {
    if (err) {
      callback("Unable to get messages", null);
    } else {
      callback(null, data.Items);
    }
  });
}

/*
Database method to get a message
*/
var myDB_getMessage = function (id, timestamp, callback) {
  var params = {
    KeyConditions: {
      uuid: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: id }]
      },
      timestamp: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ N: timestamp }]
      }
    },
    TableName: "messages"
  };

  db.query(params, function (err, data) {
    if (err) {
      callback("Unable to get messages", null);
    } else {
      callback(null, data.Items[0]);
    }
  });
}

/*
Database method to update a message
*/
var myDB_updateMessage = function (id, timestamp, attribute, value, callback) {
  const params = {
    TableName: "messages",
    Key: {
      "uuid": { S: id },
      "timestamp": { N: timestamp }
    },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeNames: {
      "#attr": attribute
    },
    ExpressionAttributeValues: {
      ":val": value
    },
    ReturnValues: "ALL_NEW"
  };
  db.updateItem(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data.Attributes);
    }
  });
}

var myDB_sendMessage = function (id, author, message, timestamp, callback) {
  const messageItem = {
    "uuid": { S: id },
    "timestamp": { N: timestamp },
    "message": { S: message },
    "author": { S: author }
  };

  var paramsCreate = {
    Item: messageItem,
    TableName: "messages",
    ReturnValues: 'NONE'
  };

  db.putItem(paramsCreate, function (err, data) {
    if (err) {
      callback(err, null);
    }
    else {
      const params = {
        TableName: "chats",
        Key: {
          "uuid": { S: id }
        },
        UpdateExpression: "set #attr = :val, #attr1 = :val1",
        ExpressionAttributeNames: {
          "#attr": 'timestamp',
          "#attr1": 'preview',
        },
        ExpressionAttributeValues: {
          ":val": { N: timestamp },
          ":val1": { M: messageItem }
        },
        ReturnValues: "NONE"
      };
      db.updateItem(params, function (err1, data1) {
        if (err1) {
          console.log(err1);
          callback(err1, null);
        } else {
          callback(null, messageItem);
        }
      });
    }
  });
}

/*
Gets a specific user from the database and returns promise.
*/
var myDB_getUserAttributesPromise = function (username) {
  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: username }]
      }
    },
    TableName: "users"
  };
  return db.query(params).promise();
}

/*
Database method to get a specific article from database
*/
var myDB_getArticle = function (index) {
  var params = {
    KeyConditions: {
      index: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ N: index }]
      }
    },
    TableName: "news"
  };
  return db.query(params).promise();
}

var database = {
  verifyLoginCredentials: myDB_verifyLoginCredentials,
  createAccount: myDB_createAccount,
  updateUserAttribute: myDB_updateUserAttribute,
  getUserAttributes: myDB_getUserAttributes,
  getSearchMatchList: myDB_getSearchMatchList,
  getNotifications: myDB_getNotifications,
  sendNotification: myDB_sendNotification,
  deleteNotification: myDB_deleteNotification,
  addFriend: myDB_addFriend,
  deleteFriend: myDB_deleteFriend,
  createPost: myDB_createPost,
  queryPostViewers: myDB_queryPostViewers,
  queryPostWall: myDB_queryPostWall,
  likeComment: myDB_likeComment,
  undoLike: myDB_undoLike,
  getComment: myDB_getComment,
  getChildrenOfComment: myDB_getChildrenOfComment,
  createComment: myDB_createComment,
  updateParentAttributes: myDB_updateParentAttributes,
  getUserAttributesPromise: myDB_getUserAttributesPromise,
  addKeywordToSearch: myDB_addKeywordToSearch,
  checkChatExists: myDB_checkChatExists,
  createChat: myDB_createChat,
  addIdToUserChatList: myDB_addIdToUserChatList,
  leaveChat: myDB_leaveChat,
  getChat: myDB_getChat,
  getMessages: myDB_getMessages,
  getMessage: myDB_getMessage,
  updateMesage: myDB_updateMessage,
  sendMessage: myDB_sendMessage,
  getArticle: myDB_getArticle,
};

module.exports = database;
