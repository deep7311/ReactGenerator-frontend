import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiArchive } from "react-icons/fi";
import axios from "../axios";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const fetchSessionCount = async () => {
      try {
        const res = await axios.get("/api/sessions");
        setSessionCount(res.data.sessions.length);
      } catch (error) {
        console.error("Failed to fetch sessions", error.message);
      }
    };

    fetchSessionCount();
  }, []);

  // const handleNewChat = async () => {
  //   try {
  //     const res = await axios.post("/api/sessions", {
  //       title: "Untitled Session",
  //     });
  //     navigate(`/dashboard/editor/${res.data.session._id}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleNewChat = async () => {
    try {
      const res = await axios.post("/api/sessions", {
        title: "Untitled Session",
      });

      if (res.data.alreadyExists) {
        toast.info("You already have an empty session. Redirecting...");
      } else {
        toast.success("New session created!");
      }

      navigate(`/dashboard/editor/${res.data.session._id}`);
    } catch (err) {
      toast.error("Something went wrong while creating session");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">
        Welcome, {user?.name || "Guest"} 👋
      </h1>
      <p className="text-gray-400 mb-10 text-lg">
        Manage your AI sessions and start generating powerful React components
        instantly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Session Count Card */}
        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/20 transition duration-300">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">
            Total Sessions
          </h2>
          <p className="text-5xl font-bold text-cyan-400">{sessionCount}</p>
        </div>

        {/* Start New Chat Button */}
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-medium py-5 px-6 rounded-2xl shadow-lg transition duration-200 transform hover:scale-105"
        >
          <FiPlus size={22} />
          Start New Chat
        </button>

        {/* View All Sessions Button */}
        <button
          onClick={() => navigate("/dashboard/sessions")}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-medium py-5 px-6 rounded-2xl shadow-lg transition duration-200 transform hover:scale-105"
        >
          <FiArchive size={22} />
          View All Sessions
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
