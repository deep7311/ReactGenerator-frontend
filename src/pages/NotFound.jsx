// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
        Go back Home
      </Link>
    </div>
  );
};

export default NotFound;
