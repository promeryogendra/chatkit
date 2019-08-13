

var registerUsernameStatus = false,
		registerEmailStatus = false,
		registerPasswordStatus = false;


changeTab = (id) => {
	let tabs = ['chat-friends-tab' , 'chat-requests-tab' , 'chat-new-tab'];
	let panels = ['chat-friends-panel' , 'chat-requests-panel' , 'chat-new-panel']
	for(let i=0; i<tabs.length ;i++) {
		let tab = tabs[i];
		if(tab === id) {
			getElement(id).classList.add('chat-tab-selected');
			getElement(panels[i]).classList.remove("hidden");
		} else {
			getElement(tab).classList.remove('chat-tab-selected');
			getElement(panels[i]).classList.add("hidden");
		}
	}
}

//If The javascript is enabled start doing
getElement('errorDiv').classList.add('hidden');
getElement('mainDivision').classList.remove('hidden');

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
	getElement("registerEmail").value = "";
	getElement("registerName").value = "";
	getElement("registerPassword1").value = "";
	getElement("registerPassword2").value = "";
}
//Synchronous call
synchronous = (funcName) => {
	return new Promise(function (resolve) {
			return resolve(funcName());
  });
}
//Synchronous call
async function callSyncFunc(funcName) {
	return await synchronous(funcName);
}

//Loading Please
loading = () => {
	let loader = getElement("loading");
	loader.style.zIndex = 2;
	let main = getElement("Authentication");
	main.style.zIndex = 1;
	loader.classList.remove('hidden');
}
loading();
//Remove loading
removeLoading = () => {
	let loader = getElement("loading");
	loader.classList.add('hidden');
	let element = getElement("Authentication");
	element.style.zIndex = 2;
}
//Loading Please
authLoading = () => {
	let loader = getElement("loading");
	loader.style.zIndex = 2;
	let main = getElement("chat");
	main.style.zIndex = 1;
	loader.classList.remove('hidden');
	
}
//Remove loading 
authRemoveLoading = () => {
	let loader = getElement("loading");
	loader.classList.add('hidden');
	let element = getElement("chat");
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
getUserAuthCookie = () => {
	var decodedCookie = decodeURIComponent(document.cookie);
	var cookies = decodedCookie.split(';');
	for(let cookie of cookies) {
		let cookieName = cookie.substring(0,cookie.indexOf("="));
		if(cookieName.trim() === "UserAuthInfo") {
			let cookieData = cookie.substring(cookie.indexOf('=')+1,cookie.length).trim();
			try {
				let user  = JSON.parse(cookieData);
				if( user!=undefined &&  user.username && user.id && user.email && user.userId) {
					return ([user , true]);
				}
			}catch (error) {
				return ([undefined , false]);
			}
		}
	}
	return ([undefined , false]);
}
//CallBack from userdata
getUserData = () => {
	let[user , status] = getUserAuthCookie();
	if(status) {
		return ([user.userId , user.id]);
	} else {
		return ([undefined, false]);
	}
}

//Get data from storage 
//getCurrentUser( (result , error) => {} );
//Formate of data [ 'userId' , 'token']
getCurrentUser = ( ) => {
	let data = getUserData();
	if(data[1] == false) {
		return ([undefined , false]);
	}else {
		return ([data , true]);
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
	statusNormal('registerStatus',"Please Fill all fields...");
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
//After successful login
authSuccess = () => {
	authRemoveLoading();
	getElement("appHome").classList.add('hidden');
	getElement("userHome").classList.remove("hidden");
}
//AuthInitial after logout
authInitial = () => {
	getElement("appHome").classList.remove('hidden');
	getElement("userHome").classList.add("hidden");
}
//CALL initial fetch
initialFetch = () => {
	let[user , status] = getUserAuthCookie();
	if(status) {
		console.log ("before initial fetch",user);
		socket.emit("afterAuth" , user , (data , status) => {
			if(status) {
				authSuccess();
				removeLoading();
				friends = data[0];
				messages = data[1];
				requests = data[2];
				myId = user.userId;
				myEmail = user.email;
				myUsername = user.username;
				createFriendsObjects(friends);
				getElement("chat-friends-list").innerHTML = generateFriendsList(friendsObjects , messages);
				let currentUserData = getUserAuthCookie();
				if(currentUserData[1]) {
					setHeaderInfo(currentUserData[0]);
				}
			}else {
				removeLoading();
			}
		})
	} else {
		removeLoading();
		return ([undefined, false]);
	}
}
//Call Synchronous Initial fetch method
async function callInitialFetch() {
	loading();
	await synchronous(initialFetch);
}
//Is Authenticated or not
isAuth = ( ) => {
	let [result , error] = getCurrentUser();
	if(result) {
		socket.emit('verify' , [result[0] , result[1]], (status) => {
			if(status) {
				console.log("User Authenticated...");
				callInitialFetch();
			} else {
				removeLoading();
				removeCurrentUser();
				console.log("User UnAuthenticated");
			}
		})
	} else {
		removeLoading();
		console.log(error);
		return false;
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
	getElement("registerButton").classList.add("hidden");
}
//Checking passwords are matching and having length more than 6
validPasswords = () => {
	if(!registerEmailStatus){
		getElement("registerEmail").focus();
		return;
	};
	if(!registerUsernameStatus){
		getElement("registerName").focus();
		return;
	};
	registerPasswordStatus=false;
	let password1 = getElement('registerPassword1');
	let password2 = getElement('registerPassword2');
	
	if(password1.value.length >=6 && password1.value.length == password2.value.length) {
		if(password1.value.toLowerCase() === password2.value.toLowerCase()) {
			if(isNoSpecialChracters(password1.value)) {
				clearValidationError(password1);
				clearValidationError(password2);
				registerPasswordStatus=true;
				if(registerPasswordStatus && registerUsernameStatus && registerEmailStatus) {
					getElement("registerButton").classList.remove('hidden');
				}
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
	if(!registerEmailStatus){
		getElement("registerEmail").focus();
		return;
	};
	registerUsernameStatus = false;
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
			loading();
			socket.emit('verifyField' , data , ( status) => {
				removeLoading();
				if(status) {
					registerError('Username Already Taken...');
					focusAndShowError(username);
					return false;
				} else if (status === 'error') {
					registerError('Problem with Server please try again....');
					focusAndShowError(username);
					return false;
				} else {
					registerUsernameStatus=true;
					if(registerPasswordStatus && registerUsernameStatus && registerEmailStatus) {
						getElement("registerButton").classList.remove('hidden');
					}
					clearValidationError(username);
					return true;
				}
			})
		}
	}
}
//Check username AVAILABLE OR not
function isEmailValid(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
//Checking the email available or not in the api
validEmail = () => {
	registerEmailStatus = false;
	let email = getElement('registerEmail');
	if(!isEmailValid(email.value)) {
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
			loading()
			socket.emit('verifyField' , data , (status) => {
				removeLoading();
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
					registerEmailStatus=true;
					if(registerPasswordStatus && registerUsernameStatus && registerEmailStatus) {
						getElement("registerButton").classList.remove('hidden');
					}
					return true;
				}
			})
		}
	}
}
//Async call validation function
async function callValidations(funcName) {
	loading();
	callSyncFunc(validEmail);
	callSyncFunc(validUsername);
	callSyncFunc(validPasswords);
	getElement("registerEmail").blur();
}
showRegisterSuccess = () => {

}
function register ()  {
	loading();
	let registerEmail = getElement('registerEmail');
	let registerName = getElement('registerName');
	let registerPassword1 = getElement('registerPassword1');
	let registerPassword2 = getElement('registerPassword2');
	
	if(registerEmailStatus && registerUsernameStatus && registerPasswordStatus){
		callValidations();
		socket.emit('register' , [registerEmail.value,registerName.value,registerPassword1.value] , (status) => {
			removeLoading();
			if(status == false) {
				registerError("Server issue...");
			}else{
				switch(status) {
					case "SUCCESS": 
						registerEmail.value="";
						registerName.value ="";
						registerPassword1.value = "";
						registerPassword2.value = "";
						statusNormal("registerStatus","Please check mail to verify.<br>Check your spam if link not found.");
						break;
					case "EMAIL_INVALID":
						registerError("Invalid Email...");
						focusAndShowError(registerEmail);
						break;
					case "EMAIL_EXISTS":
						registerError("Email Already Exists...");
						focusAndShowError(registerEmail);
						break;
					case "USERNAME_EXISTS":
						registerError("Username Already Exists...");
						focusAndShowError(registerName);
						break;
					case "USERNAME_LENGTH":
						registerError("Username Length is less...");
						focusAndShowError(registerName);
						break;
					case "PASSWORD_LENGTH":
						registerError("Password Length is less...");
						focusAndShowError(registerPassword1);
						break;
				}
			}
		});
	}
}
//Make all Divs Null 
makeAllDivsNull = () => {
	getElement("chat-display").classList.add("chat-display-emtpy");
	getElement("chat-right-head").classList.add("hidden");
	getElement("chat-display-default").classList.remove("hidden");
	getElement("chat-display-custom").classList.add("hidden");
	getElement("chat-friends-list").innerHTML = "";
	getElement("chat-left-head").innerHTML = "";
	textareaInput.value = "";
}