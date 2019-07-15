
//If The javascript is enabled start doing
getElement('errorDiv').classList.add('hidden');
getElement('mainDivision').classList.remove('hidden');

//Assign The App Name
assignInitialData();
init = () => {
	loading();
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
		var result = login();
		if(result != false) {
			socket.emit('login' , result , (result , status) => {
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
	registerEmailStatus=false;
	registerEmailStatus=validEmail();
})

getElement('registerName').addEventListener('blur' , () => {
	registerUsernameStatus=false;
	registerUsernameStatus=validUsername();
})
getElement('registerPassword1').addEventListener('blur' , () => {
	registerPasswordStatus=false;
	registerPasswordStatus=validPasswords();
})
getElement('registerPassword2').addEventListener('blur' , () => {
	registerPasswordStatus=false;
	registerPasswordStatus=validPasswords();
})

registerButton.addEventListener('click' , () => {
	var result = register();
});