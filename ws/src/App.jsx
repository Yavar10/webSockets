import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);


  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });
socket.on("receive-message", (msg) => {
  setMessages((prev) => [...prev, msg]);
});

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat App</h1>
      <p>{socket.id}</p>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>
      <input
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Type message"
/>

<button
  onClick={() => {
    socket.emit("send-message", message);
    setMessage("");
  }}
>
  Send
</button>
<ul>
  {messages.map((m, i) => (
    <li key={i}>{m}</li>
  ))}
</ul>

    </div>
  );
}
