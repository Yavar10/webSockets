import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const UsernameSet = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-sm shadow-lg border border-stone-200 p-12 max-w-md w-full">
        <div className="border-l-2 border-stone-800 pl-4 mb-8">
          <h1 className="text-3xl font-serif text-stone-900 mb-1">
            2 of us
          </h1>
          <p className="text-sm text-stone-500 font-light">
            Enter your name to begin
          </p>
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 border border-stone-300 rounded-sm mb-4 focus:outline-none focus:border-stone-800 transition-colors font-light text-stone-800"
        />

        <button
          onClick={() => {
            if (!input.trim()) return;
            setAuth(input);
            navigate("/lobby");
          }}
          className="w-full bg-stone-800 text-white py-3 rounded-sm font-light hover:bg-stone-900 transition-colors"
        >
          Continue
        </button>
        <button 
        onClick={()=>{localStorage.removeItem("roomCode")}}
        className="w-full bg-stone-800 text-white py-3 rounded-sm font-light hover:bg-stone-900 transition-colors" >
          Reset the room</button>
      </div>
    </div>
  );
};

export default UsernameSet;
