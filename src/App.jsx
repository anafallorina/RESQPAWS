
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReportAnimal from "./pages/ReportAnimal.jsx";
import RescueCases from "./pages/RescueCases.jsx";
import Adoption from "./pages/Adoption.jsx";
import Volunteer from "./pages/Volunteer.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
