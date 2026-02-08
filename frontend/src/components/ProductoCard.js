import React from "react";
import "../style/productos.css";

export default function ProductoCard({ producto }) {
  const imagenes = producto.imagenes || [];

  const img1 = imagenes[0]?.imagen;
  const img2 = imagenes[1]?.imagen || img1;

  return (
    <div className="producto-card">
      <div className="producto-img-container">
        <img src={img1} alt={producto.nombre} className="main" />
        <img src={img2} alt={producto.nombre} className="hover" />
      </div>

      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <div className="precio">${producto.precio}</div>
        <div className="categoria">{producto.categoria_nombre}</div>
        <div className="stock">Stock: {producto.stock}</div>
      </div>
    </div>
  );
}
