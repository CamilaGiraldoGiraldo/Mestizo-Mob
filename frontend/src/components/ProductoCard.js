

import React from "react";
import "../style/productos.css";

export default function ProductoCard({ producto }) {
  const imagen =
    producto.imagenes?.length > 0
      ? producto.imagenes[0].imagen
      : "https://via.placeholder.com/300x220?text=Sin+imagen";

  return (
    <div className="producto-card">
      <img src={imagen} alt={producto.nombre} />

      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <div className="precio">${producto.precio}</div>
        <div className="categoria">{producto.categoria_nombre}</div>
        <div className="stock">Stock: {producto.stock}</div>
      </div>
    </div>
  );
}
