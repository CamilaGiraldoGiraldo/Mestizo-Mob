import { useNavigate } from "react-router-dom";
import img1 from "../../assets/img4.png";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.png";
import img4 from "../../assets/img1.png";
import img5 from "../../assets/img5.png";
import img6 from "../../assets/img6.png";
import "./Landing.css";

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

          <div className="category-card"
            onClick={() => goToCategory("sillas-barra")}
          >
            <img src={img1} alt="Sillas barra" />
            <div className="overlay">
              <h3>Sillas barra</h3>
            </div>
          </div>

          <div className="category-card"
            onClick={() => goToCategory("sillas")}
          >
            <img src={img2} alt="Sillas" />
            <div className="overlay">
              <h3>Sillas</h3>
            </div>
          </div>

          <div className="category-card"
            onClick={() => goToCategory("mesas-auxiliares")}
          >
            <img src={img3} alt="Mesas auxiliares" />
            <div className="overlay">
              <h3>Mesas auxiliares</h3>
            </div>
          </div>

          <div className="category-card"
            onClick={() => goToCategory("comedores")}
          >
            <img src={img4} alt="Comedores" />
            <div className="overlay">
              <h3>Comedores</h3>
            </div>
          </div>

          <div className="category-card"
            onClick={() => goToCategory("poltronas")}
          >
            <img src={img5} alt="Poltronas" />
            <div className="overlay">
              <h3>Poltronas</h3>
            </div>
          </div>

          <div className="category-card"
            onClick={() => goToCategory("Mesas")}
          >
            <img src={img6} alt="Mesas de centro" />
            <div className="overlay">
              <h3>Mesas de centro</h3>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
<section className="cta">
  <div className="cta-container">
    
    <div className="cta-left">
      <h2>¿Tienes una idea?</h2>
    </div>

    <div className="cta-right">
      <p>juntos podemos hacerla realidad</p>
      <span>¡Escríbenos!</span>
    </div>

  </div>
</section>

    </div>
  );
}