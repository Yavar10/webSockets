import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

export function useAuth() {
  const [username, setUsername] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) {
      setUsername(saved);
      setUsernameSet(true);
      socket.emit("set-username", saved);
    }
  }, []);

  const setAuth = (name) => {
    localStorage.setItem("username", name);
    socket.emit("set-username", name);
    setUsername(name);
    setUsernameSet(true);
  };

  return { username, usernameSet, setAuth };
}
