import React, { useEffect, useState } from "react";
import ProductoCard from "./ProductoCard";
import { getProductos } from "../api/productos";
import "../style/productos.css";

export default function ProductoList() {
  const [productos, setProductos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de filtros
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPrecio, setFiltroPrecio] = useState("Todos");
  const [filtroStock, setFiltroStock] = useState("Todos");

  useEffect(() => {
    async function fetchData() {
      const data = await getProductos();
      setProductos(data?.results || []);
    }
    fetchData();
  }, []);

  // 🔥 LÓGICA DE FILTRADO REAL
  const productosFiltrados = productos.filter((p) => {
    // Categoría
    if (
      filtroCategoria !== "Todas" &&
      p.categoria_nombre !== filtroCategoria
    ) {
      return false;
    }

    // Stock
    if (filtroStock === "Disponible" && p.stock <= 0) return false;
    if (filtroStock === "Agotado" && p.stock > 0) return false;

    // Precio (string → número)
    const precio = Number(p.precio.replace(/\./g, ""));
    if (filtroPrecio === "low" && precio >= 200000) return false;
    if (filtroPrecio === "mid" && (precio < 200000 || precio > 500000))
      return false;
    if (filtroPrecio === "high" && precio <= 500000) return false;

    return true;
  });

  return (
    <div className="catalogo">
      {/* Barra filtros */}
      <div className="filters-bar">
        <button
          className="filter-btn"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          FILTROS
        </button>
      </div>

      {/* Panel filtros */}
      {mostrarFiltros && (
        <div className="filters-panel">
          {/* Categoría */}
          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="Todas">Todas</option>
              <option value="Sillas">Sillas</option>
              <option value="Mesas">Mesas</option>
            </select>
          </div>

          {/* Precio */}
          <div className="filter-group">
            <label>Precio</label>
            <select
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="low">Menor a $200.000</option>
              <option value="mid">$200.000 – $500.000</option>
              <option value="high">Mayor a $500.000</option>
            </select>
          </div>

          {/* Stock */}
          <div className="filter-group">
            <label>Stock</label>
            <select
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid productos */}
      <div className="productos-grid">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((p) => (
            <ProductoCard key={p.codigo} producto={p} />
          ))
        ) : (
          <p>No hay productos con estos filtros</p>
        )}
      </div>
    </div>
  );
}
