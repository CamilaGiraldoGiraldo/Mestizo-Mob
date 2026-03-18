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
      const encontrado = lista.find((p) => String(p.id) === String(id));
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

  const siguienteImagen = () =>
    setImagenIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));

  const anteriorImagen = () =>
    setImagenIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));

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
      color: colorSeleccionado?.nombre,
    });
  };

  const dimensionesList = [
    { label: "Alto", valor: producto.alto, unidad: "cm" },
    { label: "Ancho", valor: producto.ancho, unidad: "cm" },
    { label: "Profundidad", valor: producto.profundidad, unidad: "cm" },
    { label: "Peso", valor: producto.peso, unidad: "kg" },
    { label: "Material", valor: producto.material, unidad: "" },
  ].filter((d) => d.valor);

  const tieneDimensiones =
    dimensionesList.length > 0 || producto.imagenes_dimensiones?.length > 0;

  const imagenesSecundarias = imagenes.slice(1, 3);

  return (
    <div className="dp-wrapper">

      {/* ══ HERO ══ */}
      <div className="dp-hero">

        {/* Galería izquierda */}
        <div className="dp-galeria">
          <div className="dp-img-principal">
            {imagenes.length > 1 && (
              <button className="dp-nav left" onClick={anteriorImagen}>‹</button>
            )}
            <img
              src={imagenActiva}
              alt={producto.nombre}
              onClick={() => setFullscreen(true)}
            />
            {imagenes.length > 1 && (
              <button className="dp-nav right" onClick={siguienteImagen}>›</button>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="dp-miniaturas">
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  className={`dp-mini ${i === imagenIndex ? "activa" : ""}`}
                  onClick={() => setImagenIndex(i)}
                >
                  <img src={img.imagen} alt={`Vista ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info derecha */}
        <div className="dp-info">
          <span className="dp-categoria">{producto.categoria_nombre}</span>
          <h1 className="dp-nombre">{producto.nombre}</h1>
          <p className="dp-precio">{formatCOP(producto.precio)}</p>

          {producto.colores?.length > 0 && (
            <div className="dp-colores-wrap">
              <span className="dp-colores-label">Color</span>
              <div className="dp-colores">
                {producto.colores.map((color, i) => (
                  <button
                    key={i}
                    className={`dp-color-btn ${colorSeleccionado?.nombre === color.nombre ? "activo" : ""}`}
                    style={!color.imagen_url ? { background: color.codigo_hex || "#ccc" } : {}}
                    onClick={() => seleccionarColor(color)}
                    title={color.nombre}
                  >
                    {color.imagen_url && (
                      <img
                        src={color.imagen_url}
                        alt={color.nombre}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", pointerEvents: "none" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="dp-descripcion">{producto.descripcion}</p>

          <div className="dp-acciones">
            <div className="dp-cantidad">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>−</button>
              <span>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)}>+</button>
            </div>
            <button
              className="dp-btn-add"
              onClick={handleAdd}
              disabled={producto.stock === 0}
            >
              {producto.stock === 0 ? "Agotado" : "Añadir al carrito"}
            </button>
          </div>

          {producto.modelo_glb && (
            <>
              <button className="dp-btn-ar" onClick={() => setMostrarAR(!mostrarAR)}>
                {mostrarAR ? "Ocultar modelo 3D" : "Ver en realidad aumentada"}
              </button>
              {mostrarAR && (
                <div className="dp-visor-ar">
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

          {/* Imágenes secundarias en el panel derecho */}
          {imagenesSecundarias.length > 0 && (
            <div className="dp-imgs-sec">
              {imagenesSecundarias.map((img, i) => (
                <button
                  key={i}
                  className={`dp-img-sec-btn ${imagenIndex === i + 1 ? "activa" : ""}`}
                  onClick={() => setImagenIndex(i + 1)}
                >
                  <img src={img.imagen} alt={`Vista ${i + 2}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DIMENSIONES ══ */}
      {tieneDimensiones && (
        <div className="dp-dimensiones">
          <p className="dp-dim-titulo">Dimensiones</p>
          <div className="dp-dim-body">

            {producto.imagenes_dimensiones?.length > 0 && (
              <div className="dp-planos">
                {producto.imagenes_dimensiones.map((img, i) => (
                  <div key={i} className="dp-plano-card">
                    <img src={img.imagen} alt={img.descripcion || `Plano ${i + 1}`} />
                    {img.descripcion && (
                      <span className="dp-plano-label">{img.descripcion}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {dimensionesList.length > 0 && (
              <div className="dp-medidas">
                {dimensionesList.map((d, i) => (
                  <div key={i} className="dp-medida-row">
                    <span className="dp-medida-key">{d.label}</span>
                    <span className="dp-medida-val">
                      {d.valor}{d.unidad ? ` ${d.unidad}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ FULLSCREEN ══ */}
      {fullscreen && (
        <div className="dp-fullscreen" onClick={() => setFullscreen(false)}>
          <img src={imagenActiva} alt="fullscreen" />
        </div>
      )}
    </div>
  );
}




























