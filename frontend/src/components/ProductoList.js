import React, { useEffect, useState } from "react";
import ProductoCard from "./ProductoCard";
import { getProductos } from "../api/productos";
import "../style/productos.css";

export default function ProductoList() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getProductos();
      setProductos(data?.results || []);
    }
    fetchData();
  }, []);

  return (
    <div className="catalogo">
      {productos.map(p => (
        <ProductoCard key={p.codigo} producto={p} />
      ))}
    </div>
  );
}
