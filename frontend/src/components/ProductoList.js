import React, { useEffect, useState } from "react";
import ProductoCard from "./ProductoCard";
import FiltroBusqueda from "./filtroBusqueda";
import { getProductos, getCategorias } from "../api/productos";

const ProductoList = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchProductos = async () => {
    const params = {
      search: busqueda,
      categoria: categoriaSeleccionada || undefined,
      page: pagina
    };
    const data = await getProductos(params);
    setProductos(data?.results || []);
    setTotalPaginas(Math.ceil((data?.count || 0)/10));
  };

  const fetchCategorias = async () => {
    const data = await getCategorias();
    setCategorias(data || []);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [busqueda, categoriaSeleccionada, pagina]);

  const handlePagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPagina(num);
  };

  return (
    <div>
      <h2>Productos</h2>
      <FiltroBusqueda
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {productos.map(p => <ProductoCard key={p.codigo} producto={p} />)}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => handlePagina(pagina-1)} disabled={pagina === 1}>Anterior</button>
        <span style={{ margin: "0 1rem" }}>{pagina} / {totalPaginas}</span>
        <button onClick={() => handlePagina(pagina+1)} disabled={pagina === totalPaginas}>Siguiente</button>
      </div>
    </div>
  );
};

export default ProductoList;
