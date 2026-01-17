import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  socket.on("send-message", (msg) => {
    io.emit("receive-message", msg);
  });
});



httpServer.listen(3001, () => {
  console.log("Chat server running on port 3001");
});
