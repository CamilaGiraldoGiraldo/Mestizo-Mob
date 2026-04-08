import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Checkout.css";

const BASE_URL = "https://mestizo-mob-3.onrender.com";

export default function Checkout() {
  const { cart, totalPrice, removeFromCart } = useCart();
  const { token, setSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [firma, setFirma] = useState(null);

  const [shipForm, setShipForm] = useState({
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
  });

  const [loginForm, setLoginForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) setMode("shipping");
  }, [token]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Credenciales inválidas");

      setSession({ token: data.token, user: data.user });

    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // PEDIDO + ENVÍO
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

  // FIRMA WOMPI
  useEffect(() => {
    if (!pedidoCreado) return;

    const reference = `pedido_${pedidoCreado.id}`;
    const amount = pedidoCreado.total * 100;

    fetch(`${BASE_URL}/api/pedidos/wompi/firma/?reference=${reference}&amount=${amount}&currency=COP`)
      .then((res) => res.json())
      .then((data) => setFirma(data.signature));
  }, [pedidoCreado]);

  // BOTÓN WOMPI
  useEffect(() => {
    if (!firma || !pedidoCreado) return;

    const reference = `pedido_${pedidoCreado.id}`;
    const amount = pedidoCreado.total * 100;

    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", "pub_test_xxxxx");
    script.setAttribute("data-currency", "COP");
    script.setAttribute("data-amount-in-cents", amount);
    script.setAttribute("data-reference", reference);
    script.setAttribute("data-signature:integrity", firma);

    const container = document.getElementById("wompi-button");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, [firma, pedidoCreado]);

  // PAGO
  if (pedidoCreado && firma) {
    return (
      <div className="ck-wrapper">
        <div className="ck-success">
          <div className="ck-success-icon">✓</div>
          <h2 className="ck-success-title">Pedido creado</h2>
          <p className="ck-success-sub">
            Finaliza tu pago para completar la compra
          </p>

          <div id="wompi-button"></div>

          <button className="ck-btn-back" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return <p>Tu carrito está vacío</p>;
  }

  return (
    <div className="ck-wrapper">
      <div className="ck-inner">
        <div className="ck-grid">

          {/* IZQUIERDA */}
          <div>

            {errors.global && (
              <div className="ck-error-global">{errors.global}</div>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <>
                <h2 className="ck-section-title">Iniciar sesión</h2>

                <form className="ck-form" onSubmit={handleLoginSubmit}>

                  <div className="ck-field">
                    <label className="ck-label">Correo</label>
                    <input
                      className="ck-input"
                      name="correo"
                      onChange={handleChange(setLoginForm)}
                    />
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Contraseña</label>
                    <input
                      className="ck-input"
                      type="password"
                      name="contrasena"
                      onChange={handleChange(setLoginForm)}
                    />
                  </div>

                  <button className="ck-btn-submit">
                    {loading ? "Cargando..." : "Iniciar sesión"}
                  </button>
                </form>
              </>
            )}

            {/* ENVÍO */}
            {mode === "shipping" && (
              <>
                <h2 className="ck-section-title">Datos de envío</h2>

                <form className="ck-form" onSubmit={handleShippingSubmit}>

                  <div className="ck-field">
                    <label className="ck-label">Dirección</label>
                    <input className="ck-input" name="direccion" onChange={handleChange(setShipForm)} />
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label">Ciudad</label>
                      <input className="ck-input" name="ciudad" onChange={handleChange(setShipForm)} />
                    </div>

                    <div className="ck-field">
                      <label className="ck-label">Departamento</label>
                      <input className="ck-input" name="estado" onChange={handleChange(setShipForm)} />
                    </div>
                  </div>

                  <div className="ck-field ck-field--half">
                    <label className="ck-label">Código postal</label>
                    <input className="ck-input" name="codigo_postal" onChange={handleChange(setShipForm)} />
                  </div>

                  <button className="ck-btn-submit">
                    {loading ? "Procesando..." : "Confirmar pedido"}
                  </button>
                </form>
              </>
            )}

          </div>

          {/* DERECHA (RESUMEN) */}
          <div className="ck-right">
            <ul className="ck-items">
              {cart.map((item) => (
                <li key={item.id} className="ck-item">
                  <img src={item.imagen} alt="" className="ck-item-img" />
                  <div className="ck-item-info">
                    <span className="ck-item-nombre">{item.nombre}</span>
                    <span className="ck-item-cant">x{item.cantidad}</span>
                  </div>
                  <span className="ck-item-precio">${item.precio}</span>
                </li>
              ))}
            </ul>

            <hr className="ck-divider" />

            <div className="ck-total-row">
              <span className="ck-total-label">Total</span>
              <span className="ck-total-val">${totalPrice}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}