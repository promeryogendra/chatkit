//Initialize socket

var socket = io.connect();

var registerUsernameStatus = false,
		registerEmailStatus = false,
		registerPasswordStatus = false;

//Method that return element by taking id as input
getElement = (name) => {
	return document.getElementById(name);
}

//Method to change the theme
changeTheme = (color) => {
	data = colors[color];
	let root = document.documentElement;
	data.forEach(([variable, color]) => {
		root.style.setProperty(variable, color);
	});
}

//Assign Initail data from config
assignInitialData = () => {
	getElement('headText').innerHTML = `<p>${config.appName}</p>`;
	document.title = config.appName
	getElement('homeDivTextHead').innerHTML = config.appName;
	getElement('homeDivTextSubHead').innerHTML = config.appSubHead;
	getElement('homeDivTextList').innerHTML = "";
	config.appSubDivData.forEach(element => {
		getElement('homeDivTextList').innerHTML += `<li>${element}</li>`;
	})
}
//Synchronous with callback
synchronous = (funcName) => {
	return new Promise(function (resolve) {
		funcName((result)=>{
			return resolve(result);
		})
  });
}
//Synchronous withour callback
synchronousNoCallback = (funcName) => {
	return new Promise(function (resolve) {
			return resolve(funcName());
  });
}
//Loading Please
loading = () => {
	let loader = getElement("loading");
	loader.style.zIndex = 2;
	let main = getElement("Authentication");
	main.style.zIndex = -1;
	loader.classList.remove('hidden');
}
//Remove loading
removeLoading = () => {
	let loader = getElement("loading");
	loader.classList.add('hidden');
	let element = getElement("Authentication");
	element.style.zIndex = 2;
}
//Methid that handle the tab clicks
changeLoginTab = () => {
	var loginTab = getElement('tabLogin');
	var verifyTab = getElement('tabVerify');
	var loginPanel = getElement('loginPanel');
	var verifyPanel = getElement('verifyPanel');

	verifyTab.style.borderTop = "none";
	loginTab.style.borderTop = "none";
	verifyTab.style.color = "var(--light-black)";
	loginTab.style.color = "var(--black)";
	loginTab.style.borderTop = "2px solid var(--tab-top)";
	loginPanel.classList.remove('hidden');
	verifyPanel.classList.add('hidden');
	verifyTab.style.background = "var(--light-gray)";
	loginTab.style.background = "var(--white)";
}

changeVerifyTab = () => {
	var loginTab = getElement('tabLogin');
	var verifyTab = getElement('tabVerify');
	var loginPanel = getElement('loginPanel');
	var verifyPanel = getElement('verifyPanel');

	loginTab.style.borderTop = "none";
	verifyTab.style.borderTop = "none";
	loginTab.style.color = "var(--light-black)";
	verifyTab.style.color = "var(--black)";
	verifyTab.style.borderTop = "2px solid var(--tab-top)";
	loginPanel.classList.add('hidden');
	verifyPanel.classList.remove('hidden');
	verifyTab.style.background = "var(--white)";
	loginTab.style.background = "var(--light-gray)";
}
//Staus normal
statusNormal = ( id , data) => {
	let status = getElement(id);
	status.style.color = "var(--tab-top)";
	status.innerHTML = data;
}

//Set data to storage
setCurrentUser = (user) => {
	document.cookie = "UserAuthInfo=" + JSON.stringify(user) + ";" + "max-age="+ 60*60*3 + ";path=/; samesite=strict;";
}
//get UserAuthInfo object with all object data
getUserAuthCookie = (callBack) => {
	var decodedCookie = decodeURIComponent(document.cookie);
	var cookies = decodedCookie.split(';');
	for(let cookie of cookies) {
		let cookieName = cookie.substring(0,cookie.indexOf("="));
		if(cookieName.trim() === "UserAuthInfo") {
			let cookieData = cookie.substring(cookie.indexOf('=')+1,cookie.length).trim();
			try {
				let user  = JSON.parse(cookieData);
				if( user!=undefined &&  user.username && user.id && user.email && user.userId) {
					return callBack(user , true);
				}
				console.log("un reachable");
			}catch (error) {
				console.log(1);
				return callBack(undefined , false);
			}
		}
	}
	callBack(undefined , false);
}
//CallBack from userdata
getUserData = ( callBack ) => {
	let user ;
	let status ;
	getUserAuthCookie( (result , error) => {
		user = result;
		status = error;
	})
	if(status) {
		return ([user.userId , user.id]);
	} else {
		return ([undefined, false]);
	}
}

//Get data from storage 
//getCurrentUser( (result , error) => {} );
//Formate of data [ 'userId' , 'token']
getCurrentUser = ( callBack ) => {
	let data = getUserData();
	if(data[1] == false) {
		console.log("yes");
		callBack([undefined , false]);
	}else {
		callBack([data , true]);
	}
}

//Remove data from storage
removeCurrentUser = () => {
	console.log("removed");
	document.cookie = "UserAuthInfo"+"={};max-age=-1;";
}
//Focus field and show red color
focusAndShowError = (element) => {
	element.style.borderColor = "red";
	element.focus();
}
//After custome focus error
clearValidationError = (element) => {
	element.style.borderColor = "black";
}
//Any special characters or not
isNoSpecialChracters = (text) => {
	for(let singleChar of specialCharacters) {
			if(text.indexOf(singleChar)!=-1){
					return false;
			}
	}
	return true;
}

//Is Authenticated or not
async function isAuth ( ) {
	let [result , error] = await synchronous(getCurrentUser);
	if(result) {
		socket.emit('verify' , [result[0] , result[1]], (status) => {
			if(status) {
				console.log("User Authenticated...");
			} else {
				removeCurrentUser();
				console.log("User UnAuthenticated");
			}
		})
	} else {
		console.log(error);
	}
}
//Check user can proceed login or not
login = () => {
	let loginEmail = getElement('loginEmail');
	let loginPassword = getElement('loginPassword');
	let loginStatus = getElement('loginStatus');
	let email = loginEmail.value;
	let password = loginPassword.value;
	if(email  && password && email !== '' && password !== '' && password.length >=6 ) {
		return [email.toLowerCase(), password.toLowerCase()];
	}	else {
		loginStatus.style.color = "red";
		loginStatus.innerHTML = 'Please fill all data...';
		setTimeout(() => {
			statusNormal('loginStatus',"Please Login...");
		}, 2000);
		return false;
	}
}
//Set login error
loginError =  () => {
	let status = getElement('loginStatus');
	status.innerHTML = "Enter Verified Acount detials or Create new Account and verify..";
	status.style.color = "red";
	setTimeout(() => {
		statusNormal('loginStatus',"Please Login...");
	}, 1400);
}
registerError =  (error) => {
	let status = getElement('registerStatus');
	status.innerHTML = error;
	status.style.color = "red";
	setTimeout(() => {
		statusNormal('registerStatus',"Enter Valid data...");
	}, 2000);
}
//Checking passwords are matching and having length more than 6
validPasswords = () => {
	let password1 = getElement('registerPassword1');
	let password2 = getElement('registerPassword2');
	
	if(password1.value.length >=6 && password1.value.length == password2.value.length) {
		if(password1.value.toLowerCase() === password2.value.toLowerCase()) {
			if(isNoSpecialChracters(password1.value)) {
				clearValidationError(password1);
				clearValidationError(password2);
				return true;
			} else {
				registerError('Password should not contain special characters...');
				focusAndShowError(password1);
				return false;
			}
		} else {
			registerError('Passwords are not matching...');
			focusAndShowError(password2);
			return false;
		}
	} else {
		if(password1.value.length<6) {
			registerError('Password must have atleast 6 characters...');
			focusAndShowError(password1);
			return false;
		} else if(password2.value.length<6){
			registerError('Password must have atleast 6 characters...');
			focusAndShowError(password2);
			return false;
		} else {
			registerError('Passwords are not matching...');
			focusAndShowError(password2);
			return false;
		}
	}
}
//Cheking username available or not in the api
validUsername = () => {
	let username = getElement('registerName');
	if(username.value.length < 6) {
		registerError('Username must have atleast 6 characters...');
		focusAndShowError(username);
		return false;
	} else {
		if(!isNoSpecialChracters(username.value)) {
			registerError('Username should not contain special characters...');
			focusAndShowError(username);
			return false;
		} else {
			let data = ['username' , username.value , ''];
			socket.emit('verifyField' , data , ( status) => {
				if(status) {
					registerError('Username Already Taken...');
					focusAndShowError(username);
					return false;
				} else if (status === 'error') {
					registerError('Problem with Server please try again....');
					focusAndShowError(username);
					return false;
				} else {
					clearValidationError(username);
					return true;
				}
			})
		}
	}
}
//Check username AVAILABLE OR not
//Checking the email available or not in the api
validEmail = () => {
	let email = getElement('registerEmail');
	if(email.value.length <= 3) {
		registerError('Email is not valid...');
		focusAndShowError(email);
		return false;
	} else {
		if(email.value.indexOf(' ') != -1) {
			registerError('Email should not contain special characters...');
			focusAndShowError(email);
			return false;
		} else {
			let data = ['email' , '' , email.value];
			socket.emit('verifyField' , data , (status) => {
				if(status) {
					registerError('Email Already Taken...');
					focusAndShowError(email);
					return false;
				} else if (status === 'error') {
					registerError('Problem with Server please try again....');
					focusAndShowError(email);
					return false;
				} else {
					clearValidationError(email);
					return true;
				}
			})
		}
	}
}
function register () {
	let registerEmail = getElement('registerEmail');
	let registerName = getElement('registerName');
	let registerPassword1 = getElement('registerPassword1');
	let registerPassword2 = getElement('registerPassword2');
	console.log(1);
	console.log(validEmail());
	if(validEmail() && validUsername() && validPasswords()) {
		console.log("valid registration");
	}
	console.log(2);
}