/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var session = require('express-session')
var app = express();

const multer = require('multer');
const { memoryStorage } = require('multer');
const storage = memoryStorage()
const upload = multer({ storage })

app.use(express.json());
app.use(session({ secret: 'bigsecret' }));
app.use("/assets", express.static('./assets/'));

/* Below we install the routes. The first argument is the URL that we
  are routing, and the second argument is the handler function that
  should be invoked when someone opens that URL. Note the difference
  between app.get and app.post; normal web requests are GETs, but
  POST is often used when submitting web forms ('method="post"'). */

app.post('/login', routes.login); // Route to authenticate user and login
app.post('/createaccount', routes.create_account); // Route to check register fields and create account
app.post('/logout', routes.logout); // Route to log out
app.post('/changeaccount', routes.change_account); // Route to log out
app.get('/user', routes.get_user); // Route to get details of a user
app.get('/search', routes.search); // Route to search user full names and news articles
app.post('/addprefix', routes.add_prefix); // Route to add user prefixes to search table (utility function for testing)

app.post('/notify', routes.notify); // Route to notify user they were invited to be friends or chat 
app.get('/notifications', routes.get_notifications); // Route to get all notifications for a user
app.post('/deletenotification', routes.delete_notification) // Route to delete a notification
app.post('/addfriend', routes.add_friend); // Route to add friend
app.post('/deletefriend', routes.delete_friend); // Route to delete friend

app.post('/createpost', routes.create_post); // Route to create post
app.get('/homepage', routes.home_page); // Route to get home page posts
app.get('/wallpage', routes.wall_page); // Route to get wall posts
app.post('/like', routes.like); // Route to like a post/comment
app.post('/undolike', routes.undo_like); // Route to undo a like
app.get('/comment', routes.get_comment); // Route to get comment
app.get('/childcomments', routes.get_children_of_comment); // Route to get children of comment
app.post('/createcomment', routes.create_comment); // Route to create comment
app.post('/editcomment', routes.edit_comment); // Route to create comment
app.post('/deletecomment', routes.delete_comment); // Route to create comment

app.get('/friendvisualization', routes.get_friends_visual); // Route to get json of friend visualization
app.get('/friendvisualizationaffl', routes.get_friends_with_same_affiliation_visual); // Route to get list of friends

app.post('/createchat', routes.create_chat); // Route to create chat
app.post('/leavechat', routes.leave_chat); // Route to leave chat
app.get('/chats', routes.get_chats); // Route to get chats for a specific user
app.get('/chat', routes.get_chat); // Route to get metadata for a chat
app.get('/messages', routes.get_messages); // Route to get messages for a specific chat
app.post('/message', routes.send_message); // Route to send a message to a chat
app.post('/react', routes.react); // Route to add reaction to message

app.get('/getsid', routes.getSid); // Route to get sid
app.post('/sendotp', routes.sendOTP); // Route to send one time password to phone
app.post('/checkotp', routes.checkOTP) // Route to verify otp
app.post('/uploadprofilepic', upload.single('image'), routes.uploadProfilePic) // Route to upload profile pic to s3
app.post('/uploadcoverphoto', upload.single('image'), routes.uploadCoverPhoto) // Route to upload cover photo to s3
app.post('/uploadpostpicture', upload.single('postimage'), routes.uploadPicToPost) // Route to upload post pic to s3

app.get('/newssearch', routes.search); // Route to get news search results
app.get('/article', routes.get_article); // Get a news article by id
app.post('/newsfeedarticle', routes.news_feed_article); // Route to get an article in news feed

app.post('/joincall', routes.join_call); // Route to open a call with the current chat
app.post('/leavecall', routes.leave_call); // Route to open a call with the current chat

/* Run the server */

console.log('Author: Joseph Zhang (jzhang25)');
const server = app.listen(3001);
console.log('Server running on port 3001. Now open http://localhost:3001/ in your browser!');

const io = require("socket.io")(server, {
   pingTimeout: 60000,
   cors: {
      origin: "*"
   },
});

io.on("connection", (socket) => {
   console.log("Connected to socket.io");
   socket.on("setup", (data) => {
      if (data.leave) socket.leave(data.leave);
      socket.join(data.uuid);
      socket.emit("connected");
   });

   socket.on("typing", (room) => socket.in(room).emit("typing"));
   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
   socket.on("new message", (data) => socket.in(data.uuid).emit("message received", data.message));
   socket.on("new reaction", (data) => socket.in(data.uuid).emit("reaction received", data));
});