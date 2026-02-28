import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductoCard from "../productoCard/ProductoCard";
import { getProductos } from "../productos/productos";
import "../productos/productos.css";

export default function ProductoList() {
  const [productos, setProductos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPrecio, setFiltroPrecio] = useState("Todos");
  const [filtroStock, setFiltroStock] = useState("Todos");

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoriaURL = searchParams.get("categoria");

    if (categoriaURL) {
      const categoriaFormateada = categoriaURL
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      setFiltroCategoria(categoriaFormateada);
    } else {
      setFiltroCategoria("Todas");
    }

    setPaginaActual(1);
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const data = await getProductos();
      setProductos(data?.results || []);
    }
    fetchData();
  }, []);

  const categorias = useMemo(() => {
    const nombres = productos.map((p) => p.categoria_nombre);
    return ["Todas", ...new Set(nombres)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (
        filtroCategoria !== "Todas" &&
        p.categoria_nombre !== filtroCategoria
      )
        return false;

      const precio = Number(String(p.precio).replace(/\./g, ""));

      if (filtroPrecio === "low" && precio >= 200000) return false;
      if (filtroPrecio === "mid" && (precio < 200000 || precio > 500000))
        return false;
      if (filtroPrecio === "high" && precio <= 500000) return false;

      return true;
    });
  }, [productos, filtroCategoria, filtroPrecio, filtroStock]);

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const productosActuales = productosFiltrados.slice(
    indexPrimero,
    indexUltimo
  );

  const cambiarPagina = (num) => {
    setPaginaActual(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroCategoria, filtroPrecio, filtroStock]);

  return (
    <div className="catalogo-wrapper">

      <div className="catalogo-top">
        <h1>Productos</h1>

        <div className="top-right">
          <span className="result-count">
            {productosFiltrados.length} productos
          </span>

          <button
            className={`filter-btn ${mostrarFiltros ? "active" : ""}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
        </div>
      )}

      <div className="productos-grid">
        {productosActuales.length > 0 ? (
          productosActuales.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))
        ) : (
          <p className="no-results">
            No hay productos con estos filtros
          </p>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${
                paginaActual === i + 1 ? "active" : ""
              }`}
              onClick={() => cambiarPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}