
data = {
	login : false,
	username : undefined,
	userid : undefined,
	usermail : undefined,
	requestList : []
}

//Data after login
var myId = "";
var friends = [];
var friendsObjects = {};
var messages = {};
var requests = [];

//Chat selected;
var selectedUser = false,
		selectedUserUsername = undefined,
		selectedUserEmail = undefined,
		selectedUserUserId = undefined,
		selectedUserFriendId = undefined,
		selectedUserPlace = undefined;
		typingTimer = '',
		typingStatus = false;