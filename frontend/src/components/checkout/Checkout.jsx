import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./checkout.css";

const BASE_URL = "http://192.168.1.8:8000";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { token, setSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(token ? "shipping" : "login");

  // WOMPI
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [firma, setFirma] = useState(null);

  // Formularios
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

  const [regForm, setRegForm] = useState({
    identificacion: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    telefono: "",
  });

  const [pwForm, setPwForm] = useState({
    nueva_contrasena: "",
    confirmar_contrasena: "",
  });

  const [tempToken, setTempToken] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) setMode("shipping");
  }, [token]);

  // Helpers
  const formatCOP = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  const clearErrors = () => setErrors({});

  // FIX 2: handler genérico que mantiene controlled components
  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  // VALIDACIONES
  const validateShipping = () => {
    const e = {};
    if (!shipForm.direccion.trim()) e.direccion = "La dirección es requerida";
    if (!shipForm.ciudad.trim()) e.ciudad = "La ciudad es requerida";
    if (!shipForm.estado.trim()) e.estado = "El departamento es requerido";
    if (!shipForm.codigo_postal.trim()) e.codigo_postal = "El código postal es requerido";
    return e;
  };

  const validateLogin = () => {
    const e = {};
    if (!loginForm.correo.trim()) e.correo = "El correo es requerido";
    if (!loginForm.contrasena) e.contrasena = "La contraseña es requerida";
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!regForm.identificacion.trim()) e.identificacion = "La identificación es requerida";
    if (!regForm.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!regForm.primerApellido.trim()) e.primerApellido = "El primer apellido es requerido";
    if (!regForm.segundoApellido.trim()) e.segundoApellido = "El segundo apellido es requerido";
    if (!regForm.correo.trim()) {
      e.correo = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(regForm.correo)) {
      e.correo = "Correo inválido";
    }
    if (!regForm.telefono.trim()) {
      e.telefono = "El teléfono es requerido";
    } else if (!/^\d{7,10}$/.test(regForm.telefono)) {
      e.telefono = "Debe tener 7-10 dígitos";
    }
    return e;
  };

  const validatePassword = () => {
    const e = {};
    if (!pwForm.nueva_contrasena) {
      e.nueva_contrasena = "La contraseña es requerida";
    } else if (pwForm.nueva_contrasena.length < 6) {
      e.nueva_contrasena = "Mínimo 6 caracteres";
    }
    if (pwForm.nueva_contrasena !== pwForm.confirmar_contrasena) {
      e.confirmar_contrasena = "Las contraseñas no coinciden";
    }
    return e;
  };

  // LOGIN
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
        body: JSON.stringify({ correo: loginForm.correo, contrasena: loginForm.contrasena }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Correo o contraseña incorrectos");
      if (data.debe_cambiar_contrasena) {
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

  // REGISTRO
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
          identificacion: regForm.identificacion,
          nombre: regForm.nombre,
          primerApellido: regForm.primerApellido,
          segundoApellido: regForm.segundoApellido,
          correo: regForm.correo,
          telefono: regForm.telefono,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al registrarse");
      setSession({ token: data.token, user: data.user });
      setMode("shipping");
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // CAMBIAR CONTRASEÑA
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validatePassword();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }
    setLoading(true);
    clearErrors();
    try {
      const res = await fetch(`${BASE_URL}/usuario/auth/cambiar-contrasena/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${tempToken}` },
        body: JSON.stringify({
          nueva_contrasena: pwForm.nueva_contrasena,
          confirmar_contrasena: pwForm.confirmar_contrasena,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cambiar la contraseña");
      setSession({ token: data.token, user: data.user });
      setTempToken(null);
      setMode("shipping");
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  // PEDIDO + ENVÍO
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validateShipping();
    if (Object.keys(valErrors).length > 0) { setErrors(valErrors); return; }
    setLoading(true);
    clearErrors();
    try {
      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      };

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

      const pedidoData = await pedidoRes.json();
      if (!pedidoRes.ok) throw new Error(pedidoData?.error || "Error al crear el pedido");

      const envioRes = await fetch(`${BASE_URL}/api/envios/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          pedido: pedidoData.id,
          direccion: shipForm.direccion,
          ciudad: shipForm.ciudad,
          estado: shipForm.estado,
          codigo_postal: shipForm.codigo_postal,
        }),
      });

      if (!envioRes.ok) {
        const envioData = await envioRes.json();
        throw new Error(envioData?.error || "Error al registrar el envío");
      }

      setPedidoCreado(pedidoData);

      // FIX 4: vaciar carrito al crear el pedido exitosamente
      if (typeof clearCart === "function") clearCart();

    } catch (err) {
      setErrors({ global: err.message || "Ocurrió un error. Intenta de nuevo." });
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
    script.setAttribute("data-public-key", "pub_test_oXXEBOomillions");
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

  // PAGO WOMPI
  if (pedidoCreado && firma) {
    return (
      <div className="ck-wrapper">
        <div className="ck-success">
          <div className="ck-success-icon">✓</div>
          <h2 className="ck-success-title">Pedido creado</h2>
          <p className="ck-success-sub">Finaliza tu pago para completar la compra</p>
          <div id="wompi-button"></div>
          <button className="ck-btn-back" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // FIX 3: pantalla de éxito alcanzable (success se activa desde otro flujo si aplica)
  if (success) {
    return (
      <div className="ck-wrapper">
        <div className="ck-success">
          <div className="ck-success-icon">✓</div>
          <h2 className="ck-success-title">¡Pedido confirmado!</h2>
          <p className="ck-success-sub">Recibimos tu orden.</p>
          <button className="ck-btn-back" onClick={() => navigate("/")}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // CARRITO VACÍO
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
        <div className="ck-grid">

          {/* IZQUIERDA */}
          <div>

            {errors.global && (
              <div className="ck-error-global">{errors.global}</div>
            )}

            {/* FIX 5: botones para alternar entre login y registro */}
            {(mode === "login" || mode === "register") && (
              <div className="ck-auth-tabs">
                <button
                  type="button"
                  className={`ck-tab ${mode === "login" ? "ck-tab--active" : ""}`}
                  onClick={() => { setMode("login"); clearErrors(); }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className={`ck-tab ${mode === "register" ? "ck-tab--active" : ""}`}
                  onClick={() => { setMode("register"); clearErrors(); }}
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <>
                <h2 className="ck-section-title">Iniciar sesión</h2>
                <form className="ck-form" onSubmit={handleLoginSubmit}>

                  <div className="ck-field">
                    <label className="ck-label">Correo</label>
                    {/* FIX 2: value controlado */}
                    <input
                      className={`ck-input ${errors.correo ? "ck-input--error" : ""}`}
                      name="correo"
                      value={loginForm.correo}
                      onChange={handleChange(setLoginForm)}
                    />
                    {/* FIX 1: mostrar error */}
                    {errors.correo && <span className="ck-field-error">{errors.correo}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Contraseña</label>
                    <input
                      className={`ck-input ${errors.contrasena ? "ck-input--error" : ""}`}
                      type="password"
                      name="contrasena"
                      value={loginForm.contrasena}
                      onChange={handleChange(setLoginForm)}
                    />
                    {errors.contrasena && <span className="ck-field-error">{errors.contrasena}</span>}
                  </div>

                  <button className="ck-btn-submit" disabled={loading}>
                    {loading ? "Cargando..." : "Iniciar sesión"}
                  </button>
                </form>
              </>
            )}

            {/* REGISTRO — FIX 5: ahora es alcanzable */}
            {mode === "register" && (
              <>
                <h2 className="ck-section-title">Crear cuenta</h2>
                <form className="ck-form" onSubmit={handleRegisterSubmit}>

                  <div className="ck-field">
                    <label className="ck-label">Identificación</label>
                    <input
                      className={`ck-input ${errors.identificacion ? "ck-input--error" : ""}`}
                      name="identificacion"
                      value={regForm.identificacion}
                      onChange={handleChange(setRegForm)}
                    />
                    {errors.identificacion && <span className="ck-field-error">{errors.identificacion}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Nombre</label>
                    <input
                      className={`ck-input ${errors.nombre ? "ck-input--error" : ""}`}
                      name="nombre"
                      value={regForm.nombre}
                      onChange={handleChange(setRegForm)}
                    />
                    {errors.nombre && <span className="ck-field-error">{errors.nombre}</span>}
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label">Primer apellido</label>
                      <input
                        className={`ck-input ${errors.primerApellido ? "ck-input--error" : ""}`}
                        name="primerApellido"
                        value={regForm.primerApellido}
                        onChange={handleChange(setRegForm)}
                      />
                      {errors.primerApellido && <span className="ck-field-error">{errors.primerApellido}</span>}
                    </div>

                    <div className="ck-field">
                      <label className="ck-label">Segundo apellido</label>
                      <input
                        className={`ck-input ${errors.segundoApellido ? "ck-input--error" : ""}`}
                        name="segundoApellido"
                        value={regForm.segundoApellido}
                        onChange={handleChange(setRegForm)}
                      />
                      {errors.segundoApellido && <span className="ck-field-error">{errors.segundoApellido}</span>}
                    </div>
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Correo</label>
                    <input
                      className={`ck-input ${errors.correo ? "ck-input--error" : ""}`}
                      name="correo"
                      value={regForm.correo}
                      onChange={handleChange(setRegForm)}
                    />
                    {errors.correo && <span className="ck-field-error">{errors.correo}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Teléfono</label>
                    <input
                      className={`ck-input ${errors.telefono ? "ck-input--error" : ""}`}
                      name="telefono"
                      value={regForm.telefono}
                      onChange={handleChange(setRegForm)}
                    />
                    {errors.telefono && <span className="ck-field-error">{errors.telefono}</span>}
                  </div>

                  <button className="ck-btn-submit" disabled={loading}>
                    {loading ? "Registrando..." : "Crear cuenta"}
                  </button>
                </form>
              </>
            )}

            {/* CAMBIAR CONTRASEÑA */}
            {mode === "change_password" && (
              <>
                <h2 className="ck-section-title">Cambiar contraseña</h2>
                <form className="ck-form" onSubmit={handleChangePasswordSubmit}>

                  <div className="ck-field">
                    <label className="ck-label">Nueva contraseña</label>
                    <input
                      className={`ck-input ${errors.nueva_contrasena ? "ck-input--error" : ""}`}
                      type="password"
                      name="nueva_contrasena"
                      value={pwForm.nueva_contrasena}
                      onChange={handleChange(setPwForm)}
                    />
                    {errors.nueva_contrasena && <span className="ck-field-error">{errors.nueva_contrasena}</span>}
                  </div>

                  <div className="ck-field">
                    <label className="ck-label">Confirmar contraseña</label>
                    <input
                      className={`ck-input ${errors.confirmar_contrasena ? "ck-input--error" : ""}`}
                      type="password"
                      name="confirmar_contrasena"
                      value={pwForm.confirmar_contrasena}
                      onChange={handleChange(setPwForm)}
                    />
                    {errors.confirmar_contrasena && <span className="ck-field-error">{errors.confirmar_contrasena}</span>}
                  </div>

                  <button className="ck-btn-submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar contraseña"}
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
                    <input
                      className={`ck-input ${errors.direccion ? "ck-input--error" : ""}`}
                      name="direccion"
                      value={shipForm.direccion}
                      onChange={handleChange(setShipForm)}
                    />
                    {errors.direccion && <span className="ck-field-error">{errors.direccion}</span>}
                  </div>

                  <div className="ck-row">
                    <div className="ck-field">
                      <label className="ck-label">Ciudad</label>
                      <input
                        className={`ck-input ${errors.ciudad ? "ck-input--error" : ""}`}
                        name="ciudad"
                        value={shipForm.ciudad}
                        onChange={handleChange(setShipForm)}
                      />
                      {errors.ciudad && <span className="ck-field-error">{errors.ciudad}</span>}
                    </div>

                    <div className="ck-field">
                      <label className="ck-label">Departamento</label>
                      <input
                        className={`ck-input ${errors.estado ? "ck-input--error" : ""}`}
                        name="estado"
                        value={shipForm.estado}
                        onChange={handleChange(setShipForm)}
                      />
                      {errors.estado && <span className="ck-field-error">{errors.estado}</span>}
                    </div>
                  </div>

                  <div className="ck-field ck-field--half">
                    <label className="ck-label">Código postal</label>
                    <input
                      className={`ck-input ${errors.codigo_postal ? "ck-input--error" : ""}`}
                      name="codigo_postal"
                      value={shipForm.codigo_postal}
                      onChange={handleChange(setShipForm)}
                    />
                    {errors.codigo_postal && <span className="ck-field-error">{errors.codigo_postal}</span>}
                  </div>

                  <button className="ck-btn-submit" disabled={loading}>
                    {loading ? "Procesando..." : "Confirmar pedido"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* DERECHA — resumen */}
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
          </div>

        </div>
      </div>
    </div>
  );
} 