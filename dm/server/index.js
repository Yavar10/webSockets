import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const rooms = new Set();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

socket.on("typing", (roomCode) => {
  socket.to(roomCode).emit("user-typing", {
    username: socket.username
  });
});

socket.on("stop-typing", (roomCode) => {
  socket.to(roomCode).emit("user-stop-typing");
});


  socket.on("create-room", (roomCode) => {
    socket.join(roomCode);
    rooms.add(roomCode);

    emitRoomInfo(roomCode);

    socket.emit("room-created", roomCode);
});



socket.on("set-username", (username) => {
    socket.username = username;
    console.log(`User ${socket.id} set username: ${username}`);
});



socket.on("join-room", (roomCode) => {
    if (!rooms.has(roomCode)) {
        socket.emit("error", "Room does not exist");
        return;
    }
    
    const room = io.sockets.adapter.rooms.get(roomCode);
    const count = room ? room.size : 0;
    
    if (count>=2) {
        socket.emit("error", "Room is full");
        return;
    }
    socket.join(roomCode);
    emitRoomInfo(roomCode);
    socket.emit("room-joined", roomCode);
});

  socket.on("send-room-message", ({ roomCode, message }) => {
  // basic validation
  if (!roomCode || !message) return;

  io.to(roomCode).emit("room-message", {
    message,
    sender: socket.username || "Anonymous",
    time: Date.now()
  });
});


  socket.on("disconnecting", () => {
  console.log("User disconnecting:", socket.id);

  for (const roomCode of socket.rooms) {
    if (roomCode === socket.id) continue;

    const room = io.sockets.adapter.rooms.get(roomCode);

    if (!room || room.size === 1) {
      // This socket was the last one
      rooms.delete(roomCode);
      console.log(`Room deleted: ${roomCode}`);
    } else {
      emitRoomInfo(roomCode);
    }
  }
});

socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id);
});


  function emitRoomInfo(roomCode) {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const count = room ? room.size : 0;

    io.to(roomCode).emit("room-info", {
      roomCode,
      count
    });
  }
});

httpServer.listen(3001, () => {
  console.log("Server running on port 3001");
});
