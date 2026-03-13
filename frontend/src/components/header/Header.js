import { useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { cart } = useCart();

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <>
      <header className="header">
        <nav className="nav-container">

          {/* IZQUIERDA - LINKS */}
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <Link to="/productos" onClick={() => setMenuOpen(false)}>PRODUCTOS</Link>

            <Link to="/cita" onClick={() => setMenuOpen(false)}>
              AGENDA UNA CITA
            </Link>

            <Link to="/personaliza" onClick={() => setMenuOpen(false)}>PERSONALIZA</Link>
            <Link to="/visitanos" onClick={() => setMenuOpen(false)}>VISÍTANOS</Link>
          </div>

          {/* DERECHA */}
          <div className="right-section">

            {/* CARRITO */}
            <div className="cart-container" onClick={() => setCartOpen(true)}>
              <FiShoppingCart className="cart-icon" />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </div>

            {/* HAMBURGUESA */}
            <div
              className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* LOGO */}
            <div className="logo-container">
              <img src={logo} alt="Mestizo Mob" />
            </div>

          </div>
        </nav>
      </header>

      <CartDrawer isOpen={cartOpen} close={() => setCartOpen(false)} />
    </>
  );
}