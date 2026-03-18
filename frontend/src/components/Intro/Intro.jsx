import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import img1 from "../../assets/portada.jpg";
import img2 from "../../assets/portada2.jpg";
import img3 from "../../assets/portada3.jpg";
import "./Intro.css";

const images = [img1, img2, img3];

export default function Intro() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Slide ${i + 1}`}
          className={`intro-bg ${i === current ? "active" : ""}`}
        />
      ))}

      <div className="intro-overlay" />

      <div className="intro-content">
        <button onClick={() => navigate("/landing")}>Bienvenido</button>
      </div>
    </div>
  );
}