import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RealizadoPage from "./pages/RealizadoPage.jsx";
import MetasPage from "./pages/MetasPage.jsx";
import CadastrosPage from "./pages/CadastrosPage.jsx";
import UsuariosPage from "./pages/UsuariosPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="realizado" element={<RealizadoPage />} />
          <Route path="metas" element={<MetasPage />} />
          <Route path="cadastros" element={<CadastrosPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
