import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Checkout.css";

const BASE_URL = "http://127.0.0.1:8000";

export default function Checkout() {
  const { cart, totalPrice, removeFromCart } = useCart();
  const { token, setSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [firma, setFirma] = useState(null);

  const [shipForm, setShipForm] = useState({
    direccion: "", ciudad: "", estado: "", codigo_postal: "",
  });

  const [loginForm, setLoginForm] = useState({
    correo: "", contrasena: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔥 SOLUCIÓN TOKEN (evita 401)
  useEffect(() => {
    if (token) setMode("shipping");
  }, [token]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // 🧾 LOGIN CORRECTO
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: loginForm.correo,
          contrasena: loginForm.contrasena,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Correo o contraseña incorrectos");
      }

      setSession({ token: data.token, user: data.user });

    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 🧾 PEDIDO + ENVÍO
  const handleShippingSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrors({ global: "Debes iniciar sesión" });
      return;
    }

    setLoading(true);

    try {
      const pedidoRes = await fetch(`${BASE_URL}/api/pedidos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            producto: item.id,
            cantidad: item.cantidad,
          })),
          total: totalPrice,
        }),
      });

      const pedidoData = await pedidoRes.json();
      if (!pedidoRes.ok) throw new Error("Error creando pedido");

      await fetch(`${BASE_URL}/api/envios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          pedido: pedidoData.id,
          ...shipForm,
        }),
      });

      setPedidoCreado(pedidoData);

      cart.forEach((item) => removeFromCart(item.id));

    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 🔐 FIRMA WOMPI
  useEffect(() => {
    if (!pedidoCreado) return;

    const reference = `pedido_${pedidoCreado.id}`;
    const amount = pedidoCreado.total * 100;

    fetch(`${BASE_URL}/api/pedidos/wompi/firma/?reference=${reference}&amount=${amount}&currency=COP`)
      .then(res => res.json())
      .then(data => setFirma(data.signature));

  }, [pedidoCreado]);

  // 💳 BOTÓN WOMPI
  useEffect(() => {
    if (!firma || !pedidoCreado) return;

    const reference = `pedido_${pedidoCreado.id}`;
    const amount = pedidoCreado.total * 100;

    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", "pub_test_xxxxx"); // 🔥 tu key
    script.setAttribute("data-currency", "COP");
    script.setAttribute("data-amount-in-cents", amount);
    script.setAttribute("data-reference", reference);
    script.setAttribute("data-signature:integrity", firma);

    const container = document.getElementById("wompi-button");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

  }, [firma]);

  // 💳 PANTALLA DE PAGO
  if (pedidoCreado && firma) {
    return (
      <div className="ck-wrapper">
        <h2>Finaliza tu pago</h2>
        <p>Tu pedido fue creado correctamente</p>

        <div id="wompi-button"></div>

        <button onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    );
  }

  // 🛒 CARRITO VACÍO
  if (cart.length === 0) {
    return <p>Tu carrito está vacío</p>;
  }

  return (
    <div className="ck-wrapper">
      <h2>Checkout</h2>

      {errors.global && <p>{errors.global}</p>}

      {/* LOGIN */}
      {mode === "login" && (
        <form onSubmit={handleLoginSubmit}>
          <input
            name="correo"
            placeholder="Correo"
            onChange={handleChange(setLoginForm)}
          />
          <input
            name="contrasena"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange(setLoginForm)}
          />
          <button type="submit">
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
      )}

      {/* ENVÍO */}
      {mode === "shipping" && (
        <form onSubmit={handleShippingSubmit}>
          <input name="direccion" placeholder="Dirección" onChange={handleChange(setShipForm)} />
          <input name="ciudad" placeholder="Ciudad" onChange={handleChange(setShipForm)} />
          <input name="estado" placeholder="Departamento" onChange={handleChange(setShipForm)} />
          <input name="codigo_postal" placeholder="Código postal" onChange={handleChange(setShipForm)} />

          <button type="submit">
            {loading ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>
      )}

      <h3>Total: {totalPrice}</h3>
    </div>
  );
}