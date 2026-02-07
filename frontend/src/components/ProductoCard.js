import React from "react";

const ProductoCard = ({ producto }) => (
  <div style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    margin: "1rem",
    width: "200px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  }}>
    <h3>{producto.nombre}</h3>
    <p>{producto.descripcion}</p>
    <p>Precio: ${producto.precio}</p>
    <p>Stock: {producto.stock}</p>
    <p>Categoria: {producto.categoria_nombre}</p>
  </div>
);

export default ProductoCard;
