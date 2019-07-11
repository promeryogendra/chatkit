//Initialize socket

var socket = io.connect();

var registerUsername = false,
		registerEmail = false,
		registerPassword = false;


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
	localStorage.setItem("UserAuthInfo", JSON.stringify(user));
	localStorage.removeItem('chatKitRequesting');
}
//CallBack from userdata
getUserData = ( ) => {
	let user = JSON.parse(localStorage.getItem('UserAuthInfo'));
	if( user!=undefined &&  user.username && user.id && user.email && user.userId) {
		return [user.userId , user.id];
	}
	// removeCurrentUser();
	return [undefined, false];
}

//Get data from storage 
//getCurrentUser( (result , error) => {} );
//Formate of data [ 'userId' , 'token']
getCurrentUser = ( callBack ) => {
	let data = getUserData();
	if(data[1] == false) {
		callBack(undefined , false);
	}else {
		callBack(data , true);
	}
}
//get UserAuthInfo object with all object data
getUserAuthInfo = (callBack) => {
	let user = JSON.parse(localStorage.getItem('UserAuthInfo'));
	if( user!=undefined &&  user.username && user.id && user.email && user.userId) {
		callBack(user , true);
	}
	// removeCurrentUser();
	callBack( undefined , false);
}
//Remove data from storage
removeCurrentUser = () => {
	localStorage.removeItem('UserAuthInfo');
}
//Listeners that get and request data
onLoad  = () => {
		getUserAuthInfo((result , error) => {
			if(!error){
				console.log("Onload No user data present in this page.");
				//Request other pages to give user data if present.
				localStorage.setItem('chatKitRequesting', true);
			} else {
				console.log("Onload already auth data present in this page.");
			}
	});
}
onLoad();
window.addEventListener('storage' , (event) => {
	if (event.key == 'chatKitRequesting') {
		getUserAuthInfo( (result , error) => {
			if(!error) {
				console.log("Some other tab requesting data.But i don't have data.");
			} else {
				localStorage.removeItem("UserAuthInfo");
				localStorage.setItem("UserAuthInfo",JSON.stringify(result));
			}
		});
	}else if(event.key == 'UserAuthInfo' && localStorage.getItem('chatKitRequesting')==true) {
		localStorage.setItem('UserAuthInfo','');
		localStorage.removeItem('chatKitRequesting');
	}
});

//Is Authenticated or not
isAuth = ( ) => {
	getCurrentUser( (result , error) => {
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
	});
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
	}, 2000);
}


