import { useNavigate } from "react-router-dom";
import img1 from "../../assets/img4.png";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.png";
import img4 from "../../assets/img1.png";
import img5 from "../../assets/img5.png";
import img6 from "../../assets/img6.png";
import "./Landing.css";

const WHATSAPP_NUMBER = "573014172170";
const WHATSAPP_MSG = encodeURIComponent("Hola, me gustaría obtener más información.");
const INSTAGRAM_URL = "https://www.instagram.com/mestizo.mob?igsh=Y2VxNjFoZXU2d3Zr";

export default function Landing() {
  const navigate = useNavigate();

  const goToCategory = (categoria) => {
    navigate(`/productos?categoria=${categoria}`);
  };

  return (
    <div className="landing">

      {/* HERO */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <p>DISEÑO</p>
            <p>INSPIRADO</p>
            <p>EN EL TERRITORIO</p>
          </div>
          <div className="hero-right">
            <p>Tu espacio tiene identidad.</p>
            <p>Nuestro diseño la acompaña</p>
            <div className="hero-highlight">
              <p>Estamos aquí,</p>
              <h2>para crear contigo</h2>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="categories">
        <h4>NUESTRAS CATEGORÍAS</h4>
        <div className="categories-grid">
          {[
            { label: "Sillas", img: img1, cat: "sillas" },
            { label: "Poltronas", img: img2, cat: "poltronas" },
            { label: "Sillas de barra", img: img3, cat: "sillas-barra" },
            { label: "Mesas de noche", img: img4, cat: "mesas-noche" },
            { label: "Mesas de centro", img: img5, cat: "Mesas" },
            { label: "Mesas de comedor", img: img6, cat: "comedores" },
          ].map(({ label, img, cat }) => (
            <div className="category-card" key={cat} onClick={() => goToCategory(cat)}>
              <p className="category-label">{label}</p>
              <div className="category-img-wrap">
                <img src={img} alt={label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-container">
          <div className="cta-left">
            <h2>¿Tienes<br />una idea?</h2>
          </div>
          <div className="cta-center">
            <p>juntos podemos hacerla realidad</p>
            <span>¡Escríbenos!</span>
          </div>
          <div className="cta-right">
            <a
              className="whatsapp-cta"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="whatsapp-cta-label">¡Conversemos!</span>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.61 4.47 1.68 6.35L3 29l6.83-1.64A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6a10.57 10.57 0 0 1-5.38-1.47l-.38-.23-3.98.96.99-3.87-.25-.4A10.56 10.56 0 0 1 5.4 16C5.4 9.62 10.62 4.4 17 4.4c3.1 0 6 1.21 8.19 3.4A11.52 11.52 0 0 1 28.6 16c0 6.38-5.22 11.6-11.6 11.6zm6.35-8.67c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.41.26-.76.09a9.55 9.55 0 0 1-2.82-1.74 10.7 10.7 0 0 1-1.95-2.42c-.2-.35 0-.54.15-.71.14-.16.35-.41.52-.61.17-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.17-.78-1.9-1.07-2.6-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.61.09-.93.44-.32.35-1.22 1.2-1.22 2.92s1.25 3.39 1.42 3.62c.17.23 2.46 3.76 5.97 5.27.83.36 1.49.58 2 .74.84.26 1.61.22 2.22.13.68-.1 2.08-.85 2.37-1.67.29-.82.29-1.52.2-1.67-.08-.14-.31-.23-.66-.4z" fill="#25D366" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">

          <div className="footer-left">
            <p className="footer-title">Visita<br />nuestro<br />showroom</p>
            <p className="footer-address">Cra 55a #35–227 Tercer Piso</p>
            <p className="footer-address">Mall Punto de encuentro<br />Llanogrande, Antioquia</p>
          </div>

          <div className="footer-divider" />

          <div className="footer-center">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg className="footer-ig" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#1a1a1a" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4.5" stroke="#1a1a1a" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="#1a1a1a" />
              </svg>
            </a>
          </div>

          <div className="footer-divider" />

          <div className="footer-right">
            <p className="footer-title">Contacto</p>
            <p className="footer-phone">301 417 2170</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
