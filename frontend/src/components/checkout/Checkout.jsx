import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./checkout.css";

const BASE_URL = "http://127.0.0.1:8000";

// Modos:
// "login"           → iniciar sesión
// "change_password" → contraseña temporal, debe cambiarla
// "register"        → crear cuenta
// "shipping"        → datos de envío

export default function Checkout() {
  const { cart, totalPrice, removeFromCart } = useCart();
  const { token, setSession } = useAuth(); // setSession({ token, user })
  const navigate = useNavigate();

  const [mode, setMode] = useState(token ? "shipping" : "login");

  // ── Formularios ───────────────────────────────────────────────
  const [shipForm, setShipForm] = useState({
    direccion: "", ciudad: "", estado: "", codigo_postal: "",
  });
  const [loginForm, setLoginForm] = useState({ correo: "", contrasena: "" });
  const [regForm, setRegForm] = useState({
    identificacion: "", nombre: "", primerApellido: "",
    segundoApellido: "", correo: "", telefono: "",
  });
  const [pwForm, setPwForm] = useState({
    nueva_contrasena: "", confirmar_contrasena: "",
  });

  // Token temporal guardado entre login y cambio de contraseña
  const [tempToken, setTempToken] = useState(null);

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────
  const formatCOP = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(precio);

  const clearErrors = () => setErrors({});

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Validaciones ──────────────────────────────────────────────
  const validateShipping = () => {
    const e = {};
    if (!shipForm.direccion.trim())     e.direccion     = "La dirección es requerida";
    if (!shipForm.ciudad.trim())        e.ciudad        = "La ciudad es requerida";
    if (!shipForm.estado.trim())        e.estado        = "El departamento es requerido";
    if (!shipForm.codigo_postal.trim()) e.codigo_postal = "El código postal es requerido";
    return e;
  };

  const validateLogin = () => {
    const e = {};
    if (!loginForm.correo.trim()) e.correo     = "El correo es requerido";
    if (!loginForm.contrasena)    e.contrasena = "La contraseña es requerida";
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!regForm.identificacion.trim())  e.identificacion  = "La identificación es requerida";
    if (!regForm.nombre.trim())          e.nombre          = "El nombre es requerido";
    if (!regForm.primerApellido.trim())  e.primerApellido  = "El primer apellido es requerido";
    if (!regForm.segundoApellido.trim()) e.segundoApellido = "El segundo apellido es requerido";
    if (!regForm.correo.trim())          e.correo          = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(regForm.correo)) e.correo = "Correo inválido";
    if (!regForm.telefono.trim())        e.telefono        = "El teléfono es requerido";
    else if (!/^\d{7,10}$/.test(regForm.telefono)) e.telefono = "Debe tener 7-10 dígitos";
    return e;
  };

  const validatePassword = () => {
    const e = {};
    if (!pwForm.nueva_contrasena)
      e.nueva_contrasena = "La contraseña es requerida";
    else if (pwForm.nueva_contrasena.length < 6)
      e.nueva_contrasena = "Mínimo 6 caracteres";
    if (pwForm.nueva_contrasena !== pwForm.confirmar_contrasena)
      e.confirmar_contrasena = "Las contraseñas no coinciden";
    return e;
  };

  // ── Submit: Login ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validateLogin();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }

    setLoading(true);
    clearErrors();
    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo:     loginForm.correo,
          contrasena: loginForm.contrasena,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Correo o contraseña incorrectos");

      if (data.debe_cambiar_contrasena) {
        // Guardamos token temporalmente sin persistir en AuthContext aún
        setTempToken(data.token);
        setMode("change_password");
      } else {
        setSession({ token: data.token, user: data.user });
        setMode("shipping");
      }
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Submit: Registro ──────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validateRegister();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }

    setLoading(true);
    clearErrors();
    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/registro/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion:  regForm.identificacion,
          nombre:          regForm.nombre,
          primerApellido:  regForm.primerApellido,
          segundoApellido: regForm.segundoApellido,
          correo:          regForm.correo,
          telefono:        regForm.telefono,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fieldErrors = {};
        Object.entries(data).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(fieldErrors);
        return;
      }

      // Registro OK → sesión activa → directo al envío
      setSession({ token: data.token, user: data.user });
      setMode("shipping");
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Submit: Cambiar contraseña temporal ───────────────────────
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validatePassword();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }

    setLoading(true);
    clearErrors();
    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/cambiar-contrasena/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${tempToken}`,
        },
        body: JSON.stringify({
          nueva_contrasena:     pwForm.nueva_contrasena,
          confirmar_contrasena: pwForm.confirmar_contrasena,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cambiar la contraseña");

      // El backend devuelve nuevo token + usuario
      setSession({ token: data.token, user: data.user });
      setTempToken(null);
      setMode("shipping");
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Submit: Pedido + Envío ────────────────────────────────────
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validateShipping();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }

    setLoading(true);
    clearErrors();

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };

    try {
      const pedidoRes = await fetch(`${BASE_URL}/api/pedidos/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          items: cart.map((item) => ({
            producto:        item.id,
            cantidad:        item.cantidad,
            precio_unitario: item.precio,
          })),
          total: totalPrice,
        }),
      });

      const pedidoData = await pedidoRes.json();
      if (!pedidoRes.ok) throw new Error(pedidoData?.error || "Error al crear el pedido");

      const envioRes = await fetch(`${BASE_URL}/api/envios/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          pedido:        pedidoData.id,
          direccion:     shipForm.direccion,
          ciudad:        shipForm.ciudad,
          estado:        shipForm.estado,
          codigo_postal: shipForm.codigo_postal,
        }),
      });

      if (!envioRes.ok) {
        const envioData = await envioRes.json();
        throw new Error(envioData?.error || "Error al registrar el envío");
      }

      cart.forEach((item) => removeFromCart(item.id));
      setSuccess(true);
    } catch (err) {
      setErrors({ global: err.message || "Ocurrió un error. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de éxito ─────────────────────────────────────────
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

  const showSteps = mode !== "shipping" || !token;

  return (
    <div className="ck-wrapper">
      <div className="ck-inner">

        <button className="ck-back" onClick={() => navigate(-1)}>← Volver</button>
        <span className="ck-eyebrow">Finalizar compra</span>

        <div className="ck-grid">

          {/* ══ Columna izquierda ══ */}
          <div className="ck-left">

            {/* ── Login ─────────────────────────────────────────── */}
            {mode === "login" && (
              <>
                <h2 className="ck-section-title">Iniciar sesión</h2>
                <p className="ck-auth-hint">
                  ¿No tienes cuenta?{" "}
                  <button type="button" className="ck-link"
                    onClick={() => { clearErrors(); setMode("register"); }}>
                    Regístrate aquí
                  </button>
                </p>

                {errors.global && <div className="ck-error-global">{errors.global}</div>}

                <form className="ck-form" onSubmit={handleLoginSubmit} noValidate>
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="login-correo">Correo electrónico</label>
                    <input id="login-correo" name="correo" type="email"
                      className={`ck-input ${errors.correo ? "ck-input--error" : ""}`}
                      placeholder="correo@ejemplo.com"
                      value={loginForm.correo}
                      onChange={handleChange(setLoginForm)}
                      autoComplete="email" />
                    {errors.correo && <span className="ck-field-error">{errors.correo}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label" htmlFor="login-contrasena">Contraseña</label>
                    <input id="login-contrasena" name="contrasena" type="password"
                      className={`ck-input ${errors.contrasena ? "ck-input--error" : ""}`}
                      placeholder="••••••••"
                      value={loginForm.contrasena}
                      onChange={handleChange(setLoginForm)}
                      autoComplete="current-password" />
                    {errors.contrasena && <span className="ck-field-error">{errors.contrasena}</span>}
                  </div>

                  <button type="submit" className="ck-btn-submit" disabled={loading}>
                    {loading ? "Verificando..." : "Iniciar sesión y continuar"}
                  </button>
                </form>
              </>
            )}

            {/* ── Registro ──────────────────────────────────────── */}
            {mode === "register" && (
              <>
                <h2 className="ck-section-title">Crear cuenta</h2>
                <p className="ck-auth-hint">
                  ¿Ya tienes cuenta?{" "}
                  <button type="button" className="ck-link"
                    onClick={() => { clearErrors(); setMode("login"); }}>
                    Inicia sesión
                  </button>
                </p>
                <p className="ck-auth-hint ck-auth-hint--info">
                  📧 Te enviaremos una contraseña temporal al correo registrado.
                </p>

                {errors.global && <div className="ck-error-global">{errors.global}</div>}

                <form className="ck-form" onSubmit={handleRegisterSubmit} noValidate>

                  <div className="ck-field">
                    <label className="ck-label" htmlFor="reg-identificacion">Número de identificación</label>
                    <input id="reg-identificacion" name="identificacion"
                      className={`ck-input ${errors.identificacion ? "ck-input--error" : ""}`}
                      placeholder="1234567890"
                      value={regForm.identificacion}
                      onChange={handleChange(setRegForm)} />
                    {errors.identificacion && <span className="ck-field-error">{errors.identificacion}</span>}
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="reg-nombre">Nombre</label>
                      <input id="reg-nombre" name="nombre"
                        className={`ck-input ${errors.nombre ? "ck-input--error" : ""}`}
                        placeholder="Juan"
                        value={regForm.nombre}
                        onChange={handleChange(setRegForm)} />
                      {errors.nombre && <span className="ck-field-error">{errors.nombre}</span>}
                    </div>

                    <div className="ck-field">
                      <label className="ck-label" htmlFor="reg-primerApellido">Primer apellido</label>
                      <input id="reg-primerApellido" name="primerApellido"
                        className={`ck-input ${errors.primerApellido ? "ck-input--error" : ""}`}
                        placeholder="Pérez"
                        value={regForm.primerApellido}
                        onChange={handleChange(setRegForm)} />
                      {errors.primerApellido && <span className="ck-field-error">{errors.primerApellido}</span>}
                    </div>
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="reg-segundoApellido">Segundo apellido</label>
                      <input id="reg-segundoApellido" name="segundoApellido"
                        className={`ck-input ${errors.segundoApellido ? "ck-input--error" : ""}`}
                        placeholder="García"
                        value={regForm.segundoApellido}
                        onChange={handleChange(setRegForm)} />
                      {errors.segundoApellido && <span className="ck-field-error">{errors.segundoApellido}</span>}
                    </div>

                    <div className="ck-field">
                      <label className="ck-label" htmlFor="reg-telefono">Teléfono</label>
                      <input id="reg-telefono" name="telefono" type="tel"
                        className={`ck-input ${errors.telefono ? "ck-input--error" : ""}`}
                        placeholder="3001234567"
                        value={regForm.telefono}
                        onChange={handleChange(setRegForm)}
                        autoComplete="tel" />
                      {errors.telefono && <span className="ck-field-error">{errors.telefono}</span>}
                    </div>
                  </div>

                  <div className="ck-field">
                    <label className="ck-label" htmlFor="reg-correo">Correo electrónico</label>
                    <input id="reg-correo" name="correo" type="email"
                      className={`ck-input ${errors.correo ? "ck-input--error" : ""}`}
                      placeholder="correo@ejemplo.com"
                      value={regForm.correo}
                      onChange={handleChange(setRegForm)}
                      autoComplete="email" />
                    {errors.correo && <span className="ck-field-error">{errors.correo}</span>}
                  </div>

                  <button type="submit" className="ck-btn-submit" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
                  </button>
                </form>
              </>
            )}

            {/* ── Cambiar contraseña temporal ───────────────────── */}
            {mode === "change_password" && (
              <>
                <h2 className="ck-section-title">Crea tu contraseña</h2>
                <p className="ck-auth-hint ck-auth-hint--info">
                  Estás usando una contraseña temporal. Elige una nueva para continuar.
                </p>

                {errors.global && <div className="ck-error-global">{errors.global}</div>}

                <form className="ck-form" onSubmit={handleChangePasswordSubmit} noValidate>
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="pw-nueva">Nueva contraseña</label>
                    <input id="pw-nueva" name="nueva_contrasena" type="password"
                      className={`ck-input ${errors.nueva_contrasena ? "ck-input--error" : ""}`}
                      placeholder="••••••••"
                      value={pwForm.nueva_contrasena}
                      onChange={handleChange(setPwForm)}
                      autoComplete="new-password" />
                    {errors.nueva_contrasena && <span className="ck-field-error">{errors.nueva_contrasena}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label" htmlFor="pw-confirmar">Confirmar contraseña</label>
                    <input id="pw-confirmar" name="confirmar_contrasena" type="password"
                      className={`ck-input ${errors.confirmar_contrasena ? "ck-input--error" : ""}`}
                      placeholder="••••••••"
                      value={pwForm.confirmar_contrasena}
                      onChange={handleChange(setPwForm)}
                      autoComplete="new-password" />
                    {errors.confirmar_contrasena && <span className="ck-field-error">{errors.confirmar_contrasena}</span>}
                  </div>

                  <button type="submit" className="ck-btn-submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar y continuar"}
                  </button>
                </form>
              </>
            )}

            {/* ── Envío ─────────────────────────────────────────── */}
            {mode === "shipping" && (
              <>
                <h2 className="ck-section-title">Datos de envío</h2>

                {errors.global && <div className="ck-error-global">{errors.global}</div>}

                <form className="ck-form" onSubmit={handleShippingSubmit} noValidate>
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="direccion">Dirección</label>
                    <input id="direccion" name="direccion"
                      className={`ck-input ${errors.direccion ? "ck-input--error" : ""}`}
                      placeholder="Calle 45 # 12-34, Apto 201"
                      value={shipForm.direccion}
                      onChange={handleChange(setShipForm)} />
                    {errors.direccion && <span className="ck-field-error">{errors.direccion}</span>}
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="ciudad">Ciudad</label>
                      <input id="ciudad" name="ciudad"
                        className={`ck-input ${errors.ciudad ? "ck-input--error" : ""}`}
                        placeholder="Barranquilla"
                        value={shipForm.ciudad}
                        onChange={handleChange(setShipForm)} />
                      {errors.ciudad && <span className="ck-field-error">{errors.ciudad}</span>}
                    </div>

                    <div className="ck-field">
                      <label className="ck-label" htmlFor="estado">Departamento</label>
                      <input id="estado" name="estado"
                        className={`ck-input ${errors.estado ? "ck-input--error" : ""}`}
                        placeholder="Atlántico"
                        value={shipForm.estado}
                        onChange={handleChange(setShipForm)} />
                      {errors.estado && <span className="ck-field-error">{errors.estado}</span>}
                    </div>
                  </div>

                  <div className="ck-field ck-field--half">
                    <label className="ck-label" htmlFor="codigo_postal">Código postal</label>
                    <input id="codigo_postal" name="codigo_postal"
                      className={`ck-input ${errors.codigo_postal ? "ck-input--error" : ""}`}
                      placeholder="080001"
                      value={shipForm.codigo_postal}
                      onChange={handleChange(setShipForm)} />
                    {errors.codigo_postal && <span className="ck-field-error">{errors.codigo_postal}</span>}
                  </div>

                  <button type="submit" className="ck-btn-submit" disabled={loading}>
                    {loading ? "Procesando..." : "Confirmar pedido"}
                  </button>
                </form>
              </>
            )}

          </div>

          {/* ══ Columna derecha — Resumen ══ */}
          <div className="ck-right">
            <h2 className="ck-section-title">Resumen</h2>

            <ul className="ck-items">
              {cart.map((item) => (
                <li key={item.id} className="ck-item">
                  {item.imagen && (
                    <img src={item.imagen} alt={item.nombre} className="ck-item-img" />
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

            {/* Indicador de pasos */}
            {showSteps && (
              <div className="ck-steps">
                <div className={`ck-step ${
                  mode === "login" || mode === "register"
                    ? "ck-step--active"
                    : "ck-step--done"
                }`}>
                  <span className="ck-step-num">
                    {mode === "login" || mode === "register" ? "1" : "✓"}
                  </span>
                  <span className="ck-step-label">Cuenta</span>
                </div>

                <div className="ck-step-line" />

                <div className={`ck-step ${
                  mode === "change_password"
                    ? "ck-step--active"
                    : mode === "shipping"
                    ? "ck-step--done"
                    : ""
                }`}>
                  <span className="ck-step-num">
                    {mode === "shipping" ? "✓" : "2"}
                  </span>
                  <span className="ck-step-label">Contraseña</span>
                </div>

                <div className="ck-step-line" />

                <div className={`ck-step ${mode === "shipping" ? "ck-step--active" : ""}`}>
                  <span className="ck-step-num">3</span>
                  <span className="ck-step-label">Envío</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}