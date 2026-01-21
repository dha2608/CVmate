import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Builder from "@/pages/Builder";
import Interview from "@/pages/Interview";
import Community from "@/pages/Community";
import Blog from "@/pages/Blog";
import Jobs from "@/pages/Jobs";
import Messaging from "@/pages/Messaging";
import Notifications from "@/pages/Notifications";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/community" element={<Community />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
