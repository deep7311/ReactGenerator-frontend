import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import EditorPage from "./pages/EditorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AllSessions from "./pages/AllSessions";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="editor/:id" element={<EditorPage />} />
          <Route path="sessions" element={<AllSessions />} />
        </Route>

        {/* Catch all 404 error */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        closeOnClick
        pauseOnHover
        draggable
        toastClassName={() =>
          "bg-gray-900 text-white rounded-lg px-4 py-3 shadow-lg max-w-xs text-sm"
        }
        bodyClassName={() => "text-white"}
        progressClassName="bg-green-500"
      />
    </BrowserRouter>
  );
};

export default App;

// old code

// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import AppLayout from "./pages/AppLayout";
// import Dashboard from "./pages/Dashboard";
// import EditorPage from "./pages/EditorPage";
// import ProtectedRoute from "./components/ProtectedRoute";
// import NotFound from "./pages/NotFound";
// import AllSessions from "./pages/AllSessions";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* Protected Routes */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <AppLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Dashboard />} />
//           <Route path="editor/:id" element={<EditorPage />} />
//           <Route path="sessions" element={<AllSessions />} />
//         </Route>

//         {/* Catch all 404 error */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>

//       <ToastContainer position="top-center" autoClose={3000} />
//     </BrowserRouter>
//   );
// };

// export default App;
