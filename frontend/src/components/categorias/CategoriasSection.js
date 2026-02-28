import React from "react";
import "./CategoriasSection.css";

export default function CategoriasSection({ categorias, onSelect }) {
  return (
    <section className="categorias-section">

      <div className="categorias-grid">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="categoria-card"
            onClick={() => onSelect(cat.id)}
          >
            <div className="categoria-overlay">
              <h3>{cat.nombre}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
