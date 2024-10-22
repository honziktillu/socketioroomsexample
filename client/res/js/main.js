const socket = io("http://localhost:3000");
const users = document.getElementById("users");
const chatInput = document.getElementById("chatInput");
const send = document.getElementById("send");
const chat = document.getElementById("chat");
const roomInput = document.getElementById("roomInput");
const enterRoom = document.getElementById("enterRoom");
const roomInfo = document.getElementById("roomInfo");
const availableRooms = document.getElementById("availableRooms");

let currentRoom;
let username;

const onUserConnect = () => {
  username = `User${Math.round(Math.random() * 1000000)}`;
  socket.emit("save username", username);
};

window.onload = () => {
  onUserConnect();
  socket.emit("get rooms");
};

send.onclick = () => {
  socket.emit("chat", `${username}: ${chatInput.value}`);
  chatInput.value = "";
};

socket.on("chat", (data) => {
  chat.innerHTML += `<p>${data}</p>`;
});

enterRoom.onclick = () => {
  socket.emit("join room", { roomNum: roomInput.value, username: username });
  roomInput.value = "";
};

socket.on("join room", (data) => {
  if (data.status === 1) {
    roomInfo.innerHTML = `${data.message}: ${data.roomNum}`;
    chat.innerHTML = "";
    chatInput.value = "";
    currentRoom = data.roomNum;
    return;
  }
  roomInfo.innerHTML = data.message;
  chat.innerHTML = "";
  chatInput.value = "";
});

socket.on("update room users", (data) => {
  users.innerHTML = "";
  data.map((user) => {
    users.innerHTML += `<p>${user}</p>`;
  });
});

socket.on("get rooms", (data) => {
  availableRooms.innerHTML = "<p>Available rooms</p>";
  data.map((roomNum) => {
    availableRooms.innerHTML += `
            <p>${roomNum}</p>
        `;
  });
});
