import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Header from "./components/header/Header";
import Landing from "./components/landing/landing";
import ProductoList from "./components/productoList/ProductoList";
import DetalleProducto from "./components/Detalleproduct/DetalleProducto";
import Intro from "./components/Intro/Intro";
import CartToast from "./components/ui/CartToast";
import AgendarCita from "./components/citas/AgendarCita";
import PanelAdmin from "./components/paneladmin/PanelAdmin";

import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";

// ── Ruta protegida: solo entra si es staff o superuser ───────
function RutaAdmin({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!user.is_staff && !user.is_superuser) return <Navigate to="/landing" replace />;

  return children;
}

function AppContent() {
  const { toast } = useCart();
  const location = useLocation();

  const hideHeader = location.pathname === "/" || location.pathname === "/admin";

  return (
    <>
      <CartToast visible={toast.visible} productName={toast.productName} />

      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/landing" element={<Landing />} />

        <Route
          path="/productos"
          element={
            <main className="main-content">
              <ProductoList />
            </main>
          }
        />
        <Route
          path="/producto/:id"
          element={
            <main className="main-content">
              <DetalleProducto />
            </main>
          }
        />
        <Route
          path="/cita"
          element={
            <main className="main-content">
              <AgendarCita />
            </main>
          }
        />

        {/* Panel admin — solo staff/superuser */}
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <PanelAdmin />
            </RutaAdmin>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;