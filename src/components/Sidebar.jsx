import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { AiOutlineLogout } from "react-icons/ai";
import axios from "../axios";
import { toast } from "react-toastify";
import clsx from "clsx";

const Sidebar = () => {
  const { user, logout } = useAuthContext();
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSessions = async () => {
    try {
      const res = await axios.get("/api/sessions");
      setSessions(res.data.sessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to fetch chats");
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, location.pathname]); // reload list on route change

  // const handleNewChat = async () => {
  //   try {
  //     const res = await axios.post("/api/sessions", {
  //       title: "Untitled Session",
  //     });
  //     const newSessionId = res.data.session._id;
  //     toast.success("New chat started");
  //     navigate(`/dashboard/editor/${newSessionId}`);
  //   } catch (err) {
  //     console.error("New session error:", err);
  //     toast.error("Failed to create new chat");
  //   }
  // };

  const handleNewChat = async () => {
    try {
      const res = await axios.post("/api/sessions", {
        title: "Untitled Session",
      });

      const { alreadyExists, session } = res.data;

      if (alreadyExists) {
        toast.info("You already have an empty session. Redirecting...");
      } else {
        toast.success("New session created!");
      }

      // Navigate regardless of whether it already existed or not
      navigate(`/dashboard/editor/${session._id}`);
    } catch (err) {
      console.error("New session creation error:", err);
      toast.error("Something went wrong while creating a session.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/sessions/${id}`);
      toast.success("Session deleted");
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (location.pathname === `/editor/${id}`) {
        navigate("/");
      }
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  return (
    <div className="bg-[#1e293b] h-screen p-4 flex flex-col w-64">
      <h2 className="text-xl font-semibold mb-4 text-center text-white">
        🔮 Drive
      </h2>

      <button
        onClick={handleNewChat}
        className="flex items-center justify-center gap-2 px-4 py-2 mb-6 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
      >
        <FiPlus />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {sessions.length > 0 ? (
          sessions.map((s) => (
            <div
              key={s._id}
              className={clsx(
                "flex items-center justify-between px-3 py-2 rounded mb-2 bg-[#334155] text-white",
                location.pathname === `/editor/${s._id}` && "bg-blue-700"
              )}
            >
              <Link to={`/editor/${s._id}`} className="truncate flex-1 mr-2">
                {s.title || "Untitled Session"}
              </Link>
              <button
                onClick={() => handleDelete(s._id)}
                className="text-red-400 hover:text-red-600"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center">No chats yet</p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 cursor-pointer"
      >
        <AiOutlineLogout />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
