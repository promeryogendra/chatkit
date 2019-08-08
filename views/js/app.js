
//Assign The App Name
assignInitialData();
init = () => {
	let [result , error]= getCurrentUser();
	console.log("loading...");
	if(!error){
		removeLoading();
		console.log("No user.");
	} else {
		isAuth();
	}
}
init();

//Set the color theme
changeTheme('green');

//Events for login and verify Tabs
var loginTab = getElement('tabLogin');
var verifyTab = getElement('tabVerify');

loginTab.addEventListener( 'click' , () => {
	changeLoginTab();
});

verifyTab.addEventListener( 'click' , () => {
	changeVerifyTab();
});
//Event listener for login button
loginButton.addEventListener('click' , () => {
	loading();
		var result = login();
		if(result != false) {
			socket.emit('login' , result , (result , status) => {
				removeLoading();
				getElement('loginPassword').value = "";
				if(status) {
					setCurrentUser(result);
					authSuccess();
					console.log("Login Success...");
					callInitialFetch();
				} else {
					loginError('loginStatus');
					console.log("Login Failure...");
				}
			});
		}else {
			removeLoading();
		}
})


getElement('registerEmail').addEventListener('blur' , () => {
	callSyncFunc(validEmail);
})

getElement('registerName').addEventListener('blur' , () => {
	callSyncFunc(validUsername);
})
getElement('registerPassword1').addEventListener('blur' , () => {
	callSyncFunc(validPasswords);
})
getElement('registerPassword2').addEventListener('blur' , () => {
	callSyncFunc(validPasswords);
})

async function callRegister() {
	loading();
	var result = await synchronous(register);
	
}

registerButton.addEventListener('click' , () => {
	callRegister();
	
});
//Logout user
logoutUser = () => {
	authLoading();
	socket.emit('logout', getUserData() , (status) => {
		authRemoveLoading();
		authInitial();
		removeCurrentUser();
	})
}