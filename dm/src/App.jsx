import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsernameSet from "./pages/UsernameSet";
import RoomSelection from "./pages/RoomSelection";
import Room from "./pages/Room";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsernameSet />} />
        <Route path="/lobby" element={<RoomSelection />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}
