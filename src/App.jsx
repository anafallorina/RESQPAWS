
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReportAnimal from "./pages/ReportAnimal.jsx";
import RescueCases from "./pages/RescueCases.jsx";
import Adoption from "./pages/Adoption.jsx";
import Volunteer from "./pages/Volunteer.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-animal" element={<ReportAnimal />} />
        <Route path="/rescue-cases" element={<RescueCases />} />
        <Route path="/adoption" element={<Adoption />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
