import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Header from "./components/header/Header";
import Landing from "./components/landing/landing";
import ProductoList from "./components/productoList/ProductoList";
import DetalleProducto from "./components/Detalleproduct/DetalleProducto";
import Intro from "./components/Intro/Intro";
import CartToast from "./components/ui/CartToast";
import AgendarCita from "./components/citas/AgendarCita";

import { CartProvider, useCart } from "./context/CartContext";

import "./App.css";

function AppContent() {
  const { toast } = useCart();
  const location = useLocation();

  const hideHeader = location.pathname === "/";

  return (
    <>
      <CartToast
        visible={toast.visible}
        productName={toast.productName}
      />

      {!hideHeader && <Header />}

      <Routes>
        {/* Intro sin contenedor */}
        <Route path="/" element={<Intro />} />

        {/* Landing */}
        <Route path="/landing" element={<Landing />} />

        {/* Productos */}
        <Route
          path="/productos"
          element={
            <main className="main-content">
              <ProductoList />
            </main>
          }
        />

        {/* Detalle producto */}
        <Route
          path="/producto/:id"
          element={
            <main className="main-content">
              <DetalleProducto />
            </main>
          }
        />

        {/* Agendar cita */}
        <Route
          path="/cita"
          element={
            <main className="main-content">
              <AgendarCita />
            </main>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;