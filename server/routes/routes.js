var db = require('../models/database.js');
var s3 = require('../models/s3.js');
var crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
var stemmer = require('porter-stemmer').stemmer;
var fs = require('fs');
const readline = require('readline');
const jsdom = require("jsdom");

const accountSid = 'ACe319d0be5bdb7dc915fe4738b1b18498';
const authKey = '721e4645dd9dcaab7e7c006e7c423e0f';

var stopWords = new Set();
const fileStream = fs.createReadStream('nlp_en_stop_words.txt');

const rl = readline.createInterface({
  input: fileStream,
});

rl.on('line', (line) => {
  stopWords.add(line);
});

const client = require('twilio')(accountSid, authKey)

/*
This route checks login credentials by accessing the users table. Sets active attribute to 1.
*/
var login = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password) {
    res.status(400).send('Missing input fields');
  } else {
    var hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
    db.verifyLoginCredentials(username, hash, function (err, data) {
      if (err) {
        res.status(500).send(err);
      } else {
        req.session.name = username;
        db.updateUserAttribute(username, 'active', { N: "1" }, function (err, data1) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.sendStatus(200);
          }
        });
      }
    });
  }
};

var addPrefixes = function (fullName, username, type) {
  var promises = []
  for (var i = 0; i < fullName.length; ++i) {
    var prefix = fullName.substring(0, i + 1);
    promises.push(db.addKeywordToSearch(prefix.toLowerCase(), type, { M: { "username": { S: username }, "fullname": { S: fullName } } }));
  }
  return promises;
}

/*
This route creates an account if input passes all checks. Sets active attribute to 1.
*/
var createAccount = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var fullName = req.body.fullname;
  var email = req.body.address;
  var affiliation = req.body.affiliation;
  var birthday = req.body.birthday;
  var news = req.body.news;
  console.log(news);
  if (!username || !password || !fullName || !email || !affiliation || !birthday || !news) {
    res.status(400).send('Missing input fields');
  } else {
    var hash = crypto.createHash('sha256').update(password).digest('hex');
    var date = new Date().getTime().toString();
    news = news.map(item => {
      return { "S": item };
    });
    db.createAccount(username, hash, fullName, email, affiliation, birthday, date, news, function (err, data) {
      if (!data) {
        res.status(500).send(err);
      } else {
        req.session.name = username;
        db.updateUserAttribute(username, 'active', { N: "1" }, function (err, data1) {
          if (err) {
            res.status(500).send(err);
          } else {
            var promises = addPrefixes(fullName, username, "user");
            Promise.all(promises)
              .then(data => res.sendStatus(200))
              .catch(err => res.status(500).send(err));
          }
        });
      }
    });
  }
};

/*
Add prefixes of user fullname to search table
*/
var addPrefix = function (req, res) {
  const username = req.body.username;
  db.getUserAttributes(username, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      var promises = addPrefixes(data.fullname.S, username, "user");
      Promise.all(promises)
        .then(data => res.sendStatus(200))
        .catch(err => res.status(500).send(err));
    }
  });
}

/*
This route logs out the user by removing the username from the session. Sets active attribute to 0.
*/
var logout = function (req, res) {
  console.log("Logging out");
  const username = req.body.username;
  db.updateUserAttribute(username, 'active', { N: "0" }, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      req.session.name = null;
      res.sendStatus(200);
    }
  });
};

/*
This route changes a user attribute specified in the request body.
*/
var changeAccount = function (req, res) {
  const username = req.body.username;
  const attr = req.body.attribute;
  const value = req.body.value;
  let data;
  if (attr === 'password') {
    data = { S: crypto.createHash('sha256').update(value).digest('hex') };
  } else if (attr === 'email') {
    data = { S: value };
  } else if (attr === 'affiliation') {
    data = { S: value };
  } else if (attr === 'news') {
    data = {
      L: value.map(item => {
        return { "S": item };
      })
    };
  };
  db.updateUserAttribute(username, attr, data, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(user);
    }
  });
};

/*
This route gets current logged in user's attributes.
*/
var getUser = function (req, res) {
  const username = req.query.username;
  if (!username) {
    res.status(400).send("No username specified");
  } else {
    db.getUserAttributes(username, function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.json(data);
      }
    });
  }
};

/*
This route searches all the user full names for a substring and news feed articles.
*/
var search = function (req, res) {
  var prefix = req.query.string;
  var type = req.query.type;
  if (!prefix || prefix === "") {
    res.json([]);
    return;
  }
  if (type === 'user') {
    db.getSearchMatchList(prefix.toLowerCase(), "user")
      .then(data => {
        if (data.Items.length === 0 || !data.Items[0].data) {
          res.json([]);
        } else {
          res.json(data.Items[0].data.L.slice(0, 5));
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Unable to search users")
      });
  } else {
    var username = req.query.username;
    var page = parseInt(req.query.page);
    db.getUserAttributes(username, function (err, user) {
      if (err) {
        res.status(500).send('Unable to get user attributes');
      } else {
        var weights = user.weights?.M || {};
        var words = prefix.split(' ');
        var finalWords = [];
        for (var word of words) {
          word = stemmer(word.toLowerCase());
          if (word && word.length > 0 && !stopWords.has(word)) {
            finalWords.push(stemmer(word.toLowerCase()));
          }
        }
        var promises = [];
        for (const word of finalWords) {
          promises.push(db.getSearchMatchList(word, "news"));
        }
        var freq = {};
        var today = new Date().getTime();
        Promise.all(promises)
          .then(data => {
            for (const item of data) {
              if (item.Items.length === 0) {
                continue;
              }
              for (const article of item.Items[0].data.L) {
                var date = article.M.date.S;
                var index = article.M.index.N;
                if (new Date(date).getTime() > today) {
                  break;
                }
                if (!freq[index]) freq[index] = 0;
                freq[index]++;
              }
            }
            var newsFreq = [];
            for (const key of Object.keys(freq)) {
              var weight = 0.0;
              if (weights[key]) {
                weight = parseFloat(weights[key].M.old.S);
              }
              newsFreq.push([key, freq[key], weight]);
            }
            newsFreq = newsFreq.sort(function (a, b) {
              if (b[1] === a[1]) {
                return b[2] - a[2];
              } else return b[1] - a[1];
            });
            console.log(newsFreq.slice(0, 10));
            return newsFreq.map(arr => arr[0]);
          })
          .then(indices => {
            var resultsCount = indices.length;
            var finalIndices = indices.slice((page - 1) * 5, page * 5)
            var finalPromises = [];
            finalIndices.forEach(index => finalPromises.push(getArticleHelper(index)));
            Promise.all(finalPromises)
              .then(data => {
                res.json({ data: data, count: resultsCount });
              });
          });
      }
    })
  }
}

/*
This route notifies a user that they were invited to be friends or a chat
*/
var notify = function (req, res) {
  const me = req.body.me;
  const personToNotify = req.body.other;
  const type = req.body.type;
  if (me === personToNotify) {
    res.status(400).send('Cannot notify self');
  } else if (type === 'friend') {
    db.getUserAttributes(me, function (err, data) {
      if (err) {
        res.status(500).send(err);
      }
      var alreadyFriends = false;
      if (data.friends) {
        for (const item of data.friends.L) {
          if (item.S === personToNotify) {
            alreadyFriends = true;
            break;
          }
        }
      }
      if (alreadyFriends) {
        res.status(400).send('Already friends');
      } else {
        db.getNotifications(personToNotify, function (err1, data1) {
          if (err1) {
            res.status(500).send(err1);
          } else {
            const ind = data1.findIndex(item => {
              return (item.other.S === me && item.type.S === type);
            });
            if (ind >= 0) {
              res.status(400).send('Already notified');
            } else {
              db.getNotifications(me, function (err2, data2) {
                if (err2) {
                  res.status(500).send(err2);
                } else {
                  const ind1 = data2.findIndex(item => {
                    return (item.other.S === personToNotify && item.type.S === type);
                  });
                  if (ind1 >= 0) {
                    res.status(400).send('Other person already notified you');
                  } else {
                    const meFullName = data.fullname.S;
                    const message = meFullName + ' wants to be friends with you';
                    const uuid = uuidv4();
                    const timestamp = new Date().getTime().toString();
                    db.sendNotification(personToNotify, me, type, message, timestamp, uuid, null, null, function (err2, data2) {
                      if (err2) {
                        res.status(500).send('Unable to make notification');
                      } else {
                        res.sendStatus(200);
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    });
  } else if (type === 'create') { // direct chat
    var people = [me, personToNotify];
    people = people.sort();
    console.log(JSON.stringify(people));
    db.checkChatExists(JSON.stringify(people), function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send('Unable to check if chat exists already');
      } else {
        if (data === 'exists') {
          res.status(400).send('A chat already exists between the two users');
          return;
        }
        db.getUserAttributes(me, function (err1, data1) {
          if (err1) {
            res.status(500).send(err1);
          } else {
            var message = data1.fullname.S + ' invites you to a chat';
            const uuid = uuidv4();
            const timestamp = new Date().getTime().toString();
            db.sendNotification(personToNotify, me, type, message, timestamp, uuid,
              req.body.name, JSON.stringify(people), function (err2, data2) {
                if (err2) {
                  console.log(err2);
                  res.status(500).send('Unable to make notification');
                } else {
                  res.sendStatus(200);
                }
              });
          }
        });
      }
    });
  } else {
    db.getUserAttributes(me, function (err, data) {
      if (err) {
        res.status(500).send(err);
      } else {
        var people = req.body.people;
        var message = data.fullname.S + ' invites you to a chat with ' + (people.length - 1) + ' others';
        people.push(personToNotify);
        const uuid = uuidv4();
        const timestamp = new Date().getTime().toString();
        db.sendNotification(personToNotify, me, type, message, timestamp, uuid,
          req.body.name, JSON.stringify(people), function (err1, data1) {
            if (err1) {
              console.log(err1);
              res.status(500).send('Unable to make notification');
            } else {
              res.sendStatus(200);
            }
          });
      }
    });
  }
}

/*
This route retrieves all the notifications of a user
*/
var getNotifications = function (req, res) {
  const username = req.query.username;
  db.getNotifications(username, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data);
    }
  });
}

/*
This route deletes a notification
*/
var deleteNotification = function (req, res) {
  const username = req.body.username;
  const timestamp = req.body.timestamp;
  const uuid = req.body.uuid;
  db.deleteNotification(username, timestamp, uuid, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
}

/*
This route adds two users to each other's friend list
*/
var addFriend = function (req, res) {
  const me = req.body.me;
  const other = req.body.other;
  if (me === other) {
    res.status(400).send('Cannot add self');
  } else {
    db.addFriend(other, me, function (err, data1) {
      if (err) {
        res.status(500).send(err);
      } else {
        db.addFriend(me, other, function (err, data) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(data);
          }
        });
      }
    });
  }
}

/*
Helper function for delete friend. Gets index of friend in lists.
*/
var deleteFriendGetIndex = function (meName, otherName, callback) {
  db.getUserAttributes(meName, function (err, data) {
    if (err) {
      return callback(err, null);
    } else {
      const posMe = data.friends.L.findIndex(item => item.S === otherName);
      db.getUserAttributes(otherName, function (err1, data1) {
        if (err1) {
          return callback(err, null);
        } else {
          const posOther = data1.friends.L.findIndex(item => item.S === meName);
          if (posMe >= 0 && posOther >= 0) {
            return callback(null, [posMe, posOther]);
          } else {
            return callback(err, null);
          }
        }
      });
    }
  });
}

/*
This route deletes two users from each other's friend list
*/
var deleteFriend = function (req, res) {
  const me = req.body.username;
  const other = req.body.friend;
  deleteFriendGetIndex(me, other, function (err, inds) {
    if (err) {
      res.status(500).send('Unable to find name in friend list');
    } else {
      db.deleteFriend(other, inds[1], function (err, data1) {
        if (err) {
          res.status(500).send(err);
        } else {
          db.deleteFriend(me, inds[0], function (err, data) {
            if (err) {
              res.status(500).send(err);
            } else {
              res.json(data);
            }
          });
        }
      });
    }
  });
}

/*
Helper function for create post to get all friend usernames for a person.
*/
var getAllFriends = function (username, callback) {
  db.getUserAttributes(username, function (err, data) {
    if (err) {
      return callback(err, null);
    } else if (data.friends) {
      callback(null, data.friends.L.map(friend => {
        return friend.S;
      }));
    } else {
      callback(null, []);
    }
  });
}

/*
Helper function for create post to get promises.
*/
var getPostPromisesFromDB = function (friends, timestamp, type, creator, recipient, title, description, date, commentroot, imageid) {
  var promises = [];
  for (var i = 0; i < friends.length; ++i) {
    if (i == 0) {
      promises.push(db.createPost(friends[i], timestamp, type, creator, recipient, recipient, title, description, date, commentroot, imageid));
    } else if (i == 1 && creator !== recipient) {
      promises.push(db.createPost(friends[i], timestamp, type, creator, recipient, creator, title, description, date, commentroot, imageid));
    } else {
      promises.push(db.createPost(friends[i], timestamp, type, creator, recipient, null, title, description, date, commentroot, imageid));
    }
  }
  return promises;
}

/*
This route creates a post. There are two different types of posts: 
status updates and wall posts (someone posts on someone else's wall). 
The route uses a push-based fan-out mechanism, so we create duplicate 
post items in the database, so we optimize reads.
*/
var createPost = function (req, res) {
  const creator = req.body.creator;
  const recipient = req.body.recipient;
  const title = req.body.title;
  const description = req.body.description;
  const imageid = req.body.imageid;
  const timestamp = new Date().getTime().toString() + uuidv4();
  const date = new Date().toGMTString();
  const type = (creator === recipient) ? 'status-update' : 'post';
  const commentroot = uuidv4();
  console.log(type);
  getAllFriends(creator, function (err, creatorFriends) {
    if (err) {
      res.status(500).send('Unable to get friends');
    } else {
      getAllFriends(recipient, function (err, recipFriends) {
        if (err) {
          res.status(500).send('Unable to get friends');
        } else {
          // Compute intersection of two friends lists
          creatorFriends.push(creator);
          recipFriends.push(recipient);
          var friends = [...new Set([...creatorFriends, ...recipFriends])];
          console.log("Union friends:");
          console.log(friends);
          var samplePost = { // for response
            'viewer': { S: friends[0] },
            'timestamp': { S: timestamp },
            'type': { S: type },
            'creator': { S: creator },
            'title': { S: title },
            'description': { S: description },
            'date': { S: date },
            'recipient': { S: recipient },
            'wall': { S: recipient },
            'commentroot': { S: commentroot },
            'imageid': { S: imageid }
          }
          var promises = getPostPromisesFromDB(friends, timestamp, type, creator, recipient, title, description, date, commentroot, imageid);
          Promise.all(promises)
            .then(posts => {
              res.json(samplePost);
            })
            .catch(err => res.status(500).send(err));
        }
      });
    }
  });
}

/*
Route to get home page posts for a user
*/
var homePage = function (req, res) {
  var username = req.query.username;
  var timestamp = new Date().getTime().toString();
  if (req.query.timestamp) {
    timestamp = req.query.timestamp;
  }
  db.queryPostViewers(username, timestamp, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Unable to scan posts');
    } else {
      res.json(data);
    }
  });
}

/*
Route to get wall posts for a user
*/
var wallPage = function (req, res) {
  var username = req.query.username;
  var timestamp = new Date().getTime().toString();
  if (req.query.timestamp) {
    timestamp = req.query.timestamp;
  }
  db.queryPostWall(username, timestamp, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Unable to scan posts');
    } else {
      res.json(data);
    }
  });
}

/*
Route to like a post/comment
*/
var like = function (req, res) {
  var username = req.body.username;
  var id = req.body.id;
  var type = req.body.type;
  db.likeComment(username, id, type, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Unable to like');
    } else {
      res.json(data);
    }
  });
}

/*
Route to undo a like
*/
var undoLike = function (req, res) {
  var username = req.body.username;
  var id = req.body.id;
  var type = req.body.type;
  db.getComment(id, function (err, data) {
    if (err) {
      res.status(500).send('Unable to undo like');
    } else if (!data) {
      res.status(400).send('Unable to find like');
    } else {
      var index = -1;
      if (data.likes) {
        index = data.likes.L.map(user => user.S).indexOf(username);
      }
      if (index < 0) {
        res.status(400).send('User not in likes');
      } else {
        db.undoLike(id, index, function (err1, data1) {
          if (err1) {
            console.log(err1);
            res.status(500).send('Unable to undo like');
          } else {
            res.json(data1);
          }
        });
      }
    }
  });
}

/*
Route to get comment
*/
var getComment = function (req, res) {
  var id = req.query.id;
  db.getComment(id, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Unable to get comment');
    } else if (!data) {
      res.status(400).send('Comment does not exist');
    } else {
      res.json(data);
    }
  });
}

/*
Route to get children of comment
*/
var getChildrenOfComment = function (req, res) {
  var id = req.query.id;
  db.getChildrenOfComment(id, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Unable to get children of comment');
    } else {
      res.json(data);
    }
  });
}

/*
Route to create comment
*/
var createComment = function (req, res) {
  const parentId = req.body.parent;
  const author = req.body.author;
  const message = req.body.message;
  const timestamp = new Date().getTime().toString();
  const date = new Date().toGMTString();
  const uuid = uuidv4();
  db.getComment(parentId, function (err, data) {
    var parentLevel = 0;
    var replies = 0;
    if (err || !data) {
      // parent does not exist (must be a post that doesn't have comments yet)
      // so lazily create dummy root comment node
      db.createComment(parentId, null, null, null, date, timestamp, null, "root", function (err, data) {
        if (err) {
          console.log(err);
        }
      });
    } else {
      parentLevel = parseInt(data.level.N);
      replies = parseInt(data.replies.N);
    }
    console.log(parentLevel);
    if (parentLevel === 3) {
      res.status(500).send('Comment must have depth of at most 3');
      return;
    }
    var type = (parentLevel === 0) ? 'comment' : 'reply';
    db.createComment(uuid, parentId, author, message, date, timestamp, (parentLevel + 1).toString(), type, function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        db.updateParentAttributes(parentId, 'replies', { N: (replies + 1).toString() }, function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            console.log(data);
            res.sendStatus(200);
          }
        });
      }
    });
  });
}

/*
Route to edit comment message.
*/
var editComment = function (req, res) {
  const id = req.body.id;
  const message = req.body.message;
  console.log(message);
  db.updateParentAttributes(id, 'message', { S: message }, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(data);
      res.sendStatus(200);
    }
  });
}

/*
Route to delete comment. Comment will remain in the tree but will be 
shown as deleted.
*/
var deleteComment = function (req, res) {
  const id = req.body.id;
  db.updateParentAttributes(id, 'deleted', { S: 'true' }, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(data);
      res.sendStatus(200);
    }
  });
}

/*
Helper function to add chat id to everyone's chat list
*/
var addChatToUser = function (people, id) {
  var promises = [];
  for (const person of people) {
    promises.push(db.addIdToUserChatList(person, id));
  }
  return promises;
}

/*
Route to create chat given participants
*/
var createChat = function (req, res) {
  const people = req.body.people.sort();
  var name = req.body.name;
  var type = req.body.type;
  var create = type === 'create'; // create chat vs add user. If create, must check if chat already exists 
  if (!name) {
    name = uniqueNamesGenerator({
      dictionaries: [colors, adjectives, animals],
      style: 'capital'
    });
  }
  if (people.length < 2) {
    res.status(400).send("Chat must have at least two members");
  } else {
    db.checkChatExists(JSON.stringify(people), function (err, data) {
      if (err) {
        res.status(500).send("Unable to search chats");
      } else {
        if (data === 'exists' && create) { // chat already exists
          res.json(data);
        } else {
          const timestamp = new Date().getTime().toString();
          const uuid = uuidv4();
          db.createChat(JSON.stringify(people), uuid, timestamp, name, type, function (err, data) {
            if (err) {
              res.status(500).send("Unable to create chat");
            } else {
              var promises = addChatToUser(people, uuid);
              Promise.all(promises)
                .then(data1 => res.json(uuid))
                .catch(err => res.status(500).send(err));
            }
          });
        }
      }
    });
  }
}

/*
Route to leave chat given id and username
*/
var leaveChat = function (req, res) {
  const username = req.body.username;
  const id = req.body.id;
  db.getUserAttributes(username, function (err, data) {
    if (err || !data) {
      res.status(500).send("Unable to get user attributes");
    } else if (!data.chats) {
      res.status(500).send("Username not in chats");
    } else {
      console.log(data.chats.L);
      var chatIds = data.chats.L;
      var newChatIds = chatIds.filter(chatId => {
        return chatId.S !== id;
      })
      if (newChatIds.length === chatIds.length) {
        res.status(500).send("Username not in chats");
      } else {
        db.updateUserAttribute(username, "chats", { L: newChatIds }, function (err1, data1) {
          if (err1) {
            res.status(500).send("Unable to update user chat list");
          } else {
            db.leaveChat(username, id, function (err2, data2) {
              if (err2) {
                res.status(500).send("Unable to leave chat");
              } else {
                res.sendStatus(200);
              }
            });
          }
        });
      }
    }
  });
}

/*
Route to get all chats associated with a user
*/
var getChats = function (req, res) {
  const username = req.query.username;
  db.getUserAttributes(username, function (err, data) {
    if (err || !data) {
      res.status(500).send("Unable to lookup user attributes");
    } else {
      if (!data.chats) {
        res.json([]);
      } else {
        var chatIds = data.chats.L;
        var promises = [];
        for (const chatId of chatIds) {
          promises.push(db.getChat(chatId.S));
        }
        Promise.all(promises)
          .then(data => {
            let sortable = [];
            for (const item of data) {
              const chat = item.Items[0];
              if (chat) sortable.push([parseInt(chat.timestamp.N), chat]);
            }

            sortable.sort(function (a, b) {
              return b[0] - a[0];
            });

            res.json(sortable.map(item => item[1]));
          })
          .catch(err => {
            console.log(err);
            res.status(500).send(err)
          });
      }
    }
  });
}

/*
Route to get metadata for a chat
*/
var getChat = function (req, res) {
  const id = req.query.id;
  db.getChat(id)
    .then(data => {
      if (data.Items.length === 0) {
        res.status(400).send("Chat does not exist")
      }
      res.json(data.Items[0])
    })
    .catch(err => res.status(500).send(err));
}

/*
Route to get messages for a chat
*/
var getMessages = function (req, res) {
  const id = req.query.id;
  db.getMessages(id, function (err, data) {
    if (err) {
      res.status(500).send("Unable to get messages");
    } else {
      res.json(data);
    }
  });
}

/*
Route to send a message to a chat
*/
var sendMessage = function (req, res) {
  const id = req.body.id;
  const author = req.body.author;
  const message = req.body.message;
  const timestamp = new Date().getTime().toString();
  db.sendMessage(id, author, message, timestamp, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send("Unable to send message");
    } else {
      res.json(data);
    }
  });
}

/*
Get friends for visualization
*/
var getFriendsForVisualization = function (req, res) {
  const username = req.query.username;
  db.getUserAttributes(username, function (err, data) {
    if (err) {
      res.status(500).send('Unable to get user attributes');
    } else {
      var json = { "id": username, "name": data.fullname.S, "children": [] };
      if (!data.friends) {
        res.json(json);
      } else {
        var friends = data.friends;
        var promises = [];
        for (const friend of friends.L) {
          promises.push(db.getUserAttributesPromise(friend.S));
        }
        Promise.all(promises)
          .then(data1 => {
            data1.forEach(friend => {
              json.children.push({ "id": friend.Items[0].username.S, "name": friend.Items[0].fullname.S, "children": [] })
            })
            res.json(json);
          })
          .catch(err => { console.log(err); res.status(500).send('Unable to get friend attributes'); });
      }
    }
  });
}

/*
Get friends for visualization but only with same visualization
*/
var getFriendsWithSameAffiliationForVisualization = function (req, res) {
  const username = req.query.username;
  const me = req.query.me;
  db.getUserAttributes(me, function (err, self) {
    if (err) {
      res.status(500).send('Unable to get my attributes');
    } else {
      const affl = self.affiliation.S;
      db.getUserAttributes(username, function (err, data) {
        if (err) {
          res.status(500).send('Unable to get user attributes');
        } else {
          var json = { "id": username, "name": data.fullname.S, "children": [] };
          if (!data.friends) {
            res.json(json);
          } else {
            var promises = [];
            var friends = data.friends;
            for (const friend of friends.L) {
              promises.push(db.getUserAttributesPromise(friend.S));
            }
            Promise.all(promises)
              .then(data1 => {
                data1 = data1.filter(friend => {
                  return friend.Items[0].affiliation.S === affl;
                })
                data1.forEach(friend => {
                  json.children.push({ "id": friend.Items[0].username.S, "name": friend.Items[0].fullname.S, "children": [] })
                })
                console.log(json);
                res.json(json);
              })
              .catch(err => { console.log(err); res.status(500).send('Unable to get friend attributes'); });
          }
        }
      });
    }
  });
}

/*
Route to react to a message (either add reaction or delete reaction)
*/
var react = function (req, res) {
  const name = req.body.name;
  const messageId = req.body.id;
  const timestamp = req.body.timestamp;
  const emojiType = req.body.emoji;
  db.getMessage(messageId, timestamp, function (err, message) {
    if (err) {
      res.status(500).send('Unable to get message');
    } else {
      console.log(message);
      var newArray = message[emojiType] ? JSON.parse(message[emojiType].S) : [];
      if (newArray.indexOf(name) < 0) {
        newArray.push(name);
      } else {
        newArray = newArray.filter(person => person !== name);
      }
      db.updateMesage(messageId, timestamp, emojiType, { S: JSON.stringify(newArray) }, function (err1, newMessage) {
        if (err1) {
          res.status(500).send('Unable to update message');
        } else {
          res.json(newMessage);
        }
      });
    }
  });
}

/*
Route to get sid
*/
var getSid = function (req, res) {
  client.verify.v2.services
    .create({ friendlyName: 'PennBook' })
    .then(service => {
      res.json({ "sid": service.sid })
    })
    .catch(e => res.status(500).send(e));
}

/*
Route to send otp to phone
*/
var sendOTP = function (req, res) {
  const sid = req.body.sid
  const number = req.body.number
  client.verify.v2.services(sid)
    .verifications
    .create({ to: number, channel: 'sms' })
    .then(verification => res.json({ 'status': verification.status }))
    .catch((e) => res.status(500).send(e))
}

/*
Route to verify otp
*/
var checkOTP = function (req, res) {
  const sid = req.body.sid
  const code = req.body.code
  const num = req.body.number;
  console.log(sid);
  client.verify.v2.services(sid)
    .verificationChecks
    .create({ to: num, code: code })
    .then(verification_check => res.json({ 'status': verification_check.status }))
    .catch((e) => res.status(500).send(e))
}

/*
Route to upload a pfp to s3
*/
var uploadProfilePic = function (req, res) {
  const id = uuidv4();
  db.updateUserAttribute(req.body.name, 'profilepic', { S: id }, function (err, data) {
    if (err) {
      res.status(500).send('Unable to update user attribute');
    } else {
      const { file } = req;
      s3.putImage(file, req.body.name + '-profilepic-' + id, 'profilepictures/')
      return res.json('success');
    }
  })
}

/*
Route to upload a cover photo to s3
*/
var uploadCoverPhoto = function (req, res) {
  const id = uuidv4();
  db.updateUserAttribute(req.body.name, 'coverphoto', { S: id }, function (err, data) {
    if (err) {
      res.status(500).send('Unable to update user attribute');
    } else {
      const { file } = req;
      s3.putImage(file, req.body.name + '-coverphoto-' + id, 'profilepictures/')
      return res.json('success');
    }
  })
}

/*
Route to upload a post pic to s3
*/
var uploadPicToPost = function (req, res) {
  const { file } = req;
  s3.putImage(file, req.body.id, 'posts/')
  return res.json('success')
}

/*
Helper function to get article by id. Gets a relevant image from article.
*/
const getArticleHelper = (id) => {
  return db.getArticle(id).then(data => {
    var article = data.Items[0];
    var link = article.link.S;
    var img = 'https://img.huffingtonpost.com/asset/default-entry.jpg?ops=1200_630';
    var ret = data.Items[0];
    ret.image = img;
    return fetch(link)
      .then(res => {
        return res.text();
      })
      .then(html => {
        const regex = /<img.*src=\"(https:\/\/i.*?\.huffingtonpost\.com\/.*?)\".*>/g;
        const regex1 = /<img.*src=\"(https:\/\/i.*?\.huffpost\.com\/.*?)\".*>/g;
        const regex2 = /<meta.*content=\"(https:\/\/i.*?\.huffingtonpost\.com\/asset\/.*?)\".*>/g;
        var match = regex.exec(html);
        var match1 = regex1.exec(html);
        var match2 = regex2.exec(html);
        if (match2 && match2[1] && match2[1] !== img) {
          img = match2[1];
        } else if (match && match[1]) {
          img = match[1];
        } else if (match1 && match1[1]) {
          img = match1[1];
        }
        ret.image = img;
        return ret;
      })
      .catch(err => { return ret });
  });
}

/*
Route to get an article by id
*/
var getArticle = function (req, res) {
  getArticleHelper(req.query.id)
    .then(data => res.json(data));
}

/*
Route to get an article in news feed
*/
var newsFeedArticle = function (req, res) {
  const username = req.body.username;
  db.getUserAttributes(username, function (err, user) {
    if (err) {
      console.log('Unable to get user attributes');
    } else {
      var weights = user.weights?.M || [];
      const articles = req.body.articles || [];
      var cdf = [];
      var sum = 0.0;
      for (const key of Object.keys(weights)) {
        if (parseFloat(weights[key].M.today.S) === 0) {
          continue;
        } else if (!articles.some(article => article.index.N === key)) {
          sum += parseFloat(weights[key].M.today.S);
          cdf.push([key, parseFloat(weights[key].M.today.S)]);
        }
      }
      cdf = cdf.map(item => [item[0], (1.0 / sum) * item[1]]);
      var rand = Math.random();
      var currentSum = 0.0;
      var promise = null;
      for (const item of cdf) {
        currentSum += parseFloat(item[1]);
        if (currentSum >= rand) {
          promise = getArticleHelper(item[0]);
          break;
        }
      }
      if (promise) {
        promise.then(data => {
          res.json(data);
        });
      } else {
        res.json({});
      }
    }
  });
}


var routes = {
  login: login,
  create_account: createAccount,
  logout: logout,
  change_account: changeAccount,
  get_user: getUser,
  search: search,
  notify: notify,
  get_notifications: getNotifications,
  delete_notification: deleteNotification,
  add_friend: addFriend,
  delete_friend: deleteFriend,
  create_post: createPost,
  home_page: homePage,
  wall_page: wallPage,
  like: like,
  undo_like: undoLike,
  get_comment: getComment,
  get_children_of_comment: getChildrenOfComment,
  create_comment: createComment,
  edit_comment: editComment,
  delete_comment: deleteComment,
  get_friends_visual: getFriendsForVisualization,
  get_friends_with_same_affiliation_visual: getFriendsWithSameAffiliationForVisualization,
  create_chat: createChat,
  leave_chat: leaveChat,
  get_chats: getChats,
  get_chat: getChat,
  get_messages: getMessages,
  send_message: sendMessage,
  react,
  get_article: getArticle,
  add_prefix: addPrefix,
  news_feed_article: newsFeedArticle,

  getSid,
  sendOTP,
  checkOTP,
  uploadProfilePic,
  uploadPicToPost,
  uploadCoverPhoto
};

module.exports = routes;
