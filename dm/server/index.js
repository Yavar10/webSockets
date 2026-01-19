import { createServer } from "http";
import { Server } from "socket.io";

/* ================= SERVER SETUP ================= */

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" } // 🔒 OK for now, restrict later
});

const PORT = process.env.PORT || 3001;

/* ================= STATE ================= */

/*
  roomState is the SINGLE source of truth.
  If a room exists, it must exist here.
*/
const roomState = {};

/*
  rooms Set is optional bookkeeping,
  but all critical checks should use roomState
*/
const rooms = new Set();

/* ================= SOCKET LOGIC ================= */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* -------- Typing indicators (ephemeral state) -------- */

  socket.on("typing", (roomCode) => {
    if (!roomCode) return;
    socket.to(roomCode).emit("user-typing", {
      username: socket.username
    });
  });

  socket.on("stop-typing", (roomCode) => {
    if (!roomCode) return;
    socket.to(roomCode).emit("user-stop-typing");
  });

  /* -------- Room creation -------- */

  socket.on("create-room", (roomCode) => {
    if (!roomCode) return;

    socket.join(roomCode);
    rooms.add(roomCode);

    // ✅ authoritative room state initialization
    roomState[roomCode] = {
      ready: new Set(),
      locked: false,
      counter: 0
    };

    emitRoomInfo(roomCode);
    socket.emit("room-created", roomCode);
  });

  /* -------- Shared counter (authoritative) -------- */

  socket.on("increment-counter", (roomCode) => {
    if (!roomState[roomCode]) return;

    roomState[roomCode].counter += 1;

    io.to(roomCode).emit("counter-update", {
      value: roomState[roomCode].counter
    });
  });

  socket.on("decrement-counter", (roomCode) => {
    if (!roomState[roomCode]) return;

    roomState[roomCode].counter -= 1;

    io.to(roomCode).emit("counter-update", {
      value: roomState[roomCode].counter
    });
  });

  /* -------- Username -------- */

  socket.on("set-username", (username) => {
    socket.username = username;
    console.log(`User ${socket.id} set username: ${username}`);
  });

  /* -------- Join room -------- */

  socket.on("join-room", (roomCode) => {
    if (!roomState[roomCode]) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (roomState[roomCode].locked) {
      socket.emit("error", "Room is locked");
      return;
    }

    const room = io.sockets.adapter.rooms.get(roomCode);
    const count = room ? room.size : 0;

    if (count >= 2) {
      socket.emit("error", "Room is full");
      return;
    }

    socket.join(roomCode);

    // ✅ send authoritative state immediately
    socket.emit("counter-update", {
      value: roomState[roomCode].counter
    });

    emitRoomInfo(roomCode);
    socket.emit("room-joined", roomCode);
  });

  /* -------- Ready / Lock system -------- */

  socket.on("player-ready", (roomCode) => {
    if (!roomState[roomCode] || roomState[roomCode].locked) return;

    roomState[roomCode].ready.add(socket.id);

    io.to(roomCode).emit("ready-update", {
      count: roomState[roomCode].ready.size
    });

    if (roomState[roomCode].ready.size === 2) {
      roomState[roomCode].locked = true;
      io.to(roomCode).emit("room-locked");
    }
  });

  socket.on("player-unready", (roomCode) => {
    if (!roomState[roomCode]) return;

    roomState[roomCode].ready.delete(socket.id);

    io.to(roomCode).emit("ready-update", {
      count: roomState[roomCode].ready.size
    });
  });

  /* -------- Messages -------- */

  socket.on("send-room-message", ({ roomCode, message }) => {
    if (!roomCode || !message) return;

    io.to(roomCode).emit("room-message", {
      message,
      sender: socket.username || "Anonymous",
      time: Date.now()
    });
  });

  /* -------- Reconnect / Resync -------- */

  socket.on("resync-room", (roomCode) => {
    if (!roomState[roomCode]) return;

    // ✅ avoid redundant joins
    if (!socket.rooms.has(roomCode)) {
      socket.join(roomCode);
    }

    socket.emit("room-info", {
      roomCode,
      count: io.sockets.adapter.rooms.get(roomCode)?.size || 0
    });

    socket.emit("counter-update", {
      value: roomState[roomCode].counter
    });
  });

  /* -------- Disconnect handling -------- */

  socket.on("disconnecting", () => {
    console.log("User disconnecting:", socket.id);

    for (const roomCode of socket.rooms) {
      if (roomCode === socket.id) continue;

      const state = roomState[roomCode];
      const room = io.sockets.adapter.rooms.get(roomCode);

      // ✅ remove from ready set to avoid stale locks
      state?.ready.delete(socket.id);

      if (!room || room.size === 1) {
        delete roomState[roomCode];
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

  /* -------- Helpers -------- */

  function emitRoomInfo(roomCode) {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const count = room ? room.size : 0;

    io.to(roomCode).emit("room-info", {
      roomCode,
      count
    });
  }
});

/* ================= START SERVER ================= */

httpServer.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
