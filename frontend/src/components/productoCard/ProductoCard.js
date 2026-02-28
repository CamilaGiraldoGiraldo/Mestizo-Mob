import React from "react";
import "../productos/productos.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductoCard({ producto }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const imagenes = producto.imagenes || [];

  const img1 = imagenes[0]?.imagen;
  const img2 = imagenes[1]?.imagen;
  const img3 = imagenes[2]?.imagen;
  const img4 = imagenes[3]?.imagen;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: img1,
      cantidad: 1,
    });
  };

  const formatCOP = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  return (
    <div
      className="producto-card"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      <div className="producto-img-container">
        {/* Imagen principal */}
        {img1 && (
          <img
            src={img1}
            alt={producto.nombre}
            className="img main-img"
          />
        )}

        {/* Imagen hover */}
        {img2 && (
          <img
            src={img2}
            alt={producto.nombre}
            className="img hover-img"
          />
        )}
        {/* Imagen hover */}
        {img3 && (
          <img
            src={img3}
            alt={producto.nombre}
            className="img hover-img1"
          />
        )}

        {producto.stock === 0 && (
          <div className="out-stock">Agotado</div>
        )}
      </div>

      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <div className="precio">{formatCOP(producto.precio)}</div>
        <div className="categoria">{producto.categoria_nombre}</div>

        <button
          className="btn-carrito"
          onClick={handleAdd}
          disabled={producto.stock === 0}
        >
          {producto.stock === 0 ? "Sin stock" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
}