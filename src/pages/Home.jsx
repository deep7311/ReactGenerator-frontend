import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import { useAuthContext } from "../context/AuthContext";

const Home = () => {

  const { user, logout } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#1e293b] shadow-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="App Logo" className="h-20 w-20 object-contain" />
          <h1 className="text-2xl font-bold tracking-wide">AI JSX Generator</h1>
        </div>
          {
            user ? (
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200"
              >
                Login
              </Link>
            )
          }
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Generate Your <span className="text-green-400">React Components</span> <br />
            with Tailwind CSS using <span className="text-purple-400">AI</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">
            Empower your UI development by generating professional Tailwind components with a single prompt.
          </p>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200"
          >
            Get Started
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
