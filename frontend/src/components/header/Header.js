import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiX, FiLogOut } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import CartDrawer from "../cart/CartDrawer";
import "./Header.css";

// ── Modal de Login ───────────────────────────────────────────
function LoginModal({ onClose, onLoginSuccess }) {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(correo, contrasena);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}><FiX /></button>

        <div className="login-header">
          <div className="login-avatar-icon"><FiUser /></div>
          <h2>Iniciar sesión</h2>
          <p>Accede a tu cuenta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dropdown usuario logueado ────────────────────────────────
function UserDropdown({ user, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/landing");
  };

  return (
    <div className="user-dropdown">
      <div className="user-dropdown-info">
        <span className="user-dropdown-name">{user.nombre}</span>
        <span className="user-dropdown-email">{user.correo}</span>
      </div>
      <hr className="user-dropdown-divider" />
      {(user.is_staff || user.is_superuser) && (
        <button
          className="user-dropdown-admin"
          onClick={() => { navigate("/admin"); onClose(); }}
        >
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
    // Redirige al admin si es staff/superuser
    const stored = JSON.parse(localStorage.getItem("auth_user") || "{}");
    if (stored.is_staff || stored.is_superuser) {
      navigate("/admin");
    }
  };

  return (
    <>
      <header className="header">
        <nav className="nav-container">

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <Link to="/productos" onClick={() => setMenuOpen(false)}>PRODUCTOS</Link>
            <Link to="/cita" onClick={() => setMenuOpen(false)}>AGENDA UNA CITA</Link>
            <Link to="/personaliza" onClick={() => setMenuOpen(false)}>PERSONALIZA</Link>
            <Link to="/visitanos" onClick={() => setMenuOpen(false)}>VISÍTANOS</Link>
          </div>

          <div className="right-section">

            {/* USUARIO */}
            <div className="user-container">
              <button
                className="user-btn"
                onClick={() => {
                  if (isLoggedIn) setUserDropOpen((o) => !o);
                  else setLoginOpen(true);
                }}
                title={isLoggedIn ? user.nombre : "Iniciar sesión"}
              >
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

            {/* HAMBURGUESA */}
            <div
              className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </div>

            {/* LOGO */}
            <div className="logo-container">
              <img src={logo} alt="Mestizo Mob" />
            </div>

          </div>
        </nav>
      </header>

      <CartDrawer isOpen={cartOpen} close={() => setCartOpen(false)} />
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
