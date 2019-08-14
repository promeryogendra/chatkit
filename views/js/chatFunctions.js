//Initialize socket
var socket = io.connect();


//Method that return element by taking id as input
getElement = (name) => {
	return document.getElementById(name);
}


let textareaInput = getElement("chat-display-custom-input-field");

clearTyping = () => {
	if(selectedUser)
		socket.emit('typingStopped',myId,selectedUserUserId);
	typingStatus = false;
}
changeDataStatus = (id, status) => {
   for(let i in friends) {
     if (friends[i][friends[i].oppositePlace] === id) {
        friends[i].status = status;
        break; //Stop this loop, we found it!
     }
   }
	 friendsObjects[id].status = status;
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
convertDate = (date) => {
	let d = new Date(date);
	return d.toLocaleDateString().replace(/\//g,'/') + " " +d.toLocaleTimeString().replace(/\//g,'/');
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
							${convertDate(date)}
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
					${convertDate(date)}
				</div>`+
				seenStatusString+`
			</div>
		</div>
	</div>
	`
}

displayChatMessages = (id) =>{
	let currentUserMessages = messages[id];
	let messagesList = getElement("chat-display-custom-messages");
	let myPlace = friendsObjects[id].place;
	let notSeen = friendsObjects[id][myPlace+"Count"];
	messagesList.innerHTML = "";
	currentUserMessages.forEach((message , index) => {
		if(message.senderId !== myId) {
			messagesList.innerHTML = createLeftMessage(message.text , message.date) + messagesList.innerHTML;
		} else {
			let status='seen';
			if(index <= notSeen)
				status = '';
			messagesList.innerHTML = createRightMessage(message.text , message.date , status) + messagesList.innerHTML;
		}
	});
	messagesList.lastElementChild.scrollIntoView(false);
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
	clearTyping();
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
	let tmp = 'online',_class="online-head";
	if(friend.status === "offline") {
		tmp = "offline";
		_class = "offline-head";
	}

	let temp = `
			<img src="./images/profile-default.png" class="chat-profile-image" alt="Profile">
			<div class="chat-info flex-column">
				<div class="chat-info-username">
					${friend[friend.oppositePlace+"username"]}
				</div>
				<div id="${friend[friend.oppositePlace]}-head" class="chat-info-email ${_class}">
					${tmp}
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
			textareaInput.value = "";
			textareaInput.focus();
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
			textareaInput.value = "";
			textareaInput.focus();
	}
}
generateFriendsList = (friendsObjects , messages) => {
	let listString = '';
	Object.keys(messages).forEach(key => {
		let friend = friendsObjects[key];
		let oppositePlace = friend.oppositePlace;
		let id = friend[oppositePlace];

		let tmpStatus = 'online';
		if(friend.status === "offline") tmpStatus = "offline";

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
								<div id="${id+"-connection"}" class="friend-status-connection ${tmpStatus}">
									${tmpStatus}
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
	let ele = getElement(id+"-connection");
	if(status === "offline") {
		ele.classList.remove("online");
		ele.classList.add("offline");
	} else {
		ele.classList.remove("offline");
		ele.classList.add("online");
	}
	ele.innerHTML = status;
	if(selectedUserUserId === id) {
		ele = getElement(id+"-head");
		if(status === "offline") {
			ele.classList.remove("online-head");
			ele.classList.add("offline-head");
		} else {
			ele.classList.remove("offline-head");
			ele.classList.add("online-head");
		}
		ele.innerHTML = status;
	}
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
		o.style.cssText = 'height:auto;padding:0;';
		o.style.cssText = 'height:' +  (parseInt(o.scrollHeight)+32) + 'px;padding:10px;';
}
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
//Frind Friend Id
findFriendId = (id) => {
	for(let i=0;i<friends.length;i++) {
		let friend  = friends[i];
		if(friend.user1 === id || friend.user2 === id) {
			return friend.id;
		}
	}
}
//Create message Object 
createMessageObject = (message) => {
	return {
		friendsId : findFriendId(selectedUserUserId),
		receiverEmail : selectedUserEmail,
		receiverId : selectedUserUserId,
		receiverUsername : selectedUserUsername,
		senderEmail : myEmail,
		senderId : myId,
		senderUsername : myUsername,
		text: message
		};
}
//Change Data count
changeDataCount = (id , status) => {
	let place = "user1";
	if(friendsObjects[id].user2 === id) {
		place = "user2";
	}
	if(status === "notseen") {
		friendsObjects[id][place+"Count"] += 1;
		friendsObjects[id][place+"Status"] = status;
	} else {
		friendsObjects[id][place+"Count"] = 0;
		friendsObjects[id][place+"Status"] = "seen";
	}
	console.log("message count updated");
}

//Update message array
updateMessageArray = (message,id) => {
	let tempMessages = messages[id];
	for(let i=0;i<tempMessages.length ; i++) {
		let tmp = tempMessages[i];
		console.log(new Date(message.date) > new Date(tmp.date));
		if(new Date(message.date) > new Date(tmp.date)) {
			console.log(message);
			messages[id].splice(i,0,message);
			if(i==0) {
				return true;
			} else {
				return false;
			}
		}
	}
	return undefined;
}
//Temp function1 for createing right message
tempFunction1 = (result , message) => {
	console.log(message,result);
	if(result) {
		let ele = getElement("chat-display-custom-messages");
		ele.innerHTML += createRightMessage(message.text , message.date , '') 
		ele.lastElementChild.scrollIntoView(false);
		console.log("-")
	} else {
		displayChatMessages(message.receiverId)
	}
}
//Temp function1 for createing left message
tempFunction2 = (result , message) => {
	console.log(message,result);
	if(result) {
		let ele = getElement("chat-display-custom-messages");
		ele.innerHTML += createLeftMessage(message.text , message.date ) 
		ele.lastElementChild.scrollIntoView(false);
		console.log()
	} else {
		displayChatMessages(message.receiverId)
	}
}
//Add message messages Array Based on reciver Id and Sender Id
addMessage = (message) => {
	let result = false;
	if(message.senderId === myId) {
		changePosition(message.receiverId);
		changeDataCount(message.receiverId , "notseen");
		if(selectedUserUserId === message.receiverId) {
			result = updateMessageArray(message,message.receiverId);
			tempFunction1(result,message);
		} else {
			result = updateMessageArray(message,message.receiverId);
			tempFunction1(result,message);
		}
	} else {
		changePosition(message.senderId);
		changeDataCount(message.senderId , "notseen");
		if(selectedUserUserId === message.senderId) {
			result = updateMessageArray(message,message.senderId);
			tempFunction2(result,message);
			//Currently update the message array and also messages display
		} else {
			result = updateMessageArray(message,message.senderId);
			tempFunction2(result,message);
			console.log(friendsObjects[friendsObjects.oppositePlace+"Count"]);
			//Update only messages array
		}
	}
}
sendMessage = () => {
	console.log(textareaInput.value);
	if(textareaInput.value.trim()!== '') {
		let text = textareaInput.value.trim();
		let msg = createMessageObject(text);
		socket.emit('newMessage',msg,(status, message) => {
			if(status) {
				console.log("Message came return perfectly...");
				addMessage(message);
			} else {
				console.log("Something went wrong...");
			}
		})
		textareaInput.value='';
		clearTyping();
		textAreaAdjust(textareaInput);
	}
}
//Chat input socket emits
textareaInput.addEventListener('keypress', (e) =>{
	if(!typingStatus && e.keyCode!= 13) {
		socket.emit('typing',myId,selectedUserUserId);
		typingStatus = true;
	}
	clearTimeout(typingTimer);
	typingTimer = setTimeout(function() {
		socket.emit('typingStopped',myId,selectedUserUserId);
		typingStatus = false;
	}, 1000);
});
//Chat input socket listen typing started
socket.on('typing', (id) => {
	console.log("Typing",id);
	changeConnectionStatus(id, "typing...");
})
//Chat input socket listen typing stopped
socket.on("typingStopped" , (id) => {
	console.log('typing stpped , ',id);
	changeConnectionStatus(id,friendsObjects[id].status);
})
//Friend went offline
socket.on("offline" , (id) => {
	console.log(id,"offline");
	changeDataStatus(id,"offline");
	changeConnectionStatus(id,"offline");
})
//Friend came online
socket.on("online" , (id) => {
	console.log(id,"online");
	changeDataStatus(id,"online");
	changeConnectionStatus(id,"online");
})
//New Message 
socket.on('newMessage', (message) => {
	if(selectedUserUserId === message.receiverId) {
		console.log("Message recieved successfully and user is selected...");
		addMessage(message);
	} else {
		console.log("Message recieved successfully and user is not selected...");
		addMessage(message);
	}
})
//Update status of seen or notseen
