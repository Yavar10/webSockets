import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

const RoomSelection = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCreated = (code) => {
      localStorage.setItem("roomCode", code);
      setError("");
      navigate(`/room/${code}`);
    };

    const handleJoined = (code) => {
      localStorage.setItem("roomCode", code);
      setError("");
      navigate(`/room/${code}`);
    };

    const handleError = (msg) => {
      setError(msg);
    };

    socket.on("room-created", handleCreated);
    socket.on("room-joined", handleJoined);
    socket.on("error", handleError);

    return () => {
      socket.off("room-created", handleCreated);
      socket.off("room-joined", handleJoined);
      socket.off("error", handleError);
    };
  }, [navigate]);

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
            <span className="px-4 bg-white text-stone-400 font-light">
              or join existing
            </span>
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
};

export default RoomSelection;
