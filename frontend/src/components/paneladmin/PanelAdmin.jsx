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
      <div key={t.id} onClick={() => remove(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer", background: t.type === "success" ? "#1a2e1f" : t.type === "error" ? "#2e1a1a" : "#1a1e25", border: `1px solid ${t.type === "success" ? "rgba(76,175,125,0.3)" : t.type === "error" ? "rgba(224,84,84,0.3)" : "rgba(255,255,255,0.07)"}`, color: t.type === "success" ? "#4caf7d" : t.type === "error" ? "#e05454" : "#e8eaf0", fontSize: 13.5, minWidth: 240, maxWidth: 360, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
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
   FILA IMAGEN NUEVA CON PREVIEW INMEDIATO
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

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <tr>
      <td style={{ ...DJ.inlineTd, width: 72 }}>
        {preview ? (
          <img src={preview} alt="preview"
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(76,175,125,0.4)", display: "block" }} />
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
        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 8, padding: "12px 0", background: loading ? "#a08830" : "#e8c547", color: "#0d0f12", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}>
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
    modelo_glb: null,
    modelo_usdz: null,
  });
  const [categorias, setCategorias] = useState([]);
  const [saving, setSaving] = useState(false);

  /* Colores */
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

  /* Imágenes */
  const [imagenes, setImagenes] = useState(() => {
    if (!item?.colores?.length) return [];
    const resultado = [];
    item.colores.forEach((c) => {
      (c.imagenes || []).forEach((img) => {
        if (!img.imagen) return;
        resultado.push({
          _uid: Math.random(), _colorId: c.id, _colorUid: null,
          id: img.id, imagen_file: null, previewUrl: null,
          url_existente: img.imagen,
          orden: img.orden, DELETE: false,
        });
      });
    });
    return resultado;
  });

  /* Sincronizar _colorUid */
  useEffect(() => {
    if (!isEdit) return;
    setImagenes((prev) =>
      prev.map((img) => {
        if (img._colorUid) return img;
        const color = colores.find((c) => c.id === img._colorId);
        return color ? { ...img, _colorUid: color._uid } : img;
      })
    );
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

  const safeJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { _raw: text, status: res.status }; }
  };

  const handleSubmit = async (mode) => {
    if (!form.nombre || !form.precio) { toast("Nombre y precio son requeridos.", "error"); return; }
    setSaving(true);
    try {
      /* Producto */
      const fd = new FormData();
      fd.append("nombre", form.nombre); fd.append("descripcion", form.descripcion);
      fd.append("precio", form.precio); fd.append("stock", form.stock);
      if (form.categoria) fd.append("categoria", form.categoria);
      if (form.modelo_glb) fd.append("modelo_glb", form.modelo_glb);
      if (form.modelo_usdz) fd.append("modelo_usdz", form.modelo_usdz);

      const productoUrl = isEdit ? `${BASE}/productos/${item.id}/` : `${BASE}/productos/`;
      const productoRes = await apiFetch(productoUrl, { method: isEdit ? "PATCH" : "POST", body: fd });
      const productoData = await safeJson(productoRes);
      if (!productoRes.ok) {
        toast(productoData._raw ? `Error ${productoData.status}` : Object.values(productoData).flat().join(" · "), "error");
        setSaving(false); return;
      }
      const productoId = productoData.id;

      /* Eliminar imágenes guardadas marcadas DELETE */
      for (const img of imagenes.filter((i) => i.DELETE && i.id)) {
        await apiFetch(`${BASE}/imagenproducto/${img.id}/`, { method: "DELETE" }).catch(() => { });
      }

      /* Colores */
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
        // ✅ CORRECCIÓN: usar "imagen_file" para que el serializer lo procese
        if (color.imagen_file) cfd.append("imagen_file", color.imagen_file);

        const colorUrl = color.id ? `${BASE}/colores/${color.id}/` : `${BASE}/colores/`;
        const colorRes = await apiFetch(colorUrl, { method: color.id ? "PATCH" : "POST", body: cfd });
        const colorData = await safeJson(colorRes);
        if (!colorRes.ok) { console.error("Error color:", colorData); continue; }
        const colorId = colorData.id;

        /* Imágenes nuevas */
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
          if (!imgRes.ok) {
            const imgErr = await imgRes.text();
            console.error("Error imagen:", imgErr);
            toast("Error al subir una imagen.", "error");
          }
        }
      }

      toast(isEdit ? "Producto actualizado." : "Producto creado.", "success");
      onSaved();
      if (mode === "save") { onBack(); }
      else if (mode === "add") {
        setForm({ nombre: "", descripcion: "", precio: "", categoria: "", stock: 0, modelo_glb: null, modelo_usdz: null });
        setColores([emptyColor()]); setImagenes([]);
      }
    } catch (err) { toast("Error inesperado.", "error"); console.error(err); }
    finally { setSaving(false); }
  };

  const activeColores = colores.filter((c) => !c.DELETE);

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
        { label: "Modelo GLB", content: <input type="file" accept=".glb" onChange={(e) => setField("modelo_glb", e.target.files[0])} style={{ color: "#8a8f9e", fontSize: 12.5 }} /> },
        { label: "Modelo USDZ", content: <input type="file" accept=".usdz" onChange={(e) => setField("modelo_usdz", e.target.files[0])} style={{ color: "#8a8f9e", fontSize: 12.5 }} /> },
      ].map(({ label, content }, i, arr) => (
        <div key={label} style={{ ...DJ.fieldRow, ...(i === arr.length - 1 ? { borderBottom: "none" } : {}) }}>
          <div style={DJ.fieldLabel}>{label}</div>
          <div style={DJ.fieldInput}>{content}</div>
        </div>
      ))}

      <div style={DJ.inlineHeader}>Colores del producto</div>

      {activeColores.map((color) => {
        const imagenesGuardadas = imagenes.filter(
          (i) => !i.DELETE && i.url_existente && (i._colorId === color.id || i._colorUid === color._uid)
        );
        const imagenesNuevas = imagenes.filter(
          (i) => !i.DELETE && !i.url_existente && (i._colorUid === color._uid || i._colorId === color.id)
        );
        const total = imagenesGuardadas.length + imagenesNuevas.length;

        return (
          <div key={color._uid} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
            {/* Fila color */}
            <table style={DJ.inlineTable}>
              <thead><tr>
                <th style={{ ...DJ.inlineTh, width: 64 }}>Actual</th>
                <th style={DJ.inlineTh}>Nombre</th>
                <th style={DJ.inlineTh}>Hex</th>
                <th style={DJ.inlineTh}>Nueva imagen color</th>
                <th style={{ ...DJ.inlineTh, width: 60 }}>Del.</th>
              </tr></thead>
              <tbody><tr>
                <td style={{ ...DJ.inlineTd, width: 64 }}>
                  <Thumb src={color.imagen_url_existente} size={48} />
                </td>
                <td style={DJ.inlineTd}>
                  <input style={DJ.inlineInput} type="text" value={color.nombre} onChange={(e) => setColorField(color._uid, "nombre", e.target.value)} />
                </td>
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
                      <img src={URL.createObjectURL(color.imagen_file)} alt=""
                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} />
                      <span style={{ color: "#4caf7d", fontSize: 11 }}>✓ {color.imagen_file.name}</span>
                    </div>
                  )}
                </td>
                <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                  <button type="button" style={DJ.removeBtn} onClick={() => removeColor(color._uid)}>✕</button>
                </td>
              </tr></tbody>
            </table>

            {/* Encabezado imágenes con contador */}
            <div style={{ background: "rgba(76,175,125,0.08)", borderLeft: "3px solid #4caf7d", padding: "8px 14px", fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4caf7d", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span>Imágenes — {color.nombre || "sin nombre"}</span>
              <span style={{ background: total > 0 ? "rgba(76,175,125,0.2)" : "rgba(74,79,94,0.3)", border: `1px solid ${total > 0 ? "rgba(76,175,125,0.4)" : "rgba(74,79,94,0.3)"}`, color: total > 0 ? "#4caf7d" : "#4a4f5e", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>
                {total} imagen{total !== 1 ? "es" : ""}
              </span>
            </div>

            {/* Galería imágenes guardadas */}
            <ImageGallery imagenes={imagenesGuardadas} onDelete={removeImagen} />

            {/* Imágenes nuevas con preview */}
            {imagenesNuevas.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 2px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5b9cf6", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Nuevas a subir
                </div>
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
              <span style={DJ.addLink} onClick={() => setImagenes((p) => [...p, emptyImagen(color._uid, color.id)])}>
                + Agregar imagen
              </span>
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
      const url = isEdit ? `${section.endpoint}${item.id}/` : section.endpoint;
      let body, extraHeaders = {};
      if (section.isFileUpload) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) fd.append(k, v); });
        // ✅ CORRECCIÓN: renombrar "imagen" → "imagen_file" para el serializer de colores
        Object.entries(files).forEach(([k, v]) => {
          if (v) fd.append(k === "imagen" ? "imagen_file" : k, v);
        });
        body = fd;
      } else {
        body = JSON.stringify(form); extraHeaders = { "Content-Type": "application/json" };
      }
      const res = await apiFetch(url, { method: isEdit ? "PATCH" : "POST", headers: extraHeaders, body });
      const data = await res.json();
      if (!res.ok) { toast(typeof data === "object" ? Object.values(data).flat().join(" · ") : "Error al guardar.", "error"); return; }
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
          {section.fields.map((f) => (
            <label key={f.name} className="pa-field">
              <span>{f.label}{f.required && " *"}</span>
              {f.type === "textarea" ? (
                <textarea name={f.name} value={form[f.name] || ""} onChange={handleChange} required={!!f.required} />
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
                <input name={f.name} type={f.type} value={form[f.name] || ""} onChange={handleChange} required={!!f.required} />
              )}
            </label>
          ))}
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
              <th>Motivo</th>
              <th>Estado</th><th>Acciones</th>
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
                <tr key={row.id ?? i}>
                  {section.key === "colores" && (
                    <td style={{ padding: "8px 12px" }}><Thumb src={buildCloudinaryUrl(row.imagen_url)} size={44} radius={6} /></td>
                  )}
                  {section.columns.map((col) => <td key={col}>{formatCell(row, col)}</td>)}
                  <td className="pa-td-actions">
                    <button className="pa-action pa-action--edit" onClick={() => setModal(row)} title="Editar">✏</button>
                    <button className="pa-action pa-action--del" onClick={() => setConfirmDelete(row.id)} title="Eliminar">🗑</button>
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
    key: "usuarios", label: "Usuarios", endpoint: `${BASE}/usuarios/`,
    fields: [
      { name: "identificacion", label: "Identificación", type: "text", required: true },
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "primerApellido", label: "Primer apellido", type: "text", required: true },
      { name: "segundoApellido", label: "Segundo apellido", type: "text" },
      { name: "correo", label: "Correo", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text" },
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
          {current.isCita
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
