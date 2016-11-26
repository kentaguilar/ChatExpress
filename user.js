exports.User = {
	addUserInUserCollection: function(userList, userId, userName){
		var userExists = false;	
		
		for(var key in userList){
			if(userList[key].username == userName){
				userList[key].id = userId;
				userExists = true;
			}
		}

		if(!userExists){
			userList.push({
				'username': userName,
				'id': userId
			})
		}
	},
	removeUserFromUserCollection: function(userList, socketId){
		var index = userList.map(function(e){
			return e.id;
		}).indexOf(socketId);

		return index;
	},
	getUserFromUserCollection: function(userList, userName){
		var foundUser = "";

		for(var key in userList){
			if(userList[key].username == userName){
				foundUser = userList[key];
			}
		}

		return foundUser;
	}
};