import React from "react";
import "./FiltroBusqueda.css";

const FiltroBusqueda = ({
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  busqueda,
  setBusqueda
}) => {
  return (
    <div className="filtro-container">

      {/* INPUT BUSQUEDA */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar productos"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <span className="search-line"></span>
      </div>

      {/* SELECT CATEGORIA */}
      <div className="select-box">
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default FiltroBusqueda;
