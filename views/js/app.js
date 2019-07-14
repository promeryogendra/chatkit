
//If The javascript is enabled start doing
getElement('errorDiv').classList.add('hidden');
getElement('mainDivision').classList.remove('hidden');

//Assign The App Name
assignInitialData();
//Call init Function to check user auth
async function init() {
	loading();
	let [result , error] = await synchronous(getCurrentUser);
	console.log("loading...");
	if(!error){
		console.log("No user.");
	} else {
		await isAuth();
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
	validEmail();
})

getElement('registerName').addEventListener('blur' , () => {
	validUsername();
})
getElement('registerPassword2').addEventListener('blur' , () => {
	validPasswords();
})
getElement('registerPassword1').addEventListener('blur' , () => {
	validPasswords();
})
async function callRegister() {
	await synchronousNoCallback(register);
}
registerButton.addEventListener('click' , () => {
	loading();
	callRegister();
	removeLoading();
});
