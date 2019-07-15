
//If The javascript is enabled start doing
getElement('errorDiv').classList.add('hidden');
getElement('mainDivision').classList.remove('hidden');

//Assign The App Name
assignInitialData();
init = () => {
	let [result , error]= getCurrentUser();
	console.log("loading...");
	if(!error){
		console.log("No user.");
	} else {
		isAuth();
	}
	removeLoading();
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
				if(status) {
					setCurrentUser(result);
					console.log("Login Success...");
				} else {
					loginError('loginStatus');
					console.log("Login Failure...");
				}
			});
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
	// removeLoading();
}

registerButton.addEventListener('click' , () => {
	callRegister();
});