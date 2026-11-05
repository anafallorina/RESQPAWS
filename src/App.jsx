
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReportAnimal from "./pages/ReportAnimal.jsx";
import RescueCases from "./pages/RescueCases.jsx";
import Adoption from "./pages/Adoption.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import RescuerDashboard from "./pages/RescuerDashboard.jsx";

import AdminRoute from "./components/AdminRoute.jsx";
import RescuerRoute from "./components/RescuerRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/rescue-cases" element={<RescueCases />} />
        <Route path="/adoption" element={<Adoption />} />

        {/* USER PAGES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-animal" element={<ReportAnimal />} />

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* PROTECTED RESCUER DASHBOARD */}
        <Route
          path="/rescuer"
          element={
            <RescuerRoute>
              <RescuerDashboard />
            </RescuerRoute>
          }
        />

        {/* INVALID ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
