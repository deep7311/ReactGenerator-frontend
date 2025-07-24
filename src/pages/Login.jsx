// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl text-white animate-fade-in">
        <h2 className="text-4xl font-bold text-center mb-6">Welcome Back 👋</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 placeholder-gray-400 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-800 placeholder-gray-400 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 cursor-pointer text-gray-400 hover:text-white transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-lg font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-500 font-medium underline transition"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
