//Initialize socket
var socket = io.connect();

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

//Messages
//Return the left chat message
createLeftMessage  = (text , date) => {
	return `
		<div class="message-left flex-row text-non-selectable">
			<span class="message-left-head" >&#9701;</span>
			<div class="message-left-content">
				<div class="message-content">
					${text}
				</div>
				<div class="message-left-status flex-row">
					<div class="message-left-status-time">
							${date}
					</div>
				</div>
			</div>
		</div>
		`
}
//Return the right chat message
createRightMessage = (text , date , seenStatus) => {
	//Create a right message html with seen Status object
	let seenStatusString = '<div class="message-right-status-seen ';
	if(seenStatus === 'seen') {
		seenStatusString += `
				seen">
					<div class="icons">
						<span class="icon1">
							&#10004;
						</span>
						<span class="icon2">
							&#10004;
						</span>
					</div>
				</div>
			`
	} else {
		seenStatusString += `
					notseen">
					<div class="icons">
						<span class="icon1">
							&#10004;
						</span>
						<span class="icon2">
							&#10004;
						</span>
					</div>
				</div>
			`
	}
	return `
	<div class="message-right flex-row text-non-selectable">
		<span class="message-right-head" >&#9700;</span>
		<div class="message-right-content">
			<div class="message-content">
				${text}
			</div>
			<div class="message-right-status flex-row">
				<div class="message-right-status-time">
					${date}
				</div>`+
				seenStatusString+`
		</div>
	</div>
	`
}

displayChatMessages = (id) =>{
	let currentUserMessages = messages[id];
	let messagesList = getElement("chat-display-custom-messages");
	let myPlace = friendsObjects[id].place;
	let notSeen = friendsObjects[id][myPlace+"Count"];
	getElement("chat-display-custom-messages").innerHTML = "";
	currentUserMessages.forEach((message , index) => {
		if(message.senderId === myId) {
			messagesList.innerHTML += createLeftMessage(message.text , message.date);
		} else {
			let status='seen';
			if(notSeen <= index)
				status = '';
			messagesList.innerHTML += createRightMessage(message.text , message.date , status);
		}
	});
}
//Change messages seen Status
messagesSeen = (id) => {
	if(selectedUserUserId===id) {
		let ele = document.getElementById("chat-display-custom-messages");
		let messagesList = ele.querySelectorAll(".notseen");
		for(let i=0; i< messagesList.length ; i++) {
			messagesList[i].classList.add('seen');
			messagesList[i].classList.remove('notseen');
		}
		//Change the friends objects status
	} else {
		//Change the friends objects status
	}
}

assignSelectedUser = (friend) => {
	let oppositePlace = friend.oppositePlace;
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

changeSelectedUserHead = (friend) => {
	let ele = getElement("chat-right-head");
	let temp = `
			<img src="./images/profile-default.png" class="chat-profile-image" alt="Profile">
			<div class="chat-info flex-column">
				<div class="chat-info-username">
					${friend[friend.oppositePlace+"username"]}
				</div>
				<div class="chat-info-email">
					${friend.status}
				</div>
			</div>
	`;
	ele.innerHTML = temp;
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
			changeSelectedUserHead(friend);
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
			changeSelectedUserHead(friend);
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

//Chat input
let textpreviousScroll = 0;
textAreaAdjust = (o) => {
		console.log(o.scrollHeight);
		o.style.cssText = 'height:auto;padding:0;';
		o.style.cssText = 'height:' +  (parseInt(o.scrollHeight)+32) + 'px;padding:10px;';
}
let textareaInput = getElement("chat-display-custom-input-field");
textareaInput.scrollHeight=0;
textareaInput.addEventListener('keydown' , (e) => {
	e = e || event;
	if(e.keyCode == 13) {
		sendMessage();
	}
})
textareaInput.addEventListener('keypress' , (e) => {
	e = e || event;
	if(e.keyCode == 13) {
		e.preventDefault()}
})
sendMessage = () => {
	console.log(textareaInput.value);
	textareaInput.value = "";
	textAreaAdjust(textareaInput);
}
//Chat input socket emits
textareaInput.addEventListener('keypress', () =>{
	socket.emit('typing',myId,selectedUserUserId);
})
//Chat input socket listen
socket.on('typing', (id) => {
	console.log("Typing",id);
})
