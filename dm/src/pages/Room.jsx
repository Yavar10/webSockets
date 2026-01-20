import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import { useRoom } from "../hooks/useRoom";
import RoomPageUI from "../pages/RoomPageUI";

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  // local UI state
  const [messageInput, setMessageInput] = useState("");
  const typingTimeoutRef = useRef(null);

  // authoritative room state from hook
  const { roomInfo, counter, messages, typingUser } = useRoom(
    roomCode,
    () => {
      // resync failed → room does not exist
      localStorage.removeItem("roomCode");
      navigate("/lobby", { replace: true });
    }
  );

  /* ================= MESSAGE HANDLERS ================= */

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    socket.emit("typing", roomCode);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", roomCode);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("send-room-message", {
      roomCode,
      message: messageInput
    });

    socket.emit("stop-typing", roomCode);
    setMessageInput("");
  };

  /* ================= COUNTER HANDLERS ================= */

  const handleIncrement = () => {
    socket.emit("increment-counter", roomCode);
  };

  const handleDecrement = () => {
    socket.emit("decrement-counter", roomCode);
  };

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  /* ================= RENDER ================= */

  return (
    <RoomPageUI
      roomCode={roomCode}
      roomInfo={roomInfo}
      counter={counter}
      messages={messages}
      typingUser={typingUser}
      messageInput={messageInput}
      onMessageChange={handleMessageChange}
      onSendMessage={handleSendMessage}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
    />
  );
};

export default Room;
