
data = {
	login : false,
	username : undefined,
	userid : undefined,
	usermail : undefined,
	requestList : []
}

//Data after login
var friends = [];
var friendsObjects = {};
var messages = {};
var requests = [];

// MyData
var myId = "",
		myUsername = "",
		myEmail = "";
//Chat selected;
var selectedUser = false,
		selectedUserUsername = undefined,
		selectedUserEmail = undefined,
		selectedUserUserId = undefined,
		selectedUserFriendId = undefined,
		selectedUserPlace = undefined;
		typingTimer = '',
		typingStatus = false;
//Make data null
makeDataNull = () => {
	messages = {};
	requests = [];
	friendsObjects = {};
	friends = [];

	myId = "",
	myUsername = "",
	myEmail = "";

	selectedUser = false,
	selectedUserUsername = undefined,
	selectedUserEmail = undefined,
	selectedUserUserId = undefined,
	selectedUserFriendId = undefined,
	selectedUserPlace = undefined;
	typingTimer = '',
	typingStatus = false;
}
