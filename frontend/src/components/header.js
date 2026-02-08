import "../style/Header.css";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-left">
          <li>MESTIZO</li>
          <li>MOBILIARIO</li>
          <li>SERVICIOS</li>
          <li>COMPLEMENTOS DE MESA</li>
        </ul>

        <div className="logo">
          <img src={logo} alt="Mestizo Mobiliario" />
        </div>

        <ul className="nav-right">
          <li>CONTACTO</li>
          <li className="highlight">DONDE COMPRAR</li>
        </ul>

        <div className="icons">
          <span>🔍</span>
          <span>👤</span>
          <span>🤍</span>
          <span>🛒</span>
        </div>
      </nav>
    </header>
  );
}
