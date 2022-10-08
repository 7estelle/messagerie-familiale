const socket = io("https://whispering-chamber-09886.herokuapp.com/");
// const socket = io("http://localhost:3000");


// VARIABLES

let usernameInput;
let queryString;
let params;
let messages = [];
let messageList = document.getElementById('message-list');
let chatContainer = document.getElementsByClassName('chat-container');
let msgItem = document.getElementsByClassName('message-item');
let lastMsg;
let users = [];
let usersList = document.getElementById('users-list');
let messageInput;


// FUNCTIONS

// Retrieve username from GET parameter
function retrieveUsername() {
  queryString = window.location.search;
  params = new URLSearchParams(queryString);
  usernameInput = params.get("username");

  if (usernameInput == "" || usernameInput == undefined) {
    usernameInput = 'Anonymous';
  }

  return usernameInput;
}

function renderMessages() {
  messages.forEach((msg) =>
    messageList.innerHTML += `<div class="msg-item-parent"><div class="message-item">
    <p class="message-item__text">${msg.value}</p>
    <p class="message-item__author">${msg.user.name}</p>
    <p class="message-item__time">à ${new Date(msg.time).toLocaleTimeString().slice(0, -3).replace(':', 'h')}</p>
    </div></div>`
  );
}

function renderOneMessage(message) {
  messageList.innerHTML += `<div class="msg-item-parent"><div class="message-item">
  <p class="message-item__text">${message.value}</p>
  <p class="message-item__author">${message.user.name}</p>
  <p class="message-item__time">à ${new Date(message.time).toLocaleTimeString().slice(0, -3).replace(':', 'h')}</p>
  </div></div>`
  if (socket.id == message.user.id) {
    lastMsg = document.getElementById('message-list').lastChild;
    lastMsg.classList.add("me");
  }
  document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
}

function renderUsers() {
  users.forEach((usr) =>
    usersList.innerHTML += `<div class="username-item">
  <div class="username__pp"></div>
  <p class="username" data-id="${usr.id}">${usr.name}</p>
  </div>
  `
  );
}

function renderOneUser(usr) {
  users.forEach((connectedUser) => {
    usersList.innerHTML += `<div class="username-item">
      <div class="username__pp"></div>
      <p class="username" data-id="${usr.id}">${usr.name}</p>
      </div>
      `
  })
}

// Retrieve message from input and send it with author's username
function sendMessageInput(e) {
  document.getElementById("messageInput").addEventListener('keydown', function (e) {
    if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
      if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
        e.preventDefault();
        // usernameInput = document.getElementById("usernameInput").value;

        messageInput = document.getElementById("messageInput").value;
        socket.emit("message", messageInput);
        document.getElementById("messageInput").value = "";
      }
    }
  });
}

// Disconnection

socket.on("disconnect", () => this.disconnect());

socket.on("userDisconnection", (formerUser) => {
  console.log(formerUser.name + " disconnected");
  const elDisconnected = document.querySelector(`[data-id="${formerUser.id}"]`)
  if (elDisconnected != null) {
    elDisconnected.remove();
  }
  users.forEach((connectedUser) => {
    if (connectedUser.id == formerUser.id) {
      users.splice(Object.values(connectedUser.id))
    }
  })
});

// Connection

socket.on("userConnection", (newUser) => {
  users.push(newUser);
  renderOneUser(newUser);
});

socket.emit('setUsername', retrieveUsername());


// Get all messages

socket.emit("getMessages");
socket.on('messages', (allMessages) => {
  messages = allMessages.slice(-5);
  renderMessages();
})

// Get all users
socket.emit("getUsers");
socket.on('users', (allUsers) => {
  users = allUsers.slice(-5);
  renderUsers();
})

sendMessageInput();

// Get the new message
socket.on('message', (message) => {
  messages.push(message);
  renderOneMessage(message);
})

// Receive the user that had just updated his username, and change the connected users list with the new username
socket.on('updateUsername', (user) => {
  const elUsername = document.querySelector(`[data-id="${user.id}"]`)
  if (elUsername != null) {
    elUsername.innerHTML = user.name;
  }
})