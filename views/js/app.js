
//If The javascript is enabled start doing
getElement('errorDiv').classList.add('hidden');
getElement('mainDivision').classList.remove('hidden');

//Assign The App Name
assignInitialData();

getCurrentUser( (result , error) => {
	if(!error){
		console.log("No user.");
	} else {
		isAuth();
	}
} );

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
					localStorage.removeItem('chatKitRequesting');
					setCurrentUser(result);
					console.log("Login Success...");
				} else {
					loginError('loginStatus');
					console.log("Login Failure...");
				}
			});
		}
})


