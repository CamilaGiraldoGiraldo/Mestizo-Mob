import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductos } from "../productos/productos";
import { useCart } from "../../context/CartContext";
import "@google/model-viewer";
import "./DetalleProducto.css";

export default function DetalleProducto() {

  const { id } = useParams();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenIndex, setImagenIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [mostrarAR, setMostrarAR] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [imagenesActuales, setImagenesActuales] = useState([]);

  useEffect(() => {

    const cargarProducto = async () => {

      const data = await getProductos();
      const lista = data?.results || [];

      const encontrado = lista.find(
        (p) => String(p.id) === String(id)
      );

      setProducto(encontrado);

      if (encontrado?.colores?.length > 0) {

        const primerColor = encontrado.colores[0];

        setColorSeleccionado(primerColor);
        setImagenesActuales(primerColor.imagenes || []);

      }

    };

    cargarProducto();

  }, [id]);


  if (!producto) return <p className="loading">Cargando producto...</p>;


  const imagenes = imagenesActuales || [];
  const imagenActiva = imagenes[imagenIndex]?.imagen;


  const formatCOP = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);


  const siguienteImagen = () => {

    setImagenIndex((prev) =>
      prev === imagenes.length - 1 ? 0 : prev + 1
    );

  };


  const anteriorImagen = () => {

    setImagenIndex((prev) =>
      prev === 0 ? imagenes.length - 1 : prev - 1
    );

  };


  const seleccionarColor = (color) => {

    setColorSeleccionado(color);

    if (color.imagenes && color.imagenes.length > 0) {

      setImagenesActuales(color.imagenes);
      setImagenIndex(0);

    }

  };


  const handleAdd = () => {

    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: imagenActiva,
      cantidad: cantidad,
      color: colorSeleccionado?.nombre
    });

  };


  return (

    <div className="detalle-wrapper">

      <div className="detalle-container">

        {/* GALERÍA */}

        <div className="detalle-galeria">

          <div className="imagen-principal">

            {imagenes.length > 1 && (
              <button
                className="nav-btn left"
                onClick={anteriorImagen}
              >
                ‹
              </button>
            )}

            <img
              src={imagenActiva}
              alt={producto.nombre}
              onClick={() => setFullscreen(true)}
            />

            {imagenes.length > 1 && (
              <button
                className="nav-btn right"
                onClick={siguienteImagen}
              >
                ›
              </button>
            )}

          </div>


          <div className="miniaturas">

            {imagenes.map((img, i) => (

              <img
                key={i}
                src={img.imagen}
                alt="mini"
                className={i === imagenIndex ? "activa" : ""}
                onClick={() => setImagenIndex(i)}
              />

            ))}

          </div>

        </div>


        {/* INFORMACIÓN */}

        <div className="detalle-info">

          <span className="categoria">
            {producto.categoria_nombre}
          </span>

          <h1>{producto.nombre}</h1>

          <p className="precio">
            {formatCOP(producto.precio)}
          </p>

          <p className="descripcion">
            {producto.descripcion}
          </p>


          {/* COLORES */}

          {producto.colores?.length > 0 && (

            <div className="colores-box">

              <span className="label">
                Colores disponibles
              </span>

              <div className="colores">

                {producto.colores.map((color, i) => (

                  <button
                    key={i}
                    className={`color-circle ${
                      colorSeleccionado?.nombre === color.nombre
                        ? "activo"
                        : ""
                    }`}
                    style={{
                      background: color.codigo_hex || "#ccc"
                    }}
                    title={color.nombre}
                    onClick={() => seleccionarColor(color)}
                  />

                ))}

              </div>

            </div>

          )}


          {/* CANTIDAD */}

          <div className="cantidad-box">

            <button
              onClick={() =>
                setCantidad(Math.max(1, cantidad - 1))
              }
            >
              −
            </button>

            <span>{cantidad}</span>

            <button
              onClick={() => setCantidad(cantidad + 1)}
            >
              +
            </button>

          </div>


          {/* BOTÓN CARRITO */}

          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={producto.stock === 0}
          >
            {producto.stock === 0
              ? "Producto agotado"
              : "Añadir al carrito"}
          </button>


          {/* REALIDAD AUMENTADA */}

          {producto.modelo_glb && (

            <>
              <button
                className="btn-secondary"
                onClick={() => setMostrarAR(!mostrarAR)}
              >
                {mostrarAR
                  ? "Ocultar modelo 3D"
                  : "Ver en realidad aumentada"}
              </button>

              {mostrarAR && (

                <div className="visor-ar">

                  <model-viewer
                    src={producto.modelo_glb}
                    alt={producto.nombre}
                    ar
                    ar-modes="scene-viewer quick-look webxr"
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                  />

                </div>

              )}

            </>

          )}

        </div>

      </div>


      {/* FULLSCREEN */}

      {fullscreen && (

        <div
          className="fullscreen"
          onClick={() => setFullscreen(false)}
        >

          <img
            src={imagenActiva}
            alt="fullscreen"
          />

        </div>

      )}

    </div>

  );

}