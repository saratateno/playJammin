var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userHelpers = require('./serverHelpers/userHelpers.js');
// var tone = require('tone');
// var metronomeFactory = require('./js/factories/metronomeFactory.js');

var users = [];

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/bower_components'));


http.listen(app.get('port'), function() {
  console.log('Node app is running on port ' + app.get('port'));
});

app.get('/', function(request, response) {
  response.render('index');
});

io.on('connection', function(socket) {
  console.log('user connected');

  socket.on('disconnect', function() {
    userHelpers.removeUser(users, socket.id, function(newUsers) {
      users = newUsers;
      io.emit('update users', users);
      console.log('user disconnected');
    });
  });

  socket.on('sync', function() {
    console.log('syncing transport')
    io.emit('start transport');
  });

  socket.on('new user', function(user) {
    console.log('newuser',users);
    socket.emit('assign socket id', socket.id)
    user.socketId = socket.id;
    if (users.length === 0) {
      socket.emit('start transport')
      user.masterUser = true;
    } else {
      user.masterUser = false;
    }
    users.push(user);
    io.emit('update users', users);
    console.log(users);
  });

  socket.on('transmit sound', function(tone) {
    console.log('test', tone, users);
    io.emit('play sound', tone, userHelpers.userColor(users, socket.id));
  });
});
