import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

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

  useEffect(() => {
    socket.on("room-created", (code) => {
      setJoinedRoom(code);
      setError("");
    });

    socket.on("room-joined", (code) => {
      setJoinedRoom(code);
      setError("");
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
      socket.off("room-info");
      socket.off("room-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("error");
    };
  }, []);

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

  if (!usernameSet) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-sm shadow-lg border border-stone-200 p-12 max-w-md w-full">
          <div className="border-l-2 border-stone-800 pl-4 mb-8">
            <h1 className="text-3xl font-serif text-stone-900 mb-1">
              2 of us
            </h1>
            <p className="text-sm text-stone-500 font-light">Enter your name to begin</p>
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-stone-300 rounded-sm mb-4 focus:outline-none focus:border-stone-800 transition-colors font-light text-stone-800"
          />

          <button
            onClick={() => {
              if (!username.trim()) return;
              socket.emit("set-username", username);
              setUsernameSet(true);
            }}
            className="w-full bg-stone-800 text-white py-3 rounded-sm font-light hover:bg-stone-900 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!joinedRoom) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-sm shadow-lg border border-stone-200 p-12 max-w-md w-full">
          <div className="border-l-2 border-stone-800 pl-4 mb-8">
            <h1 className="text-3xl font-serif text-stone-900">
              Room
            </h1>
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-stone-800 text-white py-4 rounded-sm font-light hover:bg-stone-900 transition-colors mb-6"
          >
            Create New Room
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-stone-400 font-light">or join existing</span>
            </div>
          </div>

          <input
            placeholder="4-digit code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-sm mb-4 focus:outline-none focus:border-stone-800 transition-colors text-center text-xl tracking-widest font-light"
            maxLength={4}
          />
          <button
            onClick={joinRoom}
            className="w-full bg-white text-stone-800 py-3 rounded-sm font-light border border-stone-800 hover:bg-stone-800 hover:text-white transition-colors"
          >
            Join Room
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-sm font-light">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-sm shadow-lg border border-stone-200 overflow-hidden">
        <div className="bg-stone-800 p-8 border-b border-stone-700">
          <div className="text-center">
            <p className="text-stone-400 text-xs font-light mb-2 tracking-wider uppercase">
              Room Code
            </p>
            <h1 className="text-4xl font-serif text-white tracking-wider mb-3">
              {joinedRoom}
            </h1>
            {roomInfo && (
              <p className="text-stone-400 text-sm font-light">
                {roomInfo.count} / 2 participants
              </p>
            )}
          </div>
        </div>

        <div className="p-8">
          <div
            className="bg-stone-50 rounded-sm p-6 mb-6 h-96 overflow-y-auto border border-stone-200"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(0, 0, 0, 0.03) 31px, rgba(0, 0, 0, 0.03) 32px)'
            }}
          >
            {messages.map((m, i) => (
              <div key={i} className="mb-4 border-l-2 border-stone-300 pl-4 py-1">
                <p className="text-xs text-stone-500 font-light mb-1">
                  {m.sender}
                </p>
                <p className="text-stone-800 font-light leading-relaxed">
                  {m.message}
                </p>
              </div>
            ))}

            {typingUser && (
              <p className="italic text-stone-400 text-sm font-light pl-4">
                {typingUser} is typing...
              </p>
            )}
          </div>

          <div className="flex gap-3">
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
              placeholder="Write your message..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 transition-colors font-light"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-stone-800 text-white px-8 py-3 rounded-sm font-light hover:bg-stone-900 transition-colors"
            >
              Send
            </button>
          </div>

          {error && (
            <p className="mt-3 text-red-600 text-sm font-light">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}