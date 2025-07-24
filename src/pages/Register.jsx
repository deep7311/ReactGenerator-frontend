import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "../axios";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/register", formData);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-700 bg-white/5 backdrop-blur-sm">
        <h2 className="text-4xl font-bold text-center mb-6 text-green-400">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 cursor-pointer text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:underline transition"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
