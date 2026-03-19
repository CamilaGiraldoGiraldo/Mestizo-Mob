import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./checkout.css";

const BASE_URL = "http://127.0.0.1:8000";

export default function Checkout() {
  const { cart, totalPrice, removeFromCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCOP = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  const validate = () => {
    const newErrors = {};
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es requerida";
    if (!form.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida";
    if (!form.estado.trim()) newErrors.estado = "El departamento es requerido";
    if (!form.codigo_postal.trim()) newErrors.codigo_postal = "El código postal es requerido";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Token ${token}`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrors({ global: "Debes iniciar sesión para realizar un pedido." });
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Crear pedido
      const pedidoRes = await fetch(`${BASE_URL}/api/pedidos/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          items: cart.map((item) => ({
            producto: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
          })),
          total: totalPrice,
        }),
      });

      if (!pedidoRes.ok) throw new Error("Error al crear el pedido");
      const pedido = await pedidoRes.json();

      // 2. Crear envío ligado al pedido
      const envioRes = await fetch(`${BASE_URL}/api/envios/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          pedido: pedido.id,
          direccion: form.direccion,
          ciudad: form.ciudad,
          estado: form.estado,
          codigo_postal: form.codigo_postal,
        }),
      });

      if (!envioRes.ok) throw new Error("Error al registrar el envío");

      // Vaciar carrito
      cart.forEach((item) => removeFromCart(item.id));
      setSuccess(true);
    } catch (err) {
      setErrors({ global: err.message || "Ocurrió un error. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de éxito ──────────────────────────────────────
  if (success) {
    return (
      <div className="ck-wrapper">
        <div className="ck-success">
          <div className="ck-success-icon">✓</div>
          <h2 className="ck-success-title">¡Pedido confirmado!</h2>
          <p className="ck-success-sub">
            Recibimos tu orden. Pronto nos pondremos en contacto contigo.
          </p>
          <button className="ck-btn-back" onClick={() => navigate("/")}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // ── Checkout vacío ─────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="ck-wrapper">
        <div className="ck-success">
          <p className="ck-success-sub">Tu carrito está vacío.</p>
          <button className="ck-btn-back" onClick={() => navigate("/")}>
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-wrapper">
      <div className="ck-inner">

        {/* ── Encabezado ── */}
        <button className="ck-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <span className="ck-eyebrow">Finalizar compra</span>

        <div className="ck-grid">

          {/* ══ Columna izquierda — Formulario ══ */}
          <div className="ck-left">
            <h2 className="ck-section-title">Datos de envío</h2>

            {errors.global && (
              <div className="ck-error-global">{errors.global}</div>
            )}

            <form className="ck-form" onSubmit={handleSubmit} noValidate>

              <div className="ck-field">
                <label className="ck-label" htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  className={`ck-input ${errors.direccion ? "ck-input--error" : ""}`}
                  placeholder="Calle 45 # 12-34, Apto 201"
                  value={form.direccion}
                  onChange={handleChange}
                />
                {errors.direccion && (
                  <span className="ck-field-error">{errors.direccion}</span>
                )}
              </div>

              <div className="ck-row">
                <div className="ck-field">
                  <label className="ck-label" htmlFor="ciudad">Ciudad</label>
                  <input
                    id="ciudad"
                    name="ciudad"
                    className={`ck-input ${errors.ciudad ? "ck-input--error" : ""}`}
                    placeholder="Barranquilla"
                    value={form.ciudad}
                    onChange={handleChange}
                  />
                  {errors.ciudad && (
                    <span className="ck-field-error">{errors.ciudad}</span>
                  )}
                </div>

                <div className="ck-field">
                  <label className="ck-label" htmlFor="estado">Departamento</label>
                  <input
                    id="estado"
                    name="estado"
                    className={`ck-input ${errors.estado ? "ck-input--error" : ""}`}
                    placeholder="Atlántico"
                    value={form.estado}
                    onChange={handleChange}
                  />
                  {errors.estado && (
                    <span className="ck-field-error">{errors.estado}</span>
                  )}
                </div>
              </div>

              <div className="ck-field ck-field--half">
                <label className="ck-label" htmlFor="codigo_postal">Código postal</label>
                <input
                  id="codigo_postal"
                  name="codigo_postal"
                  className={`ck-input ${errors.codigo_postal ? "ck-input--error" : ""}`}
                  placeholder="080001"
                  value={form.codigo_postal}
                  onChange={handleChange}
                />
                {errors.codigo_postal && (
                  <span className="ck-field-error">{errors.codigo_postal}</span>
                )}
              </div>

              <button
                type="submit"
                className="ck-btn-submit"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar pedido"}
              </button>

            </form>
          </div>

          {/* ══ Columna derecha — Resumen ══ */}
          <div className="ck-right">
            <h2 className="ck-section-title">Resumen</h2>

            <ul className="ck-items">
              {cart.map((item) => (
                <li key={item.id} className="ck-item">
                  {item.imagen && (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="ck-item-img"
                    />
                  )}
                  <div className="ck-item-info">
                    <span className="ck-item-nombre">{item.nombre}</span>
                    <span className="ck-item-cant">× {item.cantidad}</span>
                  </div>
                  <span className="ck-item-precio">
                    {formatCOP(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="ck-divider" />

            <div className="ck-total-row">
              <span className="ck-total-label">Total</span>
              <span className="ck-total-val">{formatCOP(totalPrice)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}