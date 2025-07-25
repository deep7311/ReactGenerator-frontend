import { createContext, useContext, useState, useEffect } from "react";
import axios from "../axios";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // session me kuch change hue hai ya nhi globally detect karne ke liye
  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get("/api/sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      console.log("Failed to fetch sessions:", err);
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
      console.log("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  // phli baar page open hoga to check if user is logged in
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (formData) => {
    await axios.post("/api/users/login", formData);
    // After login, fetch user to update context state properly
    await fetchUser();
  };

  // Logout function
  const logout = async () => {
    await axios.post("/api/users/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, sessions, setSessions, fetchSessions }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
