import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";

const AllSessions = () => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await axios.get("/api/sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Failed to load sessions", err.message);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="p-6 sm:p-10 min-h-screen text-white bg-gradient-to-b from-gray-900 to-gray-800">
      <h2 className="text-3xl font-bold mb-6">Your Sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer"
              onClick={() => navigate(`/editor/${session._id}`)}
            >
              <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
              <p className="text-sm text-gray-400">
                Updated: {new Date(session.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSessions;
