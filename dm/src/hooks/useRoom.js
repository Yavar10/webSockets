import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

export function useRoom(roomCode, onInvalidRoom) {
  const [roomInfo, setRoomInfo] = useState(null);
  const [counter, setCounter] = useState(0);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    if (!roomCode) return;

    socket.emit("resync-room", roomCode);

    socket.on("room-info", setRoomInfo);
    socket.on("counter-update", ({ value }) => setCounter(value));
    socket.on("room-message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );
    socket.on("user-typing", ({ username }) => setTypingUser(username));
    socket.on("user-stop-typing", () => setTypingUser(null));
    socket.on("resync-failed", onInvalidRoom);

    return () => {
      socket.off("room-info");
      socket.off("counter-update");
      socket.off("room-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("resync-failed");
    };
  }, [roomCode]);

  return {
    roomInfo,
    counter,
    messages,
    typingUser
  };
}
