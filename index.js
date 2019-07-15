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

var users = [];
var onlineUserSockets = [];
var requestUserSockets = [];

app.use(express.static('views'));

io.on('connection' ,(socket) => {
	console.log("Socket Connection made...");
	
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
			console.log(error);
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
	
	register = ( creadentials ) => {
		axios.post(config.api+"customer" , {
				"email" : creadentials[0],
				"username" : creadentials[1],
				"password" : creadentials[2]
		})
		.then((response) => {
			console.log(response.body);
		})
		.catch((error) => {
			let err = error.response.data.error;
			if(err.statusCode == 422) {
				let codes = err.details.codes;
				if(codes.email != undefined && codes.email.length >0 && codes.email[0] == 'custom.email') {
					console.log("Enter valid email");
				} else if(codes.email != undefined && codes.email.length >0 && codes.email[0] === 'uniqueness') {
					console.log("EMAIL ALREADY EXISTS");
				} else if( codes.username != undefined && codes.username.length >0 && codes.username[0] === 'uniqueness'){
					console.log("USERNAME ALREADY EXISTS");
				}	else {
					console.log("UNKNOWN ERROR");
				}
			}else {
				let errorResponse = error.response.data.error;
				if(errorResponse.status == 400){
					if(errorResponse.code == "USERNAME_LENGTH") {
						console.log("USERNAME_LENGTH");
					} else if(errorResponse.code == "PASSWORD_LENGTH") {
						console.log("PASSWORD_LENGTH");
					}
				}
			}	
		})
	}
	//Register socket listern
	socket.on('register' , (data , callBack) => {
		console.log("1");
		callBack('error');
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