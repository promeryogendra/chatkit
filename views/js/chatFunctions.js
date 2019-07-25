
//Method that return element by taking id as input
getElement = (name) => {
	return document.getElementById(name);
}

createFriendsObjects = (friends) => {
	friends.forEach(friend => {
		friendsObjects[friend[friend.oppositePlace]] = friend;
	});
} 

getEmptyObjects = (data) => {
	let result = {};
	Object.keys(data).forEach(key => {
		if(data[key].length == 0) 
			result[key]= [];
	});
	return result;
}

getNonEmptyObjects = (data )=> {
	let result = {};
	Object.keys(data).forEach(key => {
		if(data[key].length != 0) 
			result[key] = data[key];
	});
	return result;
}

sortMessageTimings = (data) => {
	let empty = getEmptyObjects(data);
	let nonEmpty = getNonEmptyObjects(data);
	let result = {};
	Object.keys(nonEmpty).sort(function(a, b){
				if(nonEmpty[a].length == 0)return 1;
				if(nonEmpty[b].length == 0)return -1;
				return new Date(nonEmpty[b][0].date)  > new Date(nonEmpty[a][0].date) ? 1  : -1;
    })
    .forEach(function(key) {
        result[key] = nonEmpty[key];
    });
	return {...result,...empty};
}

getMessageCount = (friend) => {
	if(friend[friend.oppositePlace+"Count"] !== 0) {
		return [friend[friend.oppositePlace+"Count"] , ""];
	} else {
		return [friend[friend.oppositePlace+"Count"] , "hidden"];
	}
}

displayChatMessages = (id) =>{
	getElement("chat-display-custom").innerHTML = JSON.stringify(messages[id]);
}

assignSelectedUser = (friend) => {
	let oppositePlace = friend.oppositePlace;
	console.log(friend.oppositePlace);
	selectedUserUsername = friend[oppositePlace+"username"];
	selectedUserEmail = friend[oppositePlace+"email"];
	selectedUserUserId = friend[oppositePlace];
	selectedUserFriendId = friend.id;
	selectedUserPlace = oppositePlace;
}

checkMessageStatus = (friend , oppositePlace) => {
	if(friend[oppositePlace+"Count"] === 0) {
		console.log("no new messages")
	} else {
		console.log("you have new messages");
	}
	if(friend[friend.place+"Count"] === 0) {
		console.log("user seen all messages ")
	} else {
		console.log("user not yet seen messages");
	}
}

friendSelected =(id) => {
	getElement(id).classList.add("userSelected");
	if(selectedUser) {
		if(selectedUserUserId === id) {
			console.log("Already this user selected selected");
		}else {
			getElement(selectedUserUserId).classList.remove("userSelected");
			let friend = friendsObjects[id];
			assignSelectedUser(friend);
			checkMessageStatus(friend,friend.oppositePlace);
			displayChatMessages(id);
		}
	} else {
			selectedUser = true;
			let friend = friendsObjects[id];
			assignSelectedUser(friend);
			checkMessageStatus(friend,friend.oppositePlace);
			displayChatMessages(id);
			getElement("chat-display").classList.remove("chat-display-emtpy");
			getElement("chat-right-head").classList.remove("hidden");
			getElement("chat-display-default").classList.add("hidden");
			getElement("chat-display-custom").classList.remove("hidden");
	}
}
generateFriendsList = (friendsObjects , messages) => {
	let listString = '';
	Object.keys(messages).forEach(key => {
		let friend = friendsObjects[key];
		let oppositePlace = friend.oppositePlace;
		let id = friend[oppositePlace];
		let newMessageCount = getMessageCount(friend);
		let temp = `
				<div id="${id}" class="friend" onclick="friendSelected('${id}');console.log('${id}');">
						<img class="chat-profile-image" src="./images/profile-default.png" alt="">
						<div class="friend-info flex-column">
								<div id="${id+"-username"}" class="friend-info-username">
									${friend[oppositePlace+'username']}
								</div>
								<div  id="${id+"-email"}" class="friend-info-email">
									 ${friend[oppositePlace+"email"]}
								</div>
							</div>
							<div class="friend-status">
								<div id="${id+"-connection"}" class="friend-status-connection online">
									${friend.status}
								</div>
								<div id="${id+"-messageCount"}" class="friend-status-message-count ${newMessageCount[1]}">
									${newMessageCount[0]}
								</div>
							</div>
						</div>
		`
		listString+= temp;
	});
	return listString;
}

setHeaderInfo = (user) => {
	
	let temp = `
			<img src="./images/profile-default.png" class="chat-profile-image" alt="Profile">
			<div class="chat-info flex-column">
				<div class="chat-info-username">
					${user.username}
				</div>
				<div class="chat-info-email">
					${user.email}
				</div>
			</div>
			<div class="chat-logout">
				<button class="confirm-button" onclick="logoutUser();">LogOut</button>
			</div>
	`;
	getElement("chat-left-head").innerHTML = temp;
}

let chatFriendsSearch = getElement("chat-friends-search");
chatFriendsSearch.value = "";
chatFriendsSearch.addEventListener('keyup' , () => {
			let searchString = chatFriendsSearch.value.replace(" ",'');
			console.log(searchString);	
			if(searchString.length == 0) {
				friends.forEach(friend => {
					getElement(friend[friend.oppositePlace]).classList.remove("hidden");
				});
			} else { 
				friends.forEach(friend => {
					let oppositePlace = friend.oppositePlace;
					if(friend[oppositePlace+"username"].includes(searchString) || friend[oppositePlace+"email"].includes(searchString)) {
						getElement(friend[oppositePlace]).classList.remove("hidden");
					}else {
						getElement(friend[oppositePlace]).classList.add("hidden");
					}
				});
			}
			
		})

changeConnectionStatus = (id , status) => {
	let ele = getElement(id+"-status");
	if(status == "offline") {
		ele.classList.remove("online");
	} else {
		ele.classList.remove("offline");
	}
	ele.classList.add(status);
	ele.innerHTML = status;
}

changeMessageCount = (id , count) => {
	let ele = getElement(id+"-messageCount");
	if(count == 0) {
		ele.classList.add("hidden");
	}else {
		ele.classList.remove("hidden");
	}
	ele.innerHTML = count;
}

changePosition = (id) => {
	let ele = getElement(id);
	let friendList = getElement("chat-friends-list");
	friendList.insertBefore(ele, friendList.childNodes[0]);
}
