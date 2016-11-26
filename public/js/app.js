var socket = io.connect('http://localhost:3000');

var currentUser = helper.getUrlParameterByName('user');	

socket.on('connect', function(){
	socket.emit('adduser', currentUser);
});

socket.on('update-general', function(username, data){
	$('#general-message-list').append("<span class='sender'>" + username + "</span>: " + data + "<br/>");
});

socket.on('updateusers', function(usernames){		
	var output = "";
	for(var i=0; i < usernames.length; i++){
		if(usernames[i].username != currentUser){
			output += "<a href='" + usernames[i].id + "' id='link-username'>" + usernames[i].username + "</a><br/>";
		}
	}

	$('#user-list').empty().append(output);

	$('a#link-username').on('click', function(e){
		e.preventDefault();
		e.stopPropagation();

		var receiverUser = $(this).text();

		socket.emit('initiate-private-chat', currentUser, receiverUser);
	});
});

socket.on('open-chat-window', function(senderUser, targetUser){						
	$('.nav-tabs').append('<li class=""><a href="#tab_' + senderUser + '" data-toggle="tab" aria-expanded="false">' + senderUser + '</a></li>');

	var output = "<div class='tab-pane' id='tab_" + senderUser + "'>";
	output += "<textarea class='form-control' id='user-message'></textarea><br/>";
	output += "<button class='btn-save-changes btn btn-primary' id='send-message' user='" + senderUser + "'>Send Message</button><br/><br/>";
	output += "<b>Conversation:</b><br/>";
	output += "<div class='message' id='" + senderUser + "-message-list'></div>";
	output += "</div>";

	$('.tab-content').append(output);

	$('.tab-content button#send-message').on('click', function(){
		var receiver = $(this).attr('user');
		var sender = currentUser;
		var message = $(this).parent().find('textarea').val();

		if(message != ""){
			socket.emit('send-message', sender, receiver, message);

			$(this).parent().find('textarea').val('');
		}
		else{
			alert("Please enter message to send");
		}
	});
});

socket.on('handle-message', function(sender, senderTitle, message){				
	$('#' + sender + '-message-list').append("<span class='sender'>" + senderTitle + "</span>: " + message + "<br/>");
});

$(function(){
	$('#send-message-general').on('click', function(){				
		if($('#message-general').val() != ""){
			socket.emit('send-message-general', currentUser, $('#message-general').val());		
			$('#message-general').val('');
		}
		else{
			alert("Please enter message to send");
		}
	});
});