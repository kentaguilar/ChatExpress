var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var model = require('./user.js');

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//routing
app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/index.html');
});
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/js/common', express.static(__dirname + '/public/common/js'));
app.use('/css', express.static(__dirname + '/public/css'));

//app specifics
var userList = [];
var appName = "Menthol Chat";

io.sockets.on('connection', function(socket){	
	socket.on('adduser', function(username){
		socket.username = username;				

		model.User.addUserInUserCollection(userList, socket.id, username);

		socket.emit('update-general', appName, "You're now connected to " + appName + ". Username => " + username);
		socket.broadcast.emit('update-general', appName, username + ' connected');	

		io.emit('updateusers', userList);
	});

	socket.on('disconnect', function(){
		userList.splice(model.User.removeUserFromUserCollection(userList, socket.id), 1);

		io.emit('updateusers', userList);	
		socket.broadcast.emit('update-general', appName, socket.username + ' disconnected');	

		socket.emit('remove-private-tab');
	});

	socket.on('send-message', function(sender, receiver, message){		
		var receiverUser = model.User.getUserFromUserCollection(userList, receiver);
		var senderUser = model.User.getUserFromUserCollection(userList, sender);

		io.to(receiverUser.id).emit('handle-message', sender, sender, message);
		io.to(senderUser.id).emit('handle-message', receiver, sender, message);
    });

    socket.on('send-message-general', function(sender, message){    	
    	io.emit('update-general', sender, message);
    });

    socket.on('initiate-private-chat', function(senderUser, targetUser){
    	var receiver = model.User.getUserFromUserCollection(userList, targetUser);
    	var sender = model.User.getUserFromUserCollection(userList, senderUser);

    	if(receiver != undefined && sender != undefined){
	    	io.to(receiver.id).emit('open-chat-window', senderUser, receiver.username);
	    	io.to(sender.id).emit('open-chat-window', targetUser, sender.username);
	    }
    });
});
