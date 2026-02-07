import React from "react";

const FiltroBusqueda = ({ categorias, categoriaSeleccionada, setCategoriaSeleccionada, busqueda, setBusqueda }) => (
  <div style={{ marginBottom: "1rem" }}>
    <input
      type="text"
      placeholder="Buscar productos..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      style={{ padding: "0.5rem", marginRight: "1rem" }}
    />

    <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
      <option value="">Todas las categorías</option>
      {categorias.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
      ))}
    </select>
  </div>
);

export default FiltroBusqueda;
