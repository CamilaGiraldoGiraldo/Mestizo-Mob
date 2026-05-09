import React, { useState, useEffect } from "react";
import "./PanelAdmin.css";

const BASE = "http://127.0.0.1:8000/api";

/* ─── Auth ───────────────────────────────────────────────── */
const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  return token ? `Token ${token}` : null;
};
const clearAuthHeader = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};
const isAdmin = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) return false;
  try {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    return !!(user.is_staff || user.is_superuser);
  } catch { return false; }
};
const apiFetch = (url, opts = {}) => {
  const auth = getAuthHeader();
  const headers = { ...(opts.headers || {}), ...(auth ? { Authorization: auth } : {}) };
  if (!(opts.body instanceof FormData) && !headers["Content-Type"] && opts.method && opts.method !== "GET")
    headers["Content-Type"] = "application/json";
  return fetch(url, { ...opts, headers });
};
const tryLogin = async (correo, contrasena) => {
  try {
    const res = await fetch("http://127.0.0.1:8000/usuario/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    }
    return { ok: false, error: data.error || "Credenciales incorrectas." };
  } catch (_) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
};

/* ─── Cloudinary URL ─────────────────────────────────────── */
const buildCloudinaryUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `https://res.cloudinary.com/de8ra2czm/${raw}`;
};
const buildCloudinaryRawUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `https://res.cloudinary.com/de8ra2czm/${raw}`;
};

/* ─── Thumbnail ──────────────────────────────────────────── */
const Thumb = ({ src, size = 48, radius = 6 }) => {
  const [err, setErr] = useState(false);
  const url = buildCloudinaryUrl(src);
  if (!url || err) return (
    <div style={{ width: size, height: size, borderRadius: radius, background: "#1a1e25", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.35, opacity: 0.3 }}>🖼</span>
    </div>
  );
  return <img src={url} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "block" }} alt="" />;
};

/* ─── Modelo3DStatus ─────────────────────────────────────── */
const Modelo3DStatus = ({ url, label, onClear }) => {
  if (!url) return null;
  const fullUrl = buildCloudinaryRawUrl(url);
  const filename = fullUrl ? fullUrl.split("/").pop().split("?")[0] : "modelo";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(76,175,125,0.08)", border: "1px solid rgba(76,175,125,0.25)", borderRadius: 6, padding: "8px 12px", marginBottom: 8 }}>
      <span style={{ fontSize: 20 }}>📦</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4caf7d", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
          {label} guardado
        </div>
        <a href={fullUrl} target="_blank" rel="noreferrer"
          style={{ color: "#5b9cf6", fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={fullUrl}>
          {filename} ↗
        </a>
      </div>
      <button type="button" onClick={onClear} title="Quitar modelo"
        style={{ background: "rgba(224,84,84,0.1)", border: "1px solid rgba(224,84,84,0.3)", color: "#e05454", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
        ✕ quitar
      </button>
    </div>
  );
};

/* ─── Badge estado citas ─────────────────────────────────── */
const ESTADO_COLORS = {
  pendiente: { bg: "rgba(232,197,71,0.15)", border: "rgba(232,197,71,0.4)", color: "#e8c547" },
  confirmada: { bg: "rgba(76,175,125,0.15)", border: "rgba(76,175,125,0.4)", color: "#4caf7d" },
  cancelada: { bg: "rgba(224,84,84,0.15)", border: "rgba(224,84,84,0.4)", color: "#e05454" },
};
const EstadoBadge = ({ estado }) => {
  const s = ESTADO_COLORS[estado] || ESTADO_COLORS.pendiente;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {estado}
    </span>
  );
};

/* ─── Badge estado pedidos ───────────────────────────────── */
const ESTADO_PEDIDO_META = {
  pendiente: { bg: "rgba(232,197,71,0.15)", border: "rgba(232,197,71,0.4)", color: "#e8c547", icon: "🕐" },
  confirmado: { bg: "rgba(91,156,246,0.15)", border: "rgba(91,156,246,0.4)", color: "#5b9cf6", icon: "✓" },
  en_preparacion: { bg: "rgba(168,130,255,0.15)", border: "rgba(168,130,255,0.4)", color: "#a882ff", icon: "⚙" },
  enviado: { bg: "rgba(255,170,68,0.15)", border: "rgba(255,170,68,0.4)", color: "#ffaa44", icon: "🚚" },
  entregado: { bg: "rgba(76,175,125,0.15)", border: "rgba(76,175,125,0.4)", color: "#4caf7d", icon: "✅" },
  cancelado: { bg: "rgba(224,84,84,0.15)", border: "rgba(224,84,84,0.4)", color: "#e05454", icon: "✕" },
};
const ESTADOS_PEDIDO = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en_preparacion", label: "En preparación" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];
const EstadoPedidoBadge = ({ estado }) => {
  const s = ESTADO_PEDIDO_META[estado] || ESTADO_PEDIDO_META.pendiente;
  const label = ESTADOS_PEDIDO.find((e) => e.value === estado)?.label || estado;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 10 }}>{s.icon}</span>
      {label}
    </span>
  );
};

/* ─── Toast ──────────────────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  const add = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  };
  return { toasts, add, remove };
};
const Toasts = ({ toasts, remove }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map((t) => (
      <div key={t.id} onClick={() => remove(t.id)}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer",
          background: t.type === "success" ? "#1a2e1f" : t.type === "error" ? "#2e1a1a" : "#1a1e25",
          border: `1px solid ${t.type === "success" ? "rgba(76,175,125,0.3)" : t.type === "error" ? "rgba(224,84,84,0.3)" : "rgba(255,255,255,0.07)"}`,
          color: t.type === "success" ? "#4caf7d" : t.type === "error" ? "#e05454" : "#e8eaf0",
          fontSize: 13.5, minWidth: 240, maxWidth: 360, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
        }}>
        <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "·"}</span>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

/* ─── Estilos DJ ─────────────────────────────────────────── */
const DJ = {
  page: { fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#e8eaf0" },
  fieldRow: { display: "flex", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 0" },
  fieldLabel: { width: 180, minWidth: 180, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: "#4a4f5e", letterSpacing: "0.07em", textTransform: "uppercase", paddingTop: 8, paddingRight: 16 },
  fieldInput: { flex: 1 },
  input: { background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", color: "#e8eaf0", padding: "8px 10px", fontSize: 13.5, width: "100%", boxSizing: "border-box", outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  textarea: { background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", color: "#e8eaf0", padding: "8px 10px", fontSize: 13.5, width: "100%", boxSizing: "border-box", minHeight: 120, resize: "vertical", outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  select: { background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", color: "#e8eaf0", padding: "8px 10px", fontSize: 13.5, outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  inlineHeader: { background: "#1a1e25", borderLeft: "3px solid #e8c547", padding: "8px 14px", fontSize: 11, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "#e8c547", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 20 },
  inlineHeaderBlue: { background: "#1a1e25", borderLeft: "3px solid #5b9cf6", padding: "8px 14px", fontSize: 11, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "#5b9cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 20 },
  inlineHeaderGreen: { background: "#1a1e25", borderLeft: "3px solid #4caf7d", padding: "8px 14px", fontSize: 11, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "#4caf7d", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 20 },
  inlineTable: { width: "100%", borderCollapse: "collapse" },
  inlineTh: { background: "#13161b", padding: "8px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 500, color: "#4a4f5e", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  inlineTd: { padding: "7px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  inlineInput: { background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", color: "#e8eaf0", padding: "5px 8px", fontSize: 12.5, width: "100%", boxSizing: "border-box", outline: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif" },
  addLink: { display: "inline-block", marginTop: 8, color: "#5b9cf6", fontSize: 12.5, cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "underline" },
  removeBtn: { background: "rgba(224,84,84,0.1)", border: "1px solid rgba(224,84,84,0.3)", color: "#e05454", width: 24, height: 24, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 },
  saveBar: { background: "#13161b", padding: "14px 0", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 24 },
  btnSave: { background: "#e8c547", color: "#0d0f12", border: "none", padding: "10px 20px", fontSize: 13.5, cursor: "pointer", fontWeight: 600, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" },
  btnAlt: { background: "transparent", color: "#8a8f9e", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", fontSize: 13.5, cursor: "pointer", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" },
  btnBack: { background: "transparent", color: "#5b9cf6", border: "none", padding: "6px 0", fontSize: 13.5, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" },
};

/* ─── Helpers ────────────────────────────────────────────── */
const emptyColor = () => ({ _uid: Math.random(), nombre: "", codigo_hex: "", imagen_file: null, DELETE: false });
const emptyImagen = (colorUid, colorId) => ({
  _uid: Math.random(), _colorUid: colorUid, _colorId: colorId || null,
  imagen_file: null, previewUrl: null, orden: 1, DELETE: false,
});
const emptyPlano = () => ({
  _uid: Math.random(), id: null,
  imagen_file: null, previewUrl: null,
  descripcion: "", orden: 1, DELETE: false,
});

const getItemPk = (section, item) => {
  if (!item) return null;
  if (section.key === "usuarios") return item.identificacion;
  return item.id;
};

/* ═══════════════════════════════════════════════════════════
   MODAL DETALLE PEDIDO
   ═══════════════════════════════════════════════════════════ */
const PedidoDetalleModal = ({ pedido, onClose }) => {
  if (!pedido) return null;
  const items = pedido.items || [];
  const meta = [
    ["Identificación", pedido.usuario_identificacion],
    ["Nombre", `${pedido.usuario_nombre || ""} ${pedido.usuario_primer_apellido || ""}`.trim()],
    ["Correo", pedido.usuario_correo],
    ["Teléfono", pedido.usuario_telefono],
  ].filter(([, v]) => v);
  const envio = [
    ["Dirección", pedido.direccion],
    ["Ciudad", pedido.ciudad],
    ["Departamento", pedido.departamento],
    ["Código postal", pedido.codigo_postal],
  ].filter(([, v]) => v);

  return (
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-modal" style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="pa-modal-header">
          <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            Pedido
            <span style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", color: "#e8c547", padding: "2px 10px", borderRadius: 6, fontSize: 13 }}>
              #{pedido.id}
            </span>
            <EstadoPedidoBadge estado={pedido.estado} />
          </h3>
          <button className="pa-modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Cliente */}
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Cliente
            </div>
            <div style={{ background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {meta.map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4a4f5e", minWidth: 110 }}>{label}</span>
                  <span style={{ color: "#e8eaf0" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Envío */}
          {envio.length > 0 && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Dirección de envío
              </div>
              <div style={{ background: "#1a1e25", border: "1px solid rgba(91,156,246,0.15)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {envio.map(([label, val]) => (
                  <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4a4f5e", minWidth: 110 }}>{label}</span>
                    <span style={{ color: "#e8eaf0" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Productos ({items.length})
            </div>
            {items.length === 0 ? (
              <div style={{ color: "#4a4f5e", fontSize: 12, fontFamily: "'DM Mono', monospace", padding: "10px 0" }}>Sin items registrados.</div>
            ) : (
              <div style={{ background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Producto", "Cant."].map((h) => (
                        <th key={h} style={{ background: "#13161b", padding: "8px 12px", fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a4f5e", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id ?? i}>
                        <td style={{ padding: "9px 12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#e8eaf0" }}>
                          {item.producto_nombre || `Producto #${item.producto}`}
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#e8eaf0", textAlign: "center", fontFamily: "'DM Mono', monospace", width: 70 }}>
                          {item.cantidad}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4a4f5e", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 600, color: "#e8c547" }}>
              ${Number(pedido.total).toLocaleString("es-CO")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PEDIDO SECTION
   ═══════════════════════════════════════════════════════════ */
const PedidoSection = ({ section, toast }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [updatingEstado, setUpdatingEstado] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(section.endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (data.results ?? []));
    } catch { toast("Error al cargar Pedidos", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleEstado = async (id, nuevoEstado) => {
    setUpdatingEstado(id);
    try {
      const res = await apiFetch(
        `${section.endpoint}${id}/estado/`,
        { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) }
      );
      if (!res.ok) throw new Error();
      toast(`Estado actualizado a "${ESTADOS_PEDIDO.find((e) => e.value === nuevoEstado)?.label || nuevoEstado}".`, "success");
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, estado: nuevoEstado } : r));
      // Actualizar detalle si está abierto
      setDetalle((prev) => prev?.id === id ? { ...prev, estado: nuevoEstado } : prev);
    } catch { toast("No se pudo actualizar el estado.", "error"); }
    finally { setUpdatingEstado(null); }
  };

  const handleDelete = async (id) => {
    try {
      // La lista está en /lista/ pero el CRUD base es /api/pedidos/<id>/
      const deleteUrl = `${BASE}/pedidos/${id}/`;
      const res = await apiFetch(deleteUrl, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Pedido eliminado.", "success");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch { toast("No se pudo eliminar el pedido.", "error"); }
    setConfirmDelete(null);
  };

  const filtered = rows.filter((r) => {
    const q = busqueda.toLowerCase();
    const matchSearch = !busqueda || [
      r.id, r.usuario_nombre, r.usuario_primer_apellido,
      r.usuario_correo, r.usuario_identificacion, r.ciudad,
    ].some((v) => String(v ?? "").toLowerCase().includes(q));
    const matchEstado = !filtroEstado || r.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  // Conteo por estado para el resumen
  const conteoEstados = ESTADOS_PEDIDO.map(({ value, label }) => ({
    value, label, count: rows.filter((r) => r.estado === value).length,
  }));

  const formatFecha = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="pa-section">

      {/* ── Resumen de estados ── */}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {conteoEstados.map(({ value, label, count }) => {
            const meta = ESTADO_PEDIDO_META[value] || ESTADO_PEDIDO_META.pendiente;
            const active = filtroEstado === value;
            return (
              <button key={value} onClick={() => setFiltroEstado(active ? "" : value)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: active ? meta.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? meta.border : "rgba(255,255,255,0.08)"}`,
                  color: active ? meta.color : "#4a4f5e",
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  letterSpacing: "0.06em", transition: "all 0.15s",
                }}>
                <span style={{ fontSize: 13 }}>{meta.icon}</span>
                <span style={{ textTransform: "uppercase" }}>{label}</span>
                <span style={{
                  background: active ? meta.color : "rgba(255,255,255,0.08)",
                  color: active ? "#0d0f12" : "#4a4f5e",
                  borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 600,
                }}>{count}</span>
              </button>
            );
          })}
          {filtroEstado && (
            <button onClick={() => setFiltroEstado("")}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#4a4f5e", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
              ✕ limpiar filtro
            </button>
          )}
        </div>
      )}

      {/* ── Barra de búsqueda ── */}
      <div className="pa-section-bar">
        <input className="pa-search" placeholder="Buscar por nombre, correo, ID…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {!loading && (
        <p className="pa-count">
          {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
          {filtroEstado && <span style={{ color: "#4a4f5e", fontWeight: 400 }}> · filtrado por estado</span>}
        </p>
      )}

      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && (
        <div className="pa-state">
          <span className="pa-state-icon">📭</span>
          <span>{busqueda || filtroEstado ? "Sin resultados para ese filtro." : "Sin pedidos registrados."}</span>
        </div>
      )}

      {/* ── Tabla ── */}
      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Ciudad</th>
                <th style={{ width: 100 }}>Fecha</th>
                <th style={{ width: 90, textAlign: "right" }}>Total</th>
                <th style={{ width: 220 }}>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  {/* ID */}
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e8c547" }}>
                      #{row.id}
                    </span>
                  </td>

                  {/* Cliente */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13.5, color: "#e8eaf0" }}>
                        {`${row.usuario_nombre || ""} ${row.usuario_primer_apellido || ""}`.trim() || <span className="pa-empty">—</span>}
                      </span>
                      {row.usuario_identificacion && (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e" }}>
                          {row.usuario_identificacion}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Correo */}
                  <td>
                    <span style={{ fontSize: 12, color: "#8a8f9e" }}>
                      {row.usuario_correo || <span className="pa-empty">—</span>}
                    </span>
                  </td>

                  {/* Ciudad */}
                  <td>
                    <span style={{ fontSize: 12.5 }}>
                      {row.ciudad || <span className="pa-empty">—</span>}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: "#8a8f9e" }}>
                      {formatFecha(row.fecha)}
                    </span>
                  </td>

                  {/* Total */}
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#e8c547" }}>
                      ${Number(row.total).toLocaleString("es-CO")}
                    </span>
                  </td>

                  {/* Estado — badge + selector */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <EstadoPedidoBadge estado={row.estado} />
                      <select
                        value={row.estado}
                        disabled={updatingEstado === row.id}
                        onChange={(e) => handleEstado(row.id, e.target.value)}
                        style={{
                          background: "#1a1e25",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#8a8f9e", fontSize: 11, borderRadius: 4,
                          padding: "3px 6px", cursor: "pointer", outline: "none",
                          fontFamily: "'DM Mono', monospace",
                          opacity: updatingEstado === row.id ? 0.5 : 1,
                        }}>
                        {ESTADOS_PEDIDO.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="pa-td-actions" style={{ gap: 6 }}>
                    <button className="pa-action" title="Ver detalle"
                      style={{ background: "rgba(91,156,246,0.1)", border: "1px solid rgba(91,156,246,0.3)", color: "#5b9cf6", fontSize: 14 }}
                      onClick={() => setDetalle(row)}>
                      👁
                    </button>
                    {row.usuario_telefono && (
                      <button className="pa-action" title={`WhatsApp a ${row.usuario_nombre}`}
                        style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366", fontSize: 14 }}
                        onClick={() => {
                          const tel = `57${row.usuario_telefono.replace(/\D/g, "")}`;
                          const estadoLabel = ESTADOS_PEDIDO.find((e) => e.value === row.estado)?.label || row.estado;
                          const msg = encodeURIComponent(
                            `Hola ${row.usuario_nombre}, te contactamos de *Mestizo Mobiliario* para informarte que tu pedido *#${row.id}* se encuentra en estado *${estadoLabel}*. ¿Tienes alguna pregunta?`
                          );
                          window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
                        }}>
                        💬
                      </button>
                    )}
                    <button className="pa-action pa-action--del" title="Eliminar pedido"
                      onClick={() => setConfirmDelete(row.id)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && <PedidoDetalleModal pedido={detalle} onClose={() => setDetalle(null)} />}
      {confirmDelete !== null && (
        <Confirm onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   GALERÍA DE IMÁGENES GUARDADAS
   ═══════════════════════════════════════════════════════════ */
const ImageGallery = ({ imagenes, onDelete }) => {
  const visible = imagenes.filter((i) => !i.DELETE && i.url_existente);
  if (!visible.length) return (
    <div style={{ padding: "10px 12px", color: "#4a4f5e", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
      Sin imágenes guardadas aún.
    </div>
  );
  return (
    <div style={{ padding: "12px 12px 6px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {visible.map((img) => (
          <div key={img._uid} style={{ position: "relative", flexShrink: 0 }}>
            <a href={img.url_existente} target="_blank" rel="noreferrer"
              style={{ display: "block", borderRadius: 8, overflow: "hidden", border: "2px solid rgba(76,175,125,0.3)" }}>
              <img src={img.url_existente} alt={`orden ${img.orden}`}
                style={{ width: 88, height: 88, objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            </a>
            <span style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.75)", color: "#e8eaf0", fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "1px 5px", borderRadius: 4 }}>
              #{img.orden}
            </span>
            <button type="button" title="Eliminar imagen" onClick={() => onDelete(img._uid)}
              style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: "#e05454", border: "2px solid #13161b", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FILA IMAGEN NUEVA
   ═══════════════════════════════════════════════════════════ */
const NewImageRow = ({ img, onChange, onRemove }) => {
  const [preview, setPreview] = useState(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(img._uid, "imagen_file", file);
  };
  useEffect(() => { return () => { if (preview) URL.revokeObjectURL(preview); }; }, [preview]);
  return (
    <tr>
      <td style={{ ...DJ.inlineTd, width: 72 }}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(76,175,125,0.4)", display: "block" }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 6, background: "#1a1e25", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, opacity: 0.25 }}>🖼</span>
          </div>
        )}
      </td>
      <td style={DJ.inlineTd}>
        <input type="file" accept="image/*" onChange={handleFile} style={{ color: "#8a8f9e", fontSize: 11 }} />
        {img.imagen_file && <span style={{ color: "#4caf7d", fontSize: 11, display: "block", marginTop: 3 }}>✓ {img.imagen_file.name}</span>}
      </td>
      <td style={{ ...DJ.inlineTd, width: 90 }}>
        <input style={{ ...DJ.inlineInput, width: 60 }} type="number" value={img.orden}
          onChange={(e) => onChange(img._uid, "orden", e.target.value)} />
      </td>
      <td style={{ ...DJ.inlineTd, width: 60, textAlign: "center" }}>
        <button type="button" style={DJ.removeBtn} onClick={() => onRemove(img._uid)}>✕</button>
      </td>
    </tr>
  );
};

/* ═══════════════════════════════════════════════════════════
   FILA PLANO NUEVO
   ═══════════════════════════════════════════════════════════ */
const NewPlanoRow = ({ plano, onChange, onRemove }) => {
  const [preview, setPreview] = useState(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(plano._uid, "imagen_file", file);
  };
  useEffect(() => { return () => { if (preview) URL.revokeObjectURL(preview); }; }, [preview]);
  return (
    <tr>
      <td style={{ ...DJ.inlineTd, width: 72 }}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 64, height: 64, objectFit: "contain", background: "#fff", borderRadius: 6, border: "1px solid rgba(91,156,246,0.4)", display: "block" }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 6, background: "#1a1e25", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, opacity: 0.25 }}>📐</span>
          </div>
        )}
      </td>
      <td style={DJ.inlineTd}>
        <input type="file" accept="image/*" onChange={handleFile} style={{ color: "#8a8f9e", fontSize: 11 }} />
        {plano.imagen_file && <span style={{ color: "#4caf7d", fontSize: 11, display: "block", marginTop: 3 }}>✓ {plano.imagen_file.name}</span>}
      </td>
      <td style={DJ.inlineTd}>
        <input style={DJ.inlineInput} type="text" value={plano.descripcion} placeholder="Ej: Vista frontal"
          onChange={(e) => onChange(plano._uid, "descripcion", e.target.value)} />
      </td>
      <td style={{ ...DJ.inlineTd, width: 72 }}>
        <input style={{ ...DJ.inlineInput, width: 56 }} type="number" value={plano.orden}
          onChange={(e) => onChange(plano._uid, "orden", e.target.value)} />
      </td>
      <td style={{ ...DJ.inlineTd, width: 48, textAlign: "center" }}>
        <button type="button" style={DJ.removeBtn} onClick={() => onRemove(plano._uid)}>✕</button>
      </td>
    </tr>
  );
};

/* ═══════════════════════════════════════════════════════════
   LOGIN SCREEN
   ═══════════════════════════════════════════════════════════ */
const LoginScreen = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await tryLogin(correo, contrasena);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    if (!result.user.is_staff && !result.user.is_superuser) {
      clearAuthHeader();
      setError("Tu cuenta no tiene acceso al panel de administración.");
      return;
    }
    onLogin(result.user);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0f12", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <form onSubmit={handleSubmit} style={{ background: "#13161b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 380, margin: "0 16px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8c547", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e8c547", boxShadow: "0 0 8px #e8c547", display: "inline-block" }} />
            Panel de administración
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>Iniciar sesión</h2>
        </div>
        {error && <div style={{ background: "rgba(224,84,84,0.1)", border: "1px solid rgba(224,84,84,0.3)", color: "#e05454", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>{error}</div>}
        {[
          { label: "Correo", type: "email", val: correo, set: setCorreo, placeholder: "admin@ejemplo.com" },
          { label: "Contraseña", type: "password", val: contrasena, set: setContrasena, placeholder: "••••••••" },
        ].map(({ label, type, val, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4a4f5e", marginBottom: 6 }}>{label}</label>
            <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} required
              style={{ width: "100%", padding: "11px 14px", background: "#1a1e25", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "#e8eaf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(232,197,71,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
            />
          </div>
        ))}
        <button type="submit" disabled={loading}
          style={{ width: "100%", marginTop: 8, padding: "12px 0", background: loading ? "#a08830" : "#e8c547", color: "#0d0f12", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Conectando…" : "Entrar al panel"}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
   ═══════════════════════════════════════════════════════════ */
const ProductForm = ({ item, onBack, onSaved, toast }) => {
  const isEdit = !!item;

  const [form, setForm] = useState({
    nombre: item?.nombre || "",
    descripcion: item?.descripcion || "",
    precio: item?.precio || "",
    categoria: item?.categoria || "",
    stock: item?.stock ?? 0,
    alto: item?.alto || "",
    ancho: item?.ancho || "",
    profundidad: item?.profundidad || "",
    peso: item?.peso || "",
    material: item?.material || "",
    modelo_glb: null,
    modelo_usdz: null,
  });

  const [glbExistente, setGlbExistente] = useState(item?.modelo_glb || null);
  const [usdzExistente, setUsdzExistente] = useState(item?.modelo_usdz || null);
  const [glbNuevo, setGlbNuevo] = useState(null);
  const [usdzNuevo, setUsdzNuevo] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [saving, setSaving] = useState(false);

  const [colores, setColores] = useState(() => {
    if (item?.colores?.length) {
      return item.colores.map((c) => ({
        _uid: Math.random(), id: c.id, nombre: c.nombre,
        codigo_hex: c.codigo_hex || "", imagen_file: null,
        imagen_url_existente: c.imagen_url || null, DELETE: false,
      }));
    }
    return [emptyColor()];
  });

  const [imagenes, setImagenes] = useState(() => {
    if (!item?.colores?.length) return [];
    const resultado = [];
    item.colores.forEach((c) => {
      (c.imagenes || []).forEach((img) => {
        if (!img.imagen) return;
        resultado.push({
          _uid: Math.random(), _colorId: c.id, _colorUid: null,
          id: img.id, imagen_file: null, previewUrl: null,
          url_existente: img.imagen, orden: img.orden, DELETE: false,
        });
      });
    });
    return resultado;
  });

  const [planos, setPlanos] = useState(() => {
    if (!item?.imagenes_dimensiones?.length) return [];
    return item.imagenes_dimensiones.map((p) => ({
      _uid: Math.random(), id: p.id, imagen_file: null,
      url_existente: p.imagen || null, descripcion: p.descripcion || "",
      orden: p.orden || 1, DELETE: false,
    }));
  });

  const setPlanoField = (uid, k, v) => setPlanos((p) => p.map((pl) => pl._uid === uid ? { ...pl, [k]: v } : pl));
  const removePlano = (uid) => setPlanos((p) => p.map((pl) => pl._uid === uid ? { ...pl, DELETE: true } : pl));

  useEffect(() => {
    if (!isEdit) return;
    setImagenes((prev) => prev.map((img) => {
      if (img._colorUid) return img;
      const color = colores.find((c) => c.id === img._colorId);
      return color ? { ...img, _colorUid: color._uid } : img;
    }));
  }, []); // eslint-disable-line

  useEffect(() => {
    apiFetch(`${BASE}/categorias/`)
      .then((r) => r.json())
      .then((d) => setCategorias(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => { });
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setColorField = (uid, k, v) => setColores((p) => p.map((c) => c._uid === uid ? { ...c, [k]: v } : c));
  const removeColor = (uid) => setColores((p) => p.map((c) => c._uid === uid ? { ...c, DELETE: true } : c));
  const setImagenField = (uid, k, v) => setImagenes((p) => p.map((i) => i._uid === uid ? { ...i, [k]: v } : i));
  const removeImagen = (uid) => setImagenes((p) => p.map((i) => i._uid === uid ? { ...i, DELETE: true } : i));

  const handleGlbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setField("modelo_glb", file); setGlbNuevo(file.name); setGlbExistente(null);
  };
  const handleUsdzChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setField("modelo_usdz", file); setUsdzNuevo(file.name); setUsdzExistente(null);
  };

  const safeJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { _raw: text, status: res.status }; }
  };

  const handleSubmit = async (mode) => {
    if (!form.nombre || !form.precio) { toast("Nombre y precio son requeridos.", "error"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("descripcion", form.descripcion);
      fd.append("precio", form.precio);
      fd.append("stock", form.stock);
      if (form.categoria) fd.append("categoria", form.categoria);
      if (form.modelo_glb instanceof File) fd.append("modelo_glb", form.modelo_glb);
      if (form.modelo_usdz instanceof File) fd.append("modelo_usdz", form.modelo_usdz);
      if (form.alto !== "") fd.append("alto", form.alto);
      if (form.ancho !== "") fd.append("ancho", form.ancho);
      if (form.profundidad !== "") fd.append("profundidad", form.profundidad);
      if (form.peso !== "") fd.append("peso", form.peso);
      if (form.material !== "") fd.append("material", form.material);

      const productoUrl = isEdit ? `${BASE}/productos/${item.id}/` : `${BASE}/productos/`;
      const productoRes = await apiFetch(productoUrl, { method: isEdit ? "PATCH" : "POST", body: fd });
      const productoData = await safeJson(productoRes);
      if (!productoRes.ok) {
        toast(productoData._raw ? `Error ${productoData.status}` : Object.values(productoData).flat().join(" · "), "error");
        setSaving(false); return;
      }
      const productoId = productoData.id;

      for (const img of imagenes.filter((i) => i.DELETE && i.id))
        await apiFetch(`${BASE}/imagenproducto/${img.id}/`, { method: "DELETE" }).catch(() => { });
      for (const pl of planos.filter((p) => p.DELETE && p.id))
        await apiFetch(`${BASE}/imagendimension/${pl.id}/`, { method: "DELETE" }).catch(() => { });

      for (const color of colores) {
        if (color.DELETE && color.id) {
          await apiFetch(`${BASE}/colores/${color.id}/`, { method: "DELETE" }).catch(() => { });
          continue;
        }
        if (color.DELETE || !color.nombre) continue;
        const cfd = new FormData();
        cfd.append("producto", productoId);
        cfd.append("nombre", color.nombre);
        if (color.codigo_hex) cfd.append("codigo_hex", color.codigo_hex);
        if (color.imagen_file) cfd.append("imagen_file", color.imagen_file);
        const colorUrl = color.id ? `${BASE}/colores/${color.id}/` : `${BASE}/colores/`;
        const colorRes = await apiFetch(colorUrl, { method: color.id ? "PATCH" : "POST", body: cfd });
        const colorData = await safeJson(colorRes);
        if (!colorRes.ok) { console.error("Error color:", colorData); continue; }
        const colorId = colorData.id;
        const nuevas = imagenes.filter((i) =>
          !i.DELETE && !i.id && i.imagen_file &&
          (i._colorUid === color._uid || i._colorId === color.id)
        );
        for (const img of nuevas) {
          const ifd = new FormData();
          ifd.append("color", colorId);
          ifd.append("imagen_upload", img.imagen_file);
          ifd.append("orden", img.orden);
          const imgRes = await apiFetch(`${BASE}/imagenproducto/`, { method: "POST", body: ifd });
          if (!imgRes.ok) toast("Error al subir una imagen.", "error");
        }
      }

      for (const pl of planos.filter((p) => !p.DELETE && !p.id && p.imagen_file)) {
        const pfd = new FormData();
        pfd.append("producto", productoId);
        pfd.append("imagen_upload", pl.imagen_file);
        pfd.append("descripcion", pl.descripcion || "");
        pfd.append("orden", pl.orden);
        const plRes = await apiFetch(`${BASE}/imagendimension/`, { method: "POST", body: pfd });
        if (!plRes.ok) toast("Error al subir un plano.", "error");
      }

      toast(isEdit ? "Producto actualizado." : "Producto creado.", "success");
      onSaved();
      if (mode === "save") { onBack(); }
      else if (mode === "add") {
        setForm({ nombre: "", descripcion: "", precio: "", categoria: "", stock: 0, alto: "", ancho: "", profundidad: "", peso: "", material: "", modelo_glb: null, modelo_usdz: null });
        setGlbExistente(null); setUsdzExistente(null); setGlbNuevo(null); setUsdzNuevo(null);
        setColores([emptyColor()]); setImagenes([]); setPlanos([]);
      }
    } catch (err) { toast("Error inesperado.", "error"); console.error(err); }
    finally { setSaving(false); }
  };

  const activeColores = colores.filter((c) => !c.DELETE);
  const activePlanosGuardados = planos.filter((p) => !p.DELETE && p.id && p.url_existente);
  const activePlanosNuevos = planos.filter((p) => !p.DELETE && !p.id);

  return (
    <div style={DJ.page}>
      <div style={{ marginBottom: 16 }}>
        <button style={DJ.btnBack} onClick={onBack}>← Volver a Productos</button>
      </div>
      <h2 style={{ color: "#e8eaf0", fontSize: 17, fontWeight: 600, marginBottom: 24, fontFamily: "'DM Mono', monospace" }}>
        {isEdit ? `Editar: ${item.nombre}` : "Añadir producto"}
      </h2>

      {[
        { label: "Nombre *", content: <input style={DJ.input} type="text" value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} /> },
        { label: "Descripción", content: <textarea style={DJ.textarea} value={form.descripcion} onChange={(e) => setField("descripcion", e.target.value)} /> },
        { label: "Precio *", content: <input style={{ ...DJ.input, width: 150 }} type="number" step="0.01" value={form.precio} onChange={(e) => setField("precio", e.target.value)} /> },
        {
          label: "Categoría", content: (
            <select style={DJ.select} value={form.categoria} onChange={(e) => setField("categoria", e.target.value)}>
              <option value="">----------</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )
        },
        { label: "Stock", content: <input style={{ ...DJ.input, width: 100 }} type="number" value={form.stock} onChange={(e) => setField("stock", e.target.value)} /> },
      ].map(({ label, content }) => (
        <div key={label} style={DJ.fieldRow}>
          <div style={DJ.fieldLabel}>{label}</div>
          <div style={DJ.fieldInput}>{content}</div>
        </div>
      ))}

      <div style={DJ.inlineHeaderGreen}>Modelos 3D / Realidad aumentada</div>
      <div style={{ border: "1px solid rgba(76,175,125,0.15)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Modelo GLB (Android / Web AR)</div>
            <Modelo3DStatus url={glbExistente} label="GLB" onClear={() => { setGlbExistente(null); setField("modelo_glb", null); }} />
            {!glbExistente && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1e25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a8f9e" }}>
                  <span>📁</span><span>Seleccionar .glb</span>
                  <input type="file" accept=".glb" style={{ display: "none" }} onChange={handleGlbChange} />
                </label>
                {glbNuevo && <span style={{ color: "#4caf7d", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>✓ {glbNuevo}</span>}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4f5e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Modelo USDZ (iOS AR)</div>
            <Modelo3DStatus url={usdzExistente} label="USDZ" onClear={() => { setUsdzExistente(null); setField("modelo_usdz", null); }} />
            {!usdzExistente && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1e25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a8f9e" }}>
                  <span>📁</span><span>Seleccionar .usdz</span>
                  <input type="file" accept=".usdz" style={{ display: "none" }} onChange={handleUsdzChange} />
                </label>
                {usdzNuevo && <span style={{ color: "#4caf7d", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>✓ {usdzNuevo}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={DJ.inlineHeader}>Dimensiones del producto</div>
      <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
        <table style={DJ.inlineTable}>
          <thead><tr>
            <th style={DJ.inlineTh}>Alto (cm)</th>
            <th style={DJ.inlineTh}>Ancho (cm)</th>
            <th style={DJ.inlineTh}>Profundidad (cm)</th>
            <th style={DJ.inlineTh}>Peso (kg)</th>
            <th style={DJ.inlineTh}>Material</th>
          </tr></thead>
          <tbody><tr>
            <td style={DJ.inlineTd}><input style={{ ...DJ.inlineInput, width: 80 }} type="number" step="0.1" value={form.alto} placeholder="—" onChange={(e) => setField("alto", e.target.value)} /></td>
            <td style={DJ.inlineTd}><input style={{ ...DJ.inlineInput, width: 80 }} type="number" step="0.1" value={form.ancho} placeholder="—" onChange={(e) => setField("ancho", e.target.value)} /></td>
            <td style={DJ.inlineTd}><input style={{ ...DJ.inlineInput, width: 80 }} type="number" step="0.1" value={form.profundidad} placeholder="—" onChange={(e) => setField("profundidad", e.target.value)} /></td>
            <td style={DJ.inlineTd}><input style={{ ...DJ.inlineInput, width: 80 }} type="number" step="0.1" value={form.peso} placeholder="—" onChange={(e) => setField("peso", e.target.value)} /></td>
            <td style={DJ.inlineTd}><input style={DJ.inlineInput} type="text" value={form.material} placeholder="Ej: Madera de teca" onChange={(e) => setField("material", e.target.value)} /></td>
          </tr></tbody>
        </table>
      </div>

      <div style={DJ.inlineHeaderBlue}>Planos técnicos / imágenes de dimensiones</div>
      <div style={{ border: "1px solid rgba(91,156,246,0.15)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
        {activePlanosGuardados.length > 0 && (
          <>
            <div style={{ padding: "8px 12px 4px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4caf7d", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Guardados — {activePlanosGuardados.length} plano{activePlanosGuardados.length !== 1 ? "s" : ""}
            </div>
            <div style={{ padding: "8px 12px 12px", display: "flex", flexWrap: "wrap", gap: 12 }}>
              {activePlanosGuardados.map((pl) => (
                <div key={pl._uid} style={{ position: "relative", flexShrink: 0 }}>
                  <a href={pl.url_existente} target="_blank" rel="noreferrer"
                    style={{ display: "block", borderRadius: 8, overflow: "hidden", border: "2px solid rgba(91,156,246,0.3)", background: "#fff" }}>
                    <img src={pl.url_existente} alt={pl.descripcion || `plano ${pl.orden}`}
                      style={{ width: 100, height: 100, objectFit: "contain", display: "block", padding: 4 }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  </a>
                  {pl.descripcion && (
                    <span style={{ display: "block", textAlign: "center", fontSize: 10, color: "#8a8f9e", fontFamily: "'DM Mono', monospace", marginTop: 4, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pl.descripcion}
                    </span>
                  )}
                  <button type="button" onClick={() => removePlano(pl._uid)}
                    style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: "#e05454", border: "2px solid #13161b", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {activePlanosNuevos.length > 0 && (
          <>
            <div style={{ padding: "8px 12px 2px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5b9cf6", letterSpacing: "0.06em", textTransform: "uppercase" }}>Nuevos a subir</div>
            <table style={DJ.inlineTable}>
              <thead><tr>
                <th style={{ ...DJ.inlineTh, width: 72 }}>Preview</th>
                <th style={DJ.inlineTh}>Archivo</th>
                <th style={DJ.inlineTh}>Descripción</th>
                <th style={{ ...DJ.inlineTh, width: 72 }}>Orden</th>
                <th style={{ ...DJ.inlineTh, width: 48 }}>Del.</th>
              </tr></thead>
              <tbody>
                {activePlanosNuevos.map((pl) => (
                  <NewPlanoRow key={pl._uid} plano={pl} onChange={setPlanoField} onRemove={removePlano} />
                ))}
              </tbody>
            </table>
          </>
        )}
        {activePlanosGuardados.length === 0 && activePlanosNuevos.length === 0 && (
          <div style={{ padding: "12px", color: "#4a4f5e", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>Sin planos técnicos aún.</div>
        )}
        <div style={{ padding: "8px 12px" }}>
          <span style={DJ.addLink} onClick={() => setPlanos((p) => [...p, emptyPlano()])}>+ Agregar plano técnico</span>
        </div>
      </div>

      <div style={DJ.inlineHeader}>Colores del producto</div>
      {activeColores.map((color) => {
        const imagenesGuardadas = imagenes.filter((i) => !i.DELETE && i.url_existente && (i._colorId === color.id || i._colorUid === color._uid));
        const imagenesNuevas = imagenes.filter((i) => !i.DELETE && !i.url_existente && (i._colorUid === color._uid || i._colorId === color.id));
        const total = imagenesGuardadas.length + imagenesNuevas.length;
        return (
          <div key={color._uid} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
            <table style={DJ.inlineTable}>
              <thead><tr>
                <th style={{ ...DJ.inlineTh, width: 64 }}>Actual</th>
                <th style={DJ.inlineTh}>Nombre</th>
                <th style={DJ.inlineTh}>Hex</th>
                <th style={DJ.inlineTh}>Nueva imagen color</th>
                <th style={{ ...DJ.inlineTh, width: 60 }}>Del.</th>
              </tr></thead>
              <tbody><tr>
                <td style={{ ...DJ.inlineTd, width: 64 }}><Thumb src={color.imagen_url_existente} size={48} /></td>
                <td style={DJ.inlineTd}><input style={DJ.inlineInput} type="text" value={color.nombre} onChange={(e) => setColorField(color._uid, "nombre", e.target.value)} /></td>
                <td style={DJ.inlineTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {color.codigo_hex && <span style={{ width: 14, height: 14, borderRadius: 3, background: color.codigo_hex, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />}
                    <input style={{ ...DJ.inlineInput, width: 90 }} type="text" value={color.codigo_hex} onChange={(e) => setColorField(color._uid, "codigo_hex", e.target.value)} />
                  </div>
                </td>
                <td style={DJ.inlineTd}>
                  <input type="file" accept="image/*" onChange={(e) => setColorField(color._uid, "imagen_file", e.target.files[0])} style={{ color: "#8a8f9e", fontSize: 11 }} />
                  {color.imagen_file && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <img src={URL.createObjectURL(color.imagen_file)} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} />
                      <span style={{ color: "#4caf7d", fontSize: 11 }}>✓ {color.imagen_file.name}</span>
                    </div>
                  )}
                </td>
                <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                  <button type="button" style={DJ.removeBtn} onClick={() => removeColor(color._uid)}>✕</button>
                </td>
              </tr></tbody>
            </table>
            <div style={{ background: "rgba(76,175,125,0.08)", borderLeft: "3px solid #4caf7d", padding: "8px 14px", fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4caf7d", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span>Imágenes — {color.nombre || "sin nombre"}</span>
              <span style={{ background: total > 0 ? "rgba(76,175,125,0.2)" : "rgba(74,79,94,0.3)", border: `1px solid ${total > 0 ? "rgba(76,175,125,0.4)" : "rgba(74,79,94,0.3)"}`, color: total > 0 ? "#4caf7d" : "#4a4f5e", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>
                {total} imagen{total !== 1 ? "es" : ""}
              </span>
            </div>
            <ImageGallery imagenes={imagenesGuardadas} onDelete={removeImagen} />
            {imagenesNuevas.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 2px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5b9cf6", letterSpacing: "0.06em", textTransform: "uppercase" }}>Nuevas a subir</div>
                <table style={DJ.inlineTable}>
                  <thead><tr>
                    <th style={{ ...DJ.inlineTh, width: 72 }}>Preview</th>
                    <th style={DJ.inlineTh}>Archivo</th>
                    <th style={{ ...DJ.inlineTh, width: 90 }}>Orden</th>
                    <th style={{ ...DJ.inlineTh, width: 60 }}>Del.</th>
                  </tr></thead>
                  <tbody>
                    {imagenesNuevas.map((img) => (
                      <NewImageRow key={img._uid} img={img} onChange={setImagenField} onRemove={removeImagen} />
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div style={{ padding: "8px 12px" }}>
              <span style={DJ.addLink} onClick={() => setImagenes((p) => [...p, emptyImagen(color._uid, color.id)])}>+ Agregar imagen</span>
            </div>
          </div>
        );
      })}

      <span style={{ ...DJ.addLink, display: "inline-block", marginTop: 6 }} onClick={() => setColores((p) => [...p, emptyColor()])}>
        + Agregar color
      </span>

      <div style={DJ.saveBar}>
        <button type="button" style={DJ.btnSave} disabled={saving} onClick={() => handleSubmit("save")}>{saving ? "Guardando…" : "Guardar"}</button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("add")}>Guardar y añadir otro</button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("edit")}>Guardar y continuar</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MODAL GENÉRICO
   ═══════════════════════════════════════════════════════════ */
const Modal = ({ section, item, onClose, onSaved, toast }) => {
  const isEdit = !!item;
  const empty = Object.fromEntries(section.fields.map((f) => [f.name, ""]));
  const [form, setForm] = useState(isEdit ? { ...item } : empty);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFile = (e) => setFiles((p) => ({ ...p, [e.target.name]: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const pk = getItemPk(section, item);
      const url = isEdit ? `${section.endpoint}${pk}/` : section.endpoint;
      let body, extraHeaders = {};
      if (section.isFileUpload) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) fd.append(k, v); });
        Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k === "imagen" ? "imagen_file" : k, v); });
        body = fd;
      } else {
        const payload = { ...form };
        if (!payload.contrasena) delete payload.contrasena;
        body = JSON.stringify(payload);
        extraHeaders = { "Content-Type": "application/json" };
      }
      const res = await apiFetch(url, { method: isEdit ? "PATCH" : "POST", headers: extraHeaders, body });
      const data = await res.json();
      if (!res.ok) {
        toast(typeof data === "object" ? Object.values(data).flat().join(" · ") : "Error al guardar.", "error");
        return;
      }
      toast(isEdit ? "Registro actualizado." : "Registro creado.", "success");
      onSaved();
    } catch { toast("No se pudo conectar.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pa-modal-header">
          <h3>{isEdit ? "Editar" : "Añadir"} {section.label}</h3>
          <button className="pa-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="pa-modal-form" onSubmit={handleSubmit}>
          {section.fields.map((f) => {
            if (isEdit && f.readOnlyOnEdit) return (
              <label key={f.name} className="pa-field">
                <span>{f.label}</span>
                <input name={f.name} type={f.type} value={form[f.name] || ""} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </label>
            );
            return (
              <label key={f.name} className="pa-field">
                <span>{f.label}{f.required && !isEdit ? " *" : f.required && isEdit && !f.optionalOnEdit ? " *" : ""}</span>
                {f.type === "textarea" ? (
                  <textarea name={f.name} value={form[f.name] || ""} onChange={handleChange} required={!!f.required && !(isEdit && f.optionalOnEdit)} />
                ) : f.type === "file" ? (
                  <div>
                    {item?.[f.imgUrlField || f.name] && (
                      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                        <Thumb src={buildCloudinaryUrl(item[f.imgUrlField || f.name])} size={64} radius={8} />
                        <span style={{ fontSize: 11, color: "#4a4f5e", fontFamily: "'DM Mono', monospace" }}>Imagen actual</span>
                      </div>
                    )}
                    <input name={f.name} type="file" accept="image/*" onChange={handleFile} style={{ color: "#8a8f9e", fontSize: 13 }} />
                    {files[f.name] && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <Thumb src={URL.createObjectURL(files[f.name])} size={56} radius={8} />
                        <span style={{ fontSize: 11, color: "#4caf7d", fontFamily: "'DM Mono', monospace" }}>✓ {files[f.name].name}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    name={f.name} type={f.type} value={form[f.name] || ""}
                    onChange={handleChange}
                    required={!!f.required && !(isEdit && f.optionalOnEdit)}
                    placeholder={isEdit && f.optionalOnEdit ? "Dejar en blanco para no cambiar" : ""}
                  />
                )}
              </label>
            );
          })}
          <div className="pa-modal-actions">
            <button type="button" className="pa-btn pa-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="pa-btn pa-btn--primary" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Confirm ────────────────────────────────────────────── */
const Confirm = ({ onConfirm, onCancel }) => (
  <div className="pa-overlay" onClick={onCancel}>
    <div className="pa-confirm" onClick={(e) => e.stopPropagation()}>
      <div className="pa-confirm-icon">⚠</div>
      <p>¿Eliminar este registro?<br /><small>Esta acción no se puede deshacer.</small></p>
      <div className="pa-modal-actions">
        <button className="pa-btn pa-btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="pa-btn pa-btn--danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   CITA SECTION
   ═══════════════════════════════════════════════════════════ */
const CitaSection = ({ section, toast }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updatingEstado, setUpdatingEstado] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(section.endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (data.results ?? []));
    } catch { toast("Error al cargar Citas", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${section.endpoint}${id}/`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Cita eliminada.", "success"); load();
    } catch { toast("No se pudo eliminar.", "error"); }
    setConfirmDelete(null);
  };

  const handleEstado = async (id, nuevoEstado) => {
    setUpdatingEstado(id);
    try {
      const res = await apiFetch(`${section.endpoint}${id}/`, { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) });
      if (!res.ok) throw new Error();
      toast(`Estado actualizado a "${nuevoEstado}".`, "success");
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, estado: nuevoEstado } : r));
    } catch { toast("No se pudo actualizar el estado.", "error"); }
    finally { setUpdatingEstado(null); }
  };

  const abrirWhatsApp = (row) => {
    const tel = `57${row.telefono?.replace(/\D/g, "")}`;
    const fecha = row.fecha ? new Date(row.fecha + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
    const hora = row.hora ? row.hora.slice(0, 5) : "";
    const msg = encodeURIComponent(`Hola ${row.nombre}, te contactamos de *Mestizo Mobiliario* para confirmar tu cita programada para el *${fecha}* a las *${hora}*. ¿Puedes confirmarnos tu asistencia?`);
    window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
  };

  const filtered = rows.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return ["identificacion", "nombre", "primerApellido", "correo", "fecha"].some((col) => String(r[col] ?? "").toLowerCase().includes(q));
  });

  return (
    <div className="pa-section">
      <div className="pa-section-bar">
        <input className="pa-search" placeholder="Buscar citas…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>
      {!loading && <p className="pa-count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>}
      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && <div className="pa-state"><span className="pa-state-icon">📭</span><span>Sin citas</span></div>}
      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead><tr>
              <th>Identificación</th><th>Nombre</th><th>Apellido</th>
              <th>Correo</th><th>Teléfono</th><th>Fecha</th><th>Hora</th>
              <th>Motivo</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((row) => {
                const [y, m, d] = String(row.fecha || "").split("-");
                return (
                  <tr key={row.id}>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.identificacion || <span className="pa-empty">—</span>}</span></td>
                    <td>{row.nombre || <span className="pa-empty">—</span>}</td>
                    <td>{row.primerApellido || <span className="pa-empty">—</span>}</td>
                    <td><span style={{ fontSize: 12 }}>{row.correo || <span className="pa-empty">—</span>}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.telefono || <span className="pa-empty">—</span>}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.fecha ? `${d}/${m}/${y}` : "—"}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.hora ? String(row.hora).slice(0, 5) : "—"}</span></td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#c8cacc", maxWidth: 200, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.descripcion || ""}>
                        {row.descripcion || <span className="pa-empty">—</span>}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <EstadoBadge estado={row.estado || "pendiente"} />
                        <select value={row.estado || "pendiente"} disabled={updatingEstado === row.id}
                          onChange={(e) => handleEstado(row.id, e.target.value)}
                          style={{ background: "#1a1e25", border: "1px solid rgba(255,255,255,0.1)", color: "#8a8f9e", fontSize: 11, borderRadius: 4, padding: "3px 6px", cursor: "pointer", outline: "none", fontFamily: "'DM Mono', monospace" }}>
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                    </td>
                    <td className="pa-td-actions" style={{ gap: 6 }}>
                      {row.telefono && (
                        <button className="pa-action" title={`WhatsApp a ${row.nombre}`} onClick={() => abrirWhatsApp(row)}
                          style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366", fontSize: 15 }}>💬</button>
                      )}
                      <button className="pa-action pa-action--del" title="Eliminar" onClick={() => setConfirmDelete(row.id)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {confirmDelete !== null && <Confirm onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCT SECTION
   ═══════════════════════════════════════════════════════════ */
const ProductSection = ({ section, toast }) => {
  const [view, setView] = useState("list");
  const [editItem, setEditItem] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(section.endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (data.results ?? []));
    } catch { toast("Error al cargar Productos", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${section.endpoint}${id}/`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Registro eliminado.", "success"); load();
    } catch { toast("No se pudo eliminar.", "error"); }
    setConfirmDelete(null);
  };

  const filtered = rows.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return section.columns.some((col) => String(r[col] ?? "").toLowerCase().includes(q));
  });

  if (view === "form") {
    return <ProductForm item={editItem} onBack={() => { setView("list"); setEditItem(null); }} onSaved={() => load()} toast={toast} />;
  }

  return (
    <div className="pa-section">
      <div className="pa-section-bar">
        <input className="pa-search" placeholder="Buscar en Productos…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <button className="pa-btn pa-btn--primary" onClick={() => { setEditItem(null); setView("form"); }}>+ Añadir Producto</button>
      </div>
      {!loading && <p className="pa-count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>}
      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && <div className="pa-state"><span className="pa-state-icon">📭</span><span>Sin registros</span></div>}
      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead><tr>
              <th style={{ width: 64 }}>Imagen</th>
              {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((row, i) => {
                const firstImg = row.colores?.[0]?.imagenes?.find((img) => img.imagen)?.imagen ?? null;
                return (
                  <tr key={row.id ?? i}>
                    <td style={{ padding: "8px 12px" }}><Thumb src={firstImg} size={44} radius={6} /></td>
                    {section.columns.map((col) => <td key={col}>{row[col] ?? <span className="pa-empty">—</span>}</td>)}
                    <td className="pa-td-actions">
                      <button className="pa-action pa-action--edit" title="Editar" onClick={() => { setEditItem(row); setView("form"); }}>✏</button>
                      <button className="pa-action pa-action--del" title="Eliminar" onClick={() => setConfirmDelete(row.id)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {confirmDelete !== null && <Confirm onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECTION TABLE GENÉRICA
   ═══════════════════════════════════════════════════════════ */
const SectionTable = ({ section, toast }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(section.endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (data.results ?? []));
    } catch { toast("Error al cargar " + section.label, "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [section.key]); // eslint-disable-line

  const handleDelete = async (item) => {
    const pk = getItemPk(section, item);
    try {
      const res = await apiFetch(`${section.endpoint}${pk}/`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Registro eliminado.", "success"); load();
    } catch { toast("No se pudo eliminar.", "error"); }
    setConfirmDelete(null);
  };

  const filtered = rows.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return section.columns.some((col) => String(r[col] ?? "").toLowerCase().includes(q));
  });

  const formatCell = (row, col) => {
    const val = row[col];
    if (val === null || val === undefined || val === "") return <span className="pa-empty">—</span>;
    if (col === "fecha") { const [y, m, d] = String(val).split("-"); return `${d}/${m}/${y}`; }
    if (col === "hora") return String(val).slice(0, 5);
    if (col === "imagen") return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Thumb src={buildCloudinaryUrl(val)} size={44} radius={6} />
        <a href={buildCloudinaryUrl(val)} target="_blank" rel="noreferrer" style={{ color: "#5b9cf6", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>Ver ↗</a>
      </div>
    );
    if (col === "codigo_hex") return (
      <span className="pa-color-cell">
        <span className="pa-color-swatch" style={{ background: val }} />{val}
      </span>
    );
    return String(val);
  };

  return (
    <div className="pa-section">
      <div className="pa-section-bar">
        <input className="pa-search" placeholder={`Buscar en ${section.label}…`} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <button className="pa-btn pa-btn--primary" onClick={() => setModal("create")}>+ Añadir {section.label}</button>
      </div>
      {!loading && <p className="pa-count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>}
      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && <div className="pa-state"><span className="pa-state-icon">📭</span><span>Sin registros</span></div>}
      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead><tr>
              {section.key === "colores" && <th style={{ width: 64 }}>Vista previa</th>}
              {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={getItemPk(section, row) ?? i}>
                  {section.key === "colores" && (
                    <td style={{ padding: "8px 12px" }}><Thumb src={buildCloudinaryUrl(row.imagen_url)} size={44} radius={6} /></td>
                  )}
                  {section.columns.map((col) => <td key={col}>{formatCell(row, col)}</td>)}
                  <td className="pa-td-actions">
                    <button className="pa-action pa-action--edit" onClick={() => setModal(row)} title="Editar">✏</button>
                    <button className="pa-action pa-action--del" onClick={() => setConfirmDelete(row)} title="Eliminar">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <Modal section={section} item={modal === "create" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} toast={toast} />}
      {confirmDelete !== null && <Confirm onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECCIONES
   ═══════════════════════════════════════════════════════════ */
const SECTIONS = [
  {
    // ── NUEVO: Pedidos ──────────────────────────────────────
    key: "pedidos", label: "Pedidos",
    endpoint: `${BASE}/pedidos/lista/`,
    estadoEndpoint: `${BASE}/pedidos/`,   // base para PATCH /<id>/estado/
    isPedido: true, fields: [], columns: [], columnLabels: [],
  },
  { key: "citas", label: "Citas", endpoint: `${BASE}/citas/lista/`, isCita: true, fields: [], columns: [], columnLabels: [] },
  {
    key: "categorias", label: "Categorías", endpoint: `${BASE}/categorias/`,
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
    columns: ["nombre", "descripcion"], columnLabels: ["Nombre", "Descripción"],
  },
  {
    key: "colores", label: "Color productos", endpoint: `${BASE}/colores/`, isFileUpload: true,
    fields: [
      { name: "nombre", label: "Nombre del color", type: "text", required: true },
      { name: "codigo_hex", label: "Código hex", type: "text" },
      { name: "imagen", label: "Imagen del color", type: "file", imgUrlField: "imagen_url" },
    ],
    columns: ["nombre", "codigo_hex"], columnLabels: ["Nombre", "Código hex"],
  },
  {
    key: "productos", label: "Productos", endpoint: `${BASE}/productos/`, isProducto: true, fields: [],
    columns: ["nombre", "precio", "categoria_nombre", "stock"],
    columnLabels: ["Nombre", "Precio", "Categoría", "Stock"],
  },
  {
    key: "imagenes", label: "Imagen productos", endpoint: `${BASE}/imagenproducto/`,
    fields: [
      { name: "color", label: "Color (ID)", type: "number", required: true },
      { name: "orden", label: "Orden", type: "number" },
    ],
    columns: ["id", "color", "imagen", "orden"], columnLabels: ["ID", "Color", "Imagen", "Orden"],
  },
  {
    key: "dimensiones", label: "Planos técnicos", endpoint: `${BASE}/imagendimension/`, isFileUpload: true,
    fields: [
      { name: "producto", label: "Producto (ID)", type: "number", required: true },
      { name: "descripcion", label: "Descripción", type: "text" },
      { name: "orden", label: "Orden", type: "number" },
      { name: "imagen", label: "Imagen del plano", type: "file", imgUrlField: "imagen" },
    ],
    columns: ["id", "producto", "descripcion", "orden", "imagen"],
    columnLabels: ["ID", "Producto", "Descripción", "Orden", "Imagen"],
  },
  {
    key: "usuarios", label: "Usuarios", endpoint: `${BASE}/usuarios/`,
    fields: [
      { name: "identificacion", label: "Identificación", type: "text", required: true, readOnlyOnEdit: true },
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "primerApellido", label: "Primer apellido", type: "text", required: true },
      { name: "segundoApellido", label: "Segundo apellido", type: "text" },
      { name: "correo", label: "Correo", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text" },
      { name: "contrasena", label: "Contraseña", type: "password", required: true, optionalOnEdit: true },
    ],
    columns: ["identificacion", "nombre", "primerApellido", "correo", "telefono"],
    columnLabels: ["Identificación", "Nombre", "Apellido", "Correo", "Teléfono"],
  },
];

/* ═══════════════════════════════════════════════════════════
   PANEL ADMIN
   ═══════════════════════════════════════════════════════════ */
const PanelAdmin = ({ onLogout }) => {
  const [active, setActive] = useState(SECTIONS[0].key);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, add, remove } = useToast();
  const current = SECTIONS.find((s) => s.key === active);
  const handleNavClick = (key) => { setActive(key); setSidebarOpen(false); };

  return (
    <>
      <Toasts toasts={toasts} remove={remove} />
      <button className="pa-hamburger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menú">
        <span /><span /><span />
      </button>
      <div className={`pa-sidebar-overlay ${sidebarOpen ? "is-open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <div className="pa-layout">
        <aside className={`pa-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="pa-logo">Admin</div>
          <nav className="pa-nav">
            {SECTIONS.map((s) => (
              <button key={s.key} className={`pa-nav-item ${active === s.key ? "pa-nav-item--active" : ""}`} onClick={() => handleNavClick(s.key)}>
                {s.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout}
            style={{ padding: "14px 20px", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#4a4f5e", fontSize: 12.5, cursor: "pointer", textAlign: "left", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}
            onMouseEnter={(e) => e.target.style.color = "#e05454"}
            onMouseLeave={(e) => e.target.style.color = "#4a4f5e"}
          >
            ⎋ Cerrar sesión
          </button>
        </aside>
        <main className="pa-main">
          <div className="pa-main-header"><h1>{current.label}</h1></div>
          {current.isPedido
            ? <PedidoSection key={active} section={current} toast={add} />
            : current.isCita
              ? <CitaSection key={active} section={current} toast={add} />
              : current.isProducto
                ? <ProductSection key={active} section={current} toast={add} />
                : <SectionTable key={active} section={current} toast={add} />
          }
        </main>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════ */
const App = () => {
  const [authed, setAuthed] = useState(isAdmin);
  useEffect(() => {
    const handleStorage = () => setAuthed(isAdmin());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  const handleLogin = () => setAuthed(true);
  const handleLogout = () => { clearAuthHeader(); setAuthed(false); };
  if (!authed) return <LoginScreen onLogin={handleLogin} />;
  return <PanelAdmin onLogout={handleLogout} />;
};

export default App;