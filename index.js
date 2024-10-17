const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.sendFile("/index.html");
});

const rooms = new Set(["0", "1", "2"]);
const roomsInfo = [
  {
    roomNum: 1,
    users: new Set(),
  },
  {
    roomNum: 2,
    users: new Set(),
  },
  {
    roomNum: 3,
    users: new Set(),
  },
];

io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.handshake.address}, ${socket.handshake.time}`
  );

  socket.on("save username", (data) => {
    socket.data.user = data;
  });

  socket.on("disconnect", () => {
    console.log(`${socket.data.user} disconnected`);
    if (socket.data.room) {
      roomsInfo[socket.data.room].users.delete(socket.data.user);
      io.to(socket.data.room).emit("update room users", [
        ...roomsInfo[socket.data.room].users,
      ]);
    }
    io.emit("user disconnected", socket.data.user);
  });

  socket.on("chat", (data) => {
    io.emit("chat", data);
  });

  socket.on("join room", (data) => {
    if (rooms.has(data.roomNum)) {
      if (socket.data.room) {
        roomsInfo[socket.data.room].users.delete(socket.data.user);
        io.to(socket.data.room).emit("update room users", [
          ...roomsInfo[socket.data.room].users,
        ]);
      }
      roomsInfo[data.roomNum].users.add(socket.data.user);
      socket.join(data.roomNum);
      socket.data.room = data.roomNum;
      console.log(roomsInfo[data.roomNum].users);
      const payload = {
        message: "Room joined",
        status: 1,
        roomNum: data.roomNum,
      };
      io.to(data.roomNum).emit("update room users", [
        ...roomsInfo[data.roomNum].users,
      ]);
      return socket.emit("join room", payload);
    }
    const payload = {
      message: "Room does not exist",
      status: 0,
    };
    socket.emit("join room", payload);
  });

  socket.on("get rooms", () => {
    socket.emit("get rooms", [...rooms]);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
