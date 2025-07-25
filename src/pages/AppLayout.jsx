import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen grid grid-cols-[250px_1fr] bg-[#0f172a] text-white">
      {/* <Sidebar /> */}
      <Sidebar
        showSidebar={showSidebar}
        toggleSidebar={() => setShowSidebar((prev) => !prev)}
        closeSidebar={() => setShowSidebar(false)}
      />
      <main className="p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
