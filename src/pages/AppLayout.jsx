import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-[250px_1fr] bg-[#0f172a] text-white">
      <Sidebar />
      <main className="p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
