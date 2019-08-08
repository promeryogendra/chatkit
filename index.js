var express = require('express');
var app =express();
var http = require('http').createServer(app);
var io = require('socket.io')( http );
var PORT = process.env.PORT || 4200;

const axios = require('axios')

const config = {
	host : 'https://chatkitweb.herokuapp.com/',
	api : 'https://chatkitapi.herokuapp.com/api/'
}

var onlineUserSockets = {};
var friendsList = {};
var requestList = {};

app.use(express.static('views'));

userCheck = (user) => {
	if(onlineUserSockets[user.userId] == undefined) {
		return true;
	}
	return false;
}
createObject = (userId , username, email, relation , place) => {
	return {
		friendId : relation,
		username : username,
		email : email,
		userId : userId,
		place : place
	}
}
userOffline = (user , socket) => {
	delete onlineUserSockets[user.userId];
	delete friendsList[user.userId];
	socket.user = undefined;
	console.log(user.username , " went offline");
}
assignUserData = (user , data) => {
	friendsList[user.userId] = [];
	let friends = data['friends'];
	friends.forEach(friend => {
		if(friend.user1 === user.userId) {
			let friendObject = createObject(friend.user2 , friend.user2username , friend.user2email , friend.id , "user2");
			friendsList[user.userId].push(friendObject);
		}else {
			let friendObject = createObject(friend.user1 , friend.user1username , friend.user1email , friend.id , "user1");
			friendsList[user.userId].push(friendObject);
		}
	});
	requestList[user.userId] = data['requests'];
}
//emit a dynamic event ot friends
sendFriends = (emitEventName , data , userId) => {
	if(friendsList[userId] != undefined && friendsList[userId].length != 0) {
		friendsList[userId].forEach(user => {
			if(onlineUserSockets[user.userId] != undefined ){
				let socket =  onlineUserSockets[user.userId]
				socket.emit(emitEventName , data);
			}
		});
	}
}
//Send Dynamic Event to specific friend
sendFriend = (emitEventName , data , userId,friendId) => {
	if(friendsList[userId] != undefined && friendsList[userId].length != 0) {
		let temp = friendsList[userId];
		for (let i=0; i < temp.length; i++){
			let user = temp[i];
			if( user.userId === friendId) {
				if(onlineUserSockets[user.userId] != undefined ){
					let socket =  onlineUserSockets[user.userId]
					socket.emit(emitEventName , data);
					break;
				}
			}
		}
	}
}
//Get opposite place
getUserPlaces = (friend , user) => {
	if(friend.user1 === user.userId) {
		return ["user1" , "user2"];
	}else if(friend.user2 === user.userId) {
		return ["user2","user1"];
	} 
	return [null , null];
}
//Process the data
preProcess = (user , data , callBack) => {
	// let friends = friendsList[user.userId];
	sendFriends("online",user.userId,user.userId);
	let friends = data["friends"];
	let messages = {};
	friends.forEach(friend => {
		let userPlaces = getUserPlaces(friend,user);
		friend.oppositePlace = userPlaces[1];
		friend.place = userPlaces[0];
		messages[friend[userPlaces[1]]] = friend.messages;
		if(onlineUserSockets[friend[userPlaces[1]]] == undefined) {
			friend.status = "offline"
		} else {
			friend.status = "online";
		}
		delete friend.messages;
	});
	let requests = requestList[user.userId];
	// data["friends"].forEach(friend => {
	// 	messages[friend.id] = friend.messages;
	// });
	callBack([friends , messages , requests],true);
}
io.on('connection' ,(socket) => {
	console.log("Socket Connection made...");
	//On connection Lost
	socket.on('disconnect', () => {
		if(socket.user != undefined && socket.user != {}) {
			sendFriends("offline",socket.user.userId, socket.user.userId);
			console.log(socket.user.username , " offline");
			userOffline(socket.user, socket);
		}
	})
	//Logout call to user
	logoutCall = (callBack) => {
		if(socket.user != undefined) {
			console.log(socket.user);
			sendFriends("offline",socket.user.userId, socket.user.userId);
			console.log(1);
			userOffline(socket.user, socket);
		}
		callBack(true);
	}
	//Logoout user
	socket.on('logout', (data,callBack) => {
		axios.post(config.api+'customer/logout' , {
				"access_token" : data[1]
		})
		.then((response) => {
			logoutCall(callBack);
		})
		.catch((error) => {
			logoutCall(callBack);
		})
	})
	//Initial call get data from server
	getInitialData = ((user,callBack) => {
		axios.get(config.api+'initial' , {
			data: {
				"userId": user.userId
    	}
		})
		.then((response) => {
			if(response.status == 200) {
				assignUserData(user , response.data);
				preProcess(user, response.data , callBack);
				// callBack(response.data , true);
			} else {
				console.log("data not found");
				callBack(undefined, false);
			}
		})
		.catch((error) => {
			callBack(undefined , false);
		})
	})
	//Initial call
	initialCall = (user,callBack) => {
		if(userCheck(user)) {
			socket.user = user;
			onlineUserSockets[user.userId] = socket;
			let soc = onlineUserSockets[user.userId];
			getInitialData(user,callBack);
		}else {
			//User already exists
		}
	}
	//After successfull login
	socket.on("afterAuth" , (user , callBack) => {
		console.log("inital call",user);
		initialCall(user,callBack);
	});
	//Login method
	login = ( credentials , callBack) => {
		axios.post(config.api+'customer/login' , {
				"email" : credentials[0],
				"password" : credentials[1]
		})
		.then((response) => {
			if(response.status == 200) {
				callBack(response.data , true);
			}else {
				callBack(undefined , false);
			}
		})
		.catch((error) => {
				callBack(undefined , false);
		})
	}
	//Login call listen
	socket.on('login' ,(credentials , callBack) => {
		console.log("login called ...",credentials);
		if(credentials[0].length >= 3 && credentials[1].length >= 6) {
			results = login(credentials , callBack);
		} else {
			callBack(undefined , false);
		}
	})
	//Verify method
	verify = (credentials , callBack) => {
		axios.get(config.api+'verifyUser' , {
			data: {
				"userId": credentials[0],
      	"tokenId": credentials[1]
    	}
		})
		.then((response) => {
			if(response.status == 200) {
				callBack(true);
			} else {
				callBack(false);
			}
		})
		.catch((error) => {
			callBack(false);
		})
	}
	//Verify call listen
	socket.on('verify' , (data , callBack) => {
		verify(data , callBack);
	})
		//VerifyUsername method
	verifyUsername = (credentials , callBack) => {
		axios.get(config.api+'check' , {
			data : {
				"checkName" : credentials[0],
				"username" : credentials[1],
				"email":credentials[2]
			}
		})
		.then((response) => {
			if(response.status == 200) {
					console.log(credentials[0] + " exists");
					callBack(true);
			} else {
				console.log(credentials[0] + " Not exists");
				callBack(false);
			}
		})
		.catch((error) => {	
			callBack('error');
		})
	}
	//VerifyEmail method
	verifyEmail = (credentials , callBack) => {
		axios.get(config.api+'check' , {
			data : {
				"checkName" : credentials[0],
				"username" : credentials[1],
				"email":credentials[2]
			}
		})
		.then((response) => {
			if(response.status == 200) {
					console.log(credentials[0] + " exists");
					callBack(true);
			} else {
				console.log(credentials[0] + " Not exists");
				callBack(false);
			}
		})
		.catch((error) => {
			callBack('error');
		})
	}
	//VerifyUserField call listen
	socket.on('verifyField' , (data , callBack) => {
		if(data[0] === 'username') {
			verifyUsername(data , callBack);
		}else if(data[0] === 'email') {
			verifyEmail(data , callBack);
		} else {
			callBack('error');
		}
	})
//Register api call
	
	register = ( creadentials , callBack) => {
		axios.post(config.api+"customer" , {
				"email" : creadentials[0],
				"username" : creadentials[1],
				"password" : creadentials[2]
		})
		.then((response) => {
			console.log(response.data);
			callBack("SUCCESS");
		})
		.catch((error) => {
			let err = error.response.data.error;
			if(err.statusCode == 422) {
				let codes = err.details.codes;
				if(codes.email != undefined && codes.email.length >0 && codes.email[0] == 'custom.email') {
					console.log("Enter valid email");
					callBack("EMAIL_INVALID");
				} else if(codes.email != undefined && codes.email.length >0 && codes.email[0] === 'uniqueness') {
					console.log("EMAIL ALREADY EXISTS");
					callBack("EMAIL_EXISTS");
				} else if( codes.username != undefined && codes.username.length >0 && codes.username[0] === 'uniqueness'){
					console.log("USERNAME ALREADY EXISTS");
					callBack("USERNAME_EXISTS");
				}	else {
					console.log("error1");
					console.log(false);
				}
			}else {
				let errorResponse = error.response.data.error;
				if(errorResponse.status == 400){
					if(errorResponse.code == "USERNAME_LENGTH") {
						console.log("USERNAME_LENGTH");
						callBack("USERNAME_LENGTH")
					} else if(errorResponse.code == "PASSWORD_LENGTH") {
						console.log("PASSWORD_LENGTH");
						callBack("PASSWORD_LENGTH");
					}else {
						console.log("error2");
						callBack(false);
					}
				}
			}	
		})
	}
	//Register socket listern
	socket.on('register' , (data , callBack) => {
		console.log("register " , data);
		register(data,callBack);
	})
	//Typing
	socket.on('typing' , (userId , friendId) => {
		sendFriend('typing',userId,userId,friendId);
	})
	socket.on('typingStopped' , (userId , friendId) => {
		sendFriend('typingStopped',userId,userId,friendId);
	})
})

http.listen(PORT , ()=> {
	console.log("Server running on port 4200");
})

app.get('/',(req,res) => {
	res.header('Content-type', 'text/html');
  return res.end('<h1>Hello, Secure World!</h1>');
})

//we can user this to redirect to another page
// app.use( function(req, res, next) {
//     if (req.url == '/') {
//         res.redirect('/index.html');
// 				next();
//     } else {
//         next();
//     }
// });