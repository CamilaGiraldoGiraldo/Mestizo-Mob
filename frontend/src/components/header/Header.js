import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiX, FiLogOut } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import CartDrawer from "../cart/CartDrawer";
import "./Header.css";

const BASE = "http://192.168.1.8/usuario";

// ── Modal Login / Recuperación ───────────────────────────────
function LoginModal({ onClose, onLoginSuccess }) {
  const { login } = useAuth();

  const [paso, setPaso] = useState("login");

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const reset = () => {
    setError(""); setInfo("");
    setCodigo(""); setNuevaContrasena(""); setConfirmar("");
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await login(correo, contrasena);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally { setLoading(false); }
  };

  const handleEnviarCodigo = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/enviar-codigo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al enviar el código."); return; }
      setInfo("Si el correo está registrado, recibirás un código en tu bandeja.");
      setPaso("codigo");
    } catch { setError("No se pudo conectar con el servidor."); }
    finally { setLoading(false); }
  };

  const handleVerificarCodigo = (e) => {
    e.preventDefault(); setError("");
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos."); return; }
    setInfo(""); setPaso("nueva");
  };

  const handleNuevaContrasena = async (e) => {
    e.preventDefault(); setError("");
    if (nuevaContrasena.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (nuevaContrasena !== confirmar) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/resetear-contrasena/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo, nueva_contrasena: nuevaContrasena }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al cambiar la contraseña."); return; }
      setInfo("¡Contraseña actualizada! Ya puedes iniciar sesión.");
      reset(); setPaso("login");
    } catch { setError("No se pudo conectar con el servidor."); }
    finally { setLoading(false); }
  };

  const titulos = {
    login: { h2: "Iniciar sesión", sub: "Accede a tu cuenta" },
    enviar: { h2: "Recuperar contraseña", sub: "Te enviaremos un código a tu correo" },
    codigo: { h2: "Ingresa el código", sub: `Código enviado a ${correo}` },
    nueva: { h2: "Nueva contraseña", sub: "Elige una contraseña segura" },
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}><FiX /></button>

        <div className="login-header">
          <div className="login-avatar-icon"><FiUser /></div>
          <h2>{titulos[paso].h2}</h2>
          <p>{titulos[paso].sub}</p>
        </div>

        {error && <p className="login-error">{error}</p>}
        {info && <p className="login-info">{info}</p>}

        {paso === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tucorreo@ejemplo.com"
                value={correo} onChange={(e) => setCorreo(e.target.value)} required autoFocus />
            </div>
            <div className="login-field">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••"
                value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
            <button type="button" className="login-forgot"
              onClick={() => { reset(); setPaso("enviar"); }}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {paso === "enviar" && (
          <form className="login-form" onSubmit={handleEnviarCodigo}>
            <div className="login-field">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tucorreo@ejemplo.com"
                value={correo} onChange={(e) => setCorreo(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Enviando…" : "Enviar código"}
            </button>
            <button type="button" className="login-forgot"
              onClick={() => { reset(); setPaso("login"); }}>
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {paso === "codigo" && (
          <form className="login-form" onSubmit={handleVerificarCodigo}>
            <div className="login-field">
              <label>Código de 6 dígitos</label>
              <input type="text" placeholder="123456" maxLength={6}
                value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                required autoFocus
                style={{ letterSpacing: "0.3em", fontSize: 20, textAlign: "center" }} />
            </div>
            <button type="submit" className="login-submit">
              Verificar código
            </button>
            <button type="button" className="login-forgot"
              onClick={() => { reset(); setPaso("enviar"); }}>
              ¿No recibiste el código? Reenviar
            </button>
          </form>
        )}

        {paso === "nueva" && (
          <form className="login-form" onSubmit={handleNuevaContrasena}>
            <div className="login-field">
              <label>Nueva contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres"
                value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)}
                required autoFocus />
            </div>
            <div className="login-field">
              <label>Confirmar contraseña</label>
              <input type="password" placeholder="Repite la contraseña"
                value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Dropdown usuario logueado ────────────────────────────────
function UserDropdown({ user, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); onClose(); navigate("/landing");
  };

  return (
    <div className="user-dropdown">
      <div className="user-dropdown-info">
        <span className="user-dropdown-name">{user.nombre}</span>
        <span className="user-dropdown-email">{user.correo}</span>
      </div>
      <hr className="user-dropdown-divider" />
      {(user.is_staff || user.is_superuser) && (
        <button className="user-dropdown-admin"
          onClick={() => { navigate("/admin"); onClose(); }}>
          ⚙ Panel de administración
        </button>
      )}
      <button className="user-dropdown-logout" onClick={handleLogout}>
        <FiLogOut /> Cerrar sesión
      </button>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  const { cart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    const stored = JSON.parse(localStorage.getItem("auth_user") || "{}");
    if (stored.is_staff || stored.is_superuser) navigate("/admin");
  };

  return (
    <>
      <header className="header">
        <nav className="nav-container">

          {/*
           * LOGO MOBILE — visible solo en mobile, izquierda
           * En desktop está oculto (lo muestra el right-section)
           */}
          <div className="logo-mobile">
            <img src={logo} alt="Mestizo Mob" />
          </div>

          {/* LINKS — izquierda en desktop, drawer en mobile */}
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <Link to="/landing" onClick={() => setMenuOpen(false)}>INICIO</Link>
            <Link to="/productos" onClick={() => setMenuOpen(false)}>PRODUCTOS</Link>
            <Link to="/cita" onClick={() => setMenuOpen(false)}>AGENDA UNA CITA</Link>
            <Link to="/personaliza" onClick={() => setMenuOpen(false)}>PERSONALIZA</Link>
          </div>

          {/* RIGHT SECTION — iconos + logo desktop */}
          <div className="right-section">

            {/* USUARIO */}
            <div className="user-container">
              <button className="user-btn"
                onClick={() => { if (isLoggedIn) setUserDropOpen((o) => !o); else setLoginOpen(true); }}
                title={isLoggedIn ? user.nombre : "Iniciar sesión"}>
                <FiUser className="user-icon" />
                {isLoggedIn && <span className="user-dot" />}
              </button>
              {isLoggedIn && userDropOpen && (
                <UserDropdown user={user} onClose={() => setUserDropOpen(false)} />
              )}
            </div>

            {/* CARRITO */}
            <div className="cart-container" onClick={() => setCartOpen(true)}>
              <FiShoppingCart className="cart-icon" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>

            {/* HAMBURGUESA — solo mobile */}
            <div className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </div>

            {/* LOGO DESKTOP — visible solo en desktop, derecha */}
            <div className="logo-desktop">
              <img src={logo} alt="Mestizo Mob" />
            </div>

          </div>
        </nav>
      </header>

      <CartDrawer isOpen={cartOpen} close={() => setCartOpen(false)} />
      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
