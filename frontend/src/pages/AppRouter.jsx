import { Routes, Route } from "react-router-dom";
import Chat from "../views/Chat";
import Home from "../views/Home";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
