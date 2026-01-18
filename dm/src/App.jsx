import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

/* 🔑 DEPLOYMENT-SAFE SOCKET URL */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

export default function App() {
  const [username, setUsername] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);

  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const [roomCode, setRoomCode] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const [counter, setCounter] = useState(0);

  /* ================= SOCKET LISTENERS ================= */

  useEffect(() => {
    socket.on("room-created", (code) => {
      setJoinedRoom(code);
      setError("");
    });

    socket.on("room-joined", (code) => {
      setJoinedRoom(code);
      setError("");
    });

    socket.on("counter-update", ({ value }) => {
      setCounter(value);
    });

    socket.on("room-info", (info) => {
      setRoomInfo(info);
    });

    socket.on("room-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user-typing", ({ username }) => {
      setTypingUser(username);
    });

    socket.on("user-stop-typing", () => {
      setTypingUser(null);
    });

    socket.on("error", (msg) => {
      setError(msg);
    });

    return () => {
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("counter-update");
      socket.off("room-info");
      socket.off("room-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("error");
    };
  }, []);

  /* ================= ACTIONS ================= */

  const createRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    socket.emit("create-room", code);
  };

  const joinRoom = () => {
    if (roomCode.length !== 4) {
      setError("Enter a valid 4-digit room code");
      return;
    }
    socket.emit("join-room", roomCode);
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("send-room-message", {
      roomCode: joinedRoom,
      message: messageInput
    });

    socket.emit("stop-typing", joinedRoom);
    setMessageInput("");
  };

  /* ================= UI ================= */

  if (!usernameSet) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 border shadow max-w-md w-full">
          <h1 className="text-2xl mb-4">Enter Username</h1>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <button
            onClick={() => {
              if (!username.trim()) return;
              socket.emit("set-username", username);
              setUsernameSet(true);
            }}
            className="w-full bg-black text-white p-2"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!joinedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-10 border">
          <button onClick={createRoom}>Create Room</button>

          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="4-digit code"
            className="block mt-4 border p-2"
          />

          <button onClick={joinRoom} className="mt-2">
            Join Room
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1>Room: {joinedRoom}</h1>
      <p>Participants: {roomInfo?.count} / 2</p>

      <h2 className="text-2xl mt-4">Shared Counter</h2>
      <div className="text-4xl">{counter}</div>

      <button onClick={() => socket.emit("increment-counter", joinedRoom)}>
        +
      </button>
      <button onClick={() => socket.emit("decrement-counter", joinedRoom)}>
        -
      </button>

      <div className="mt-6">
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}:</b> {m.message}
          </div>
        ))}
      </div>

      <input
        value={messageInput}
        onChange={(e) => {
          setMessageInput(e.target.value);
          socket.emit("typing", joinedRoom);

          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", joinedRoom);
          }, 500);
        }}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button onClick={sendMessage}>Send</button>

      {typingUser && <p>{typingUser} is typing...</p>}
    </div>
  );
}
