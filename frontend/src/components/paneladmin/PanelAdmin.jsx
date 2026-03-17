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
  } catch {
    return false;
  }
};

const apiFetch = (url, opts = {}) => {
  const auth = getAuthHeader();
  const headers = { ...(opts.headers || {}), ...(auth ? { Authorization: auth } : {}) };
  if (!(opts.body instanceof FormData) && !headers["Content-Type"] && opts.method && opts.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }
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

/* ─── Thumbnail ──────────────────────────────────────────── */
const Thumb = ({ src, size = 48, radius = 6 }) => {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: "#ede9e0", border: "1px dashed rgba(75,77,82,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: size * 0.35, opacity: 0.3 }}>🖼</span>
      </div>
    );
  }
  return (
    <img src={src} onError={() => setErr(true)} style={{
      width: size, height: size, borderRadius: radius,
      objectFit: "cover", border: "1px solid rgba(75,77,82,0.12)",
      flexShrink: 0, display: "block",
    }} />
  );
};

/* ─── Badge de estado ────────────────────────────────────── */
const ESTADO_COLORS = {
  pendiente: { bg: "rgba(227,173,87,0.15)", border: "rgba(227,173,87,0.4)", color: "#7A744D" },
  confirmada: { bg: "rgba(90,122,77,0.12)", border: "rgba(90,122,77,0.35)", color: "#5a7a4d" },
  cancelada: { bg: "rgba(146,70,33,0.12)", border: "rgba(146,70,33,0.35)", color: "#924621" },
};

const EstadoBadge = ({ estado }) => {
  const s = ESTADO_COLORS[estado] || ESTADO_COLORS.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: 11, fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 20,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {estado}
    </span>
  );
};

/* ─── LoginScreen ────────────────────────────────────────── */
const LoginScreen = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f4f2ee",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", border: "1px solid rgba(75,77,82,0.12)",
        borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 380,
        margin: "0 16px", boxShadow: "0 12px 40px rgba(75,77,82,0.14)",
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#924621", marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E3AD57", boxShadow: "0 0 8px rgba(227,173,87,0.5)", display: "inline-block" }} />
            Panel de administración
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#4B4D52", margin: 0 }}>Iniciar sesión</h2>
        </div>
        {error && (
          <div style={{
            background: "rgba(146,70,33,0.08)", border: "1px solid rgba(146,70,33,0.3)",
            color: "#924621", padding: "10px 14px", borderRadius: 8,
            fontSize: 13, marginBottom: 20, lineHeight: 1.5,
          }}>{error}</div>
        )}
        {[
          { label: "Correo", type: "email", val: correo, set: setCorreo, placeholder: "admin@ejemplo.com" },
          { label: "Contraseña", type: "password", val: contrasena, set: setContrasena, placeholder: "••••••••" },
        ].map(({ label, type, val, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#878787", marginBottom: 6 }}>{label}</label>
            <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} required
              style={{ width: "100%", padding: "11px 14px", background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)", borderRadius: 8, color: "#4B4D52", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(227,173,87,0.5)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,77,82,0.15)"}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{
          width: "100%", marginTop: 8, padding: "12px 0",
          background: loading ? "#b5763f" : "#924621", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}>
          {loading ? "Conectando…" : "Entrar al panel"}
        </button>
      </form>
    </div>
  );
};

/* ─── Estilos inline formulario producto ─────────────────── */
const DJ = {
  page: { fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#4B4D52" },
  fieldRow: { display: "flex", alignItems: "flex-start", borderBottom: "1px solid rgba(75,77,82,0.1)", padding: "12px 0" },
  fieldLabel: { width: 180, minWidth: 180, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: "#878787", letterSpacing: "0.07em", textTransform: "uppercase", paddingTop: 8, paddingRight: 16 },
  fieldInput: { flex: 1 },
  input: { background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)", color: "#4B4D52", padding: "8px 10px", fontSize: 13.5, width: "100%", boxSizing: "border-box", outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  textarea: { background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)", color: "#4B4D52", padding: "8px 10px", fontSize: 13.5, width: "100%", boxSizing: "border-box", minHeight: 120, resize: "vertical", outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  select: { background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)", color: "#4B4D52", padding: "8px 10px", fontSize: 13.5, outline: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  inlineHeader: { background: "#f4f2ee", borderLeft: "3px solid #E3AD57", padding: "8px 14px", fontSize: 11, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "#7A744D", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 20 },
  inlineTable: { width: "100%", borderCollapse: "collapse" },
  inlineTh: { background: "#faf9f7", padding: "8px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 500, color: "#878787", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid rgba(75,77,82,0.1)" },
  inlineTd: { padding: "7px 8px", borderBottom: "1px solid rgba(75,77,82,0.06)", verticalAlign: "middle" },
  inlineInput: { background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)", color: "#4B4D52", padding: "5px 8px", fontSize: 12.5, width: "100%", boxSizing: "border-box", outline: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif" },
  addLink: { display: "inline-block", marginTop: 8, color: "#924621", fontSize: 12.5, cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "underline" },
  removeBtn: { background: "rgba(146,70,33,0.08)", border: "1px solid rgba(146,70,33,0.25)", color: "#924621", width: 24, height: 24, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 },
  saveBar: { background: "#faf9f7", padding: "14px 0", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(75,77,82,0.1)", marginTop: 24 },
  btnSave: { background: "#924621", color: "#fff", border: "none", padding: "10px 20px", fontSize: 13.5, cursor: "pointer", fontWeight: 600, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" },
  btnAlt: { background: "transparent", color: "#7A744D", border: "1px solid rgba(75,77,82,0.2)", padding: "10px 20px", fontSize: 13.5, cursor: "pointer", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" },
  btnBack: { background: "transparent", color: "#924621", border: "none", padding: "6px 0", fontSize: 13.5, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" },
  fkWrap: { display: "flex", alignItems: "center", gap: 6 },
  fkBtn: { background: "rgba(227,173,87,0.12)", border: "1px solid rgba(227,173,87,0.35)", color: "#7A744D", padding: "4px 8px", cursor: "pointer", fontSize: 13, lineHeight: 1, borderRadius: 4 },
};

/* ─── Helpers ────────────────────────────────────────────── */
const emptyColor = () => ({ _uid: Math.random(), nombre: "", codigo_hex: "", imagen_file: null, DELETE: false });
const emptyImagen = (colorUid) => ({ _uid: Math.random(), _colorUid: colorUid, imagen_file: null, orden: 1, DELETE: false });

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
      <div key={t.id} onClick={() => remove(t.id)} style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderRadius: 10, cursor: "pointer",
        background: t.type === "success" ? "#f0f5ed" : t.type === "error" ? "#fdf0eb" : "#faf9f7",
        border: `1px solid ${t.type === "success" ? "rgba(90,122,77,0.3)" : t.type === "error" ? "rgba(146,70,33,0.3)" : "rgba(75,77,82,0.15)"}`,
        color: t.type === "success" ? "#5a7a4d" : t.type === "error" ? "#924621" : "#4B4D52",
        fontSize: 13.5, minWidth: 240, maxWidth: 360,
        fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(75,77,82,0.12)",
      }}>
        <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "·"}</span>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

/* ─── ProductForm ────────────────────────────────────────── */
const ProductForm = ({ item, onBack, onSaved, toast }) => {
  const isEdit = !!item;
  const [form, setForm] = useState({
    nombre: item?.nombre || "", descripcion: item?.descripcion || "",
    precio: item?.precio || "", categoria: item?.categoria || "",
    stock: item?.stock ?? 0, modelo_glb: null, modelo_usdz: null,
  });
  const [categorias, setCategorias] = useState([]);
  const [saving, setSaving] = useState(false);

  const [colores, setColores] = useState(() => {
    if (item?.colores?.length) {
      const uids = {};
      item.colores.forEach((c) => { uids[c.id] = Math.random(); });
      return item.colores.map((c) => ({
        _uid: uids[c.id], id: c.id, nombre: c.nombre,
        codigo_hex: c.codigo_hex || "", imagen_file: null,
        imagen_url_existente: c.imagen_url || null,
        primera_imagen: c.imagenes?.[0]?.imagen || null, DELETE: false,
      }));
    }
    return [emptyColor()];
  });

  const [imagenes, setImagenes] = useState(() => {
    if (item?.colores?.length) {
      const uids = {};
      item.colores.forEach((c) => { uids[c.id] = Math.random(); });
      const imgs = [];
      item.colores.forEach((c) => {
        (c.imagenes || []).forEach((img) => {
          imgs.push({ _uid: Math.random(), _colorUid: uids[c.id], id: img.id, imagen_file: null, url_existente: img.imagen, orden: img.orden, DELETE: false });
        });
      });
      return imgs.length ? imgs : [emptyImagen()];
    }
    return [emptyImagen()];
  });

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
        toast(productoData._raw ? `Error ${productoData.status} al guardar.` : Object.values(productoData).flat().join(" · "), "error");
        setSaving(false); return;
      }

      const productoId = productoData.id;
      for (const color of colores.filter((c) => !c.DELETE && c.nombre)) {
        const cfd = new FormData();
        cfd.append("producto", productoId); cfd.append("nombre", color.nombre);
        if (color.codigo_hex) cfd.append("codigo_hex", color.codigo_hex);
        if (color.imagen_file) cfd.append("imagen", color.imagen_file);
        const colorUrl = color.id ? `${BASE}/colores/${color.id}/` : `${BASE}/colores/`;
        const colorRes = await apiFetch(colorUrl, { method: color.id ? "PATCH" : "POST", body: cfd });
        const colorData = await safeJson(colorRes);
        if (!colorRes.ok) { console.error("Error color:", colorData); continue; }
        const colorId = colorData.id;
        for (const img of imagenes.filter((i) => !i.DELETE && i.imagen_file && i._colorUid === color._uid)) {
          const ifd = new FormData();
          ifd.append("color", colorId); ifd.append("imagen", img.imagen_file); ifd.append("orden", img.orden);
          await apiFetch(`${BASE}/imagenproducto/`, { method: "POST", body: ifd });
        }
      }

      toast(isEdit ? "Producto actualizado." : "Producto creado.", "success");
      onSaved();
      if (mode === "save") { onBack(); }
      else if (mode === "add") {
        setForm({ nombre: "", descripcion: "", precio: "", categoria: "", stock: 0, modelo_glb: null, modelo_usdz: null });
        setColores([emptyColor()]); setImagenes([emptyImagen()]);
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
      <h2 style={{ color: "#4B4D52", fontSize: 17, fontWeight: 600, marginBottom: 24, fontFamily: "'DM Mono', monospace" }}>
        {isEdit ? `Editar: ${item.nombre}` : "Añadir producto"}
      </h2>

      {[
        { label: "Nombre *", content: <input style={DJ.input} type="text" value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} /> },
        { label: "Descripción", content: <textarea style={DJ.textarea} value={form.descripcion} onChange={(e) => setField("descripcion", e.target.value)} /> },
        { label: "Precio *", content: <input style={{ ...DJ.input, width: 150 }} type="number" step="0.01" value={form.precio} onChange={(e) => setField("precio", e.target.value)} /> },
        {
          label: "Categoría", content: (
            <div style={DJ.fkWrap}>
              <select style={DJ.select} value={form.categoria} onChange={(e) => setField("categoria", e.target.value)}>
                <option value="">----------</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )
        },
        { label: "Stock", content: <input style={{ ...DJ.input, width: 100 }} type="number" value={form.stock} onChange={(e) => setField("stock", e.target.value)} /> },
        { label: "Modelo GLB", content: <input type="file" accept=".glb" onChange={(e) => setField("modelo_glb", e.target.files[0])} style={{ color: "#878787", fontSize: 12.5 }} /> },
        { label: "Modelo USDZ", content: <input type="file" accept=".usdz" onChange={(e) => setField("modelo_usdz", e.target.files[0])} style={{ color: "#878787", fontSize: 12.5 }} /> },
      ].map(({ label, content }, i, arr) => (
        <div key={label} style={{ ...DJ.fieldRow, ...(i === arr.length - 1 ? { borderBottom: "none" } : {}) }}>
          <div style={DJ.fieldLabel}>{label}</div>
          <div style={DJ.fieldInput}>{content}</div>
        </div>
      ))}

      <div style={DJ.inlineHeader}>Colores del producto</div>

      {activeColores.map((color) => {
        const misImagenes = imagenes.filter((i) => !i.DELETE && i._colorUid === color._uid);
        return (
          <div key={color._uid} style={{ border: "1px solid rgba(75,77,82,0.1)", borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
            <table style={DJ.inlineTable}>
              <thead><tr>
                <th style={{ ...DJ.inlineTh, width: 64 }}>Actual</th>
                <th style={DJ.inlineTh}>Nombre</th>
                <th style={DJ.inlineTh}>Hex</th>
                <th style={DJ.inlineTh}>Nueva imagen</th>
                <th style={{ ...DJ.inlineTh, width: 60 }}>Del.</th>
              </tr></thead>
              <tbody><tr>
                <td style={{ ...DJ.inlineTd, width: 64 }}>
                  <Thumb src={color.imagen_url_existente || color.primera_imagen} size={48} />
                </td>
                <td style={DJ.inlineTd}>
                  <input style={DJ.inlineInput} type="text" value={color.nombre} onChange={(e) => setColorField(color._uid, "nombre", e.target.value)} />
                </td>
                <td style={DJ.inlineTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {color.codigo_hex && <span style={{ width: 14, height: 14, borderRadius: 3, background: color.codigo_hex, border: "1px solid rgba(75,77,82,0.2)", flexShrink: 0 }} />}
                    <input style={{ ...DJ.inlineInput, width: 90 }} type="text" value={color.codigo_hex} onChange={(e) => setColorField(color._uid, "codigo_hex", e.target.value)} />
                  </div>
                </td>
                <td style={DJ.inlineTd}>
                  <input type="file" accept="image/*" onChange={(e) => setColorField(color._uid, "imagen_file", e.target.files[0])} style={{ color: "#878787", fontSize: 11 }} />
                  {color.imagen_file && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Thumb src={URL.createObjectURL(color.imagen_file)} size={36} radius={4} />
                      <span style={{ color: "#5a7a4d", fontSize: 11 }}>✓ {color.imagen_file.name}</span>
                    </div>
                  )}
                </td>
                <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                  <button type="button" style={DJ.removeBtn} onClick={() => removeColor(color._uid)}>✕</button>
                </td>
              </tr></tbody>
            </table>

            <div style={{ ...DJ.inlineHeader, background: "rgba(90,122,77,0.06)", borderLeft: "3px solid #5a7a4d", color: "#5a7a4d", marginTop: 0, fontSize: 10 }}>
              Imágenes — {color.nombre || "sin nombre"}
            </div>
            <table style={DJ.inlineTable}>
              <thead><tr>
                <th style={{ ...DJ.inlineTh, width: 64 }}>Vista</th>
                <th style={DJ.inlineTh}>Archivo / URL</th>
                <th style={{ ...DJ.inlineTh, width: 90 }}>Orden</th>
                <th style={{ ...DJ.inlineTh, width: 60 }}>Del.</th>
              </tr></thead>
              <tbody>
                {misImagenes.map((img) => (
                  <tr key={img._uid}>
                    <td style={{ ...DJ.inlineTd, width: 64 }}>
                      {img.url_existente ? <Thumb src={img.url_existente} size={48} /> : img.imagen_file ? <Thumb src={URL.createObjectURL(img.imagen_file)} size={48} /> : <Thumb src={null} size={48} />}
                    </td>
                    <td style={DJ.inlineTd}>
                      {img.url_existente ? (
                        <a href={img.url_existente} target="_blank" rel="noreferrer" style={{ color: "#924621", fontSize: 11, fontFamily: "'DM Mono', monospace", wordBreak: "break-all" }}>Ver en Cloudinary ↗</a>
                      ) : (
                        <>
                          <input type="file" accept="image/*" onChange={(e) => setImagenField(img._uid, "imagen_file", e.target.files[0])} style={{ color: "#878787", fontSize: 11 }} />
                          {img.imagen_file && <span style={{ color: "#5a7a4d", fontSize: 11, display: "block", marginTop: 2 }}>✓ {img.imagen_file.name}</span>}
                        </>
                      )}
                    </td>
                    <td style={DJ.inlineTd}>
                      <input style={{ ...DJ.inlineInput, width: 60 }} type="number" value={img.orden} onChange={(e) => setImagenField(img._uid, "orden", e.target.value)} />
                    </td>
                    <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                      <button type="button" style={DJ.removeBtn} onClick={() => removeImagen(img._uid)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "8px 10px" }}>
              <span style={DJ.addLink} onClick={() => setImagenes((p) => [...p, emptyImagen(color._uid)])}>+ Agregar imagen</span>
            </div>
          </div>
        );
      })}

      <span style={{ ...DJ.addLink, display: "inline-block", marginTop: 6 }} onClick={() => setColores((p) => [...p, emptyColor()])}>+ Agregar color</span>

      <div style={DJ.saveBar}>
        <button type="button" style={DJ.btnSave} disabled={saving} onClick={() => handleSubmit("save")}>{saving ? "Guardando…" : "Guardar"}</button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("add")}>Guardar y añadir otro</button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("edit")}>Guardar y continuar</button>
      </div>
    </div>
  );
};

/* ─── Modal genérico ─────────────────────────────────────── */
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
        Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });
        body = fd;
      } else {
        body = JSON.stringify(form);
        extraHeaders = { "Content-Type": "application/json" };
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
                      <Thumb src={item[f.imgUrlField || f.name]} size={64} radius={8} />
                      <span style={{ fontSize: 11, color: "#878787", fontFamily: "'DM Mono', monospace" }}>Imagen actual</span>
                    </div>
                  )}
                  <input name={f.name} type="file" accept="image/*" onChange={handleFile}
                    style={{ color: "#878787", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }} />
                  {files[f.name] && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <Thumb src={URL.createObjectURL(files[f.name])} size={56} radius={8} />
                      <span style={{ fontSize: 11, color: "#5a7a4d", fontFamily: "'DM Mono', monospace" }}>✓ {files[f.name].name}</span>
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

/* ─── CitaSection ────────────────────────────────────────── */
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

  useEffect(() => { load(); }, []);

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
      const res = await apiFetch(`${section.endpoint}${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
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
    const msg = encodeURIComponent(
      `Hola ${row.nombre}, te contactamos de *Mestizo Mobiliario* para confirmar tu cita programada para el *${fecha}* a las *${hora}*. ¿Puedes confirmarnos tu asistencia?`
    );
    window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
  };

  const filtered = rows.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return ["identificacion", "nombre", "primerApellido", "correo", "fecha", "descripcion"].some(
      (col) => String(r[col] ?? "").toLowerCase().includes(q)
    );
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
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const [y, m, d] = String(row.fecha || "").split("-");
                const fechaStr = row.fecha ? `${d}/${m}/${y}` : "—";
                const horaStr = row.hora ? String(row.hora).slice(0, 5) : "—";

                return (
                  <tr key={row.id}>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.identificacion || <span className="pa-empty">—</span>}</span></td>
                    <td>{row.nombre || <span className="pa-empty">—</span>}</td>
                    <td>{row.primerApellido || <span className="pa-empty">—</span>}</td>
                    <td><span style={{ fontSize: 12 }}>{row.correo || <span className="pa-empty">—</span>}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.telefono || <span className="pa-empty">—</span>}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{fechaStr}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{horaStr}</span></td>

                    {/* ── Motivo ── */}
                    <td>
                      {row.descripcion ? (
                        <span style={{
                          fontSize: 12.5, color: "#7A744D",
                          display: "block", maxWidth: 200,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }} title={row.descripcion}>
                          {row.descripcion}
                        </span>
                      ) : <span className="pa-empty">—</span>}
                    </td>

                    {/* ── Estado ── */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <EstadoBadge estado={row.estado || "pendiente"} />
                        <select
                          value={row.estado || "pendiente"}
                          disabled={updatingEstado === row.id}
                          onChange={(e) => handleEstado(row.id, e.target.value)}
                          style={{
                            background: "#faf9f7", border: "1px solid rgba(75,77,82,0.15)",
                            color: "#7A744D", fontSize: 11, borderRadius: 4,
                            padding: "3px 6px", cursor: "pointer", outline: "none",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                    </td>

                    {/* ── Acciones ── */}
                    <td className="pa-td-actions">
                      {row.telefono && (
                        <button
                          className="pa-action"
                          title={`WhatsApp a ${row.nombre}`}
                          onClick={() => abrirWhatsApp(row)}
                          style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)", color: "#25d366", fontSize: 15 }}
                        >
                          💬
                        </button>
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

      {confirmDelete !== null && (
        <Confirm onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
};

/* ─── ProductSection ─────────────────────────────────────── */
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

  useEffect(() => { load(); }, []);

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
            <thead>
              <tr>
                <th style={{ width: 64 }}>Imagen</th>
                {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const firstImg = row.colores?.[0]?.imagenes?.[0]?.imagen ?? null;
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

/* ─── SectionTable genérica ──────────────────────────────── */
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

  useEffect(() => { load(); }, [section.key]);

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
    if (col === "url") return <a href={val} target="_blank" rel="noreferrer" className="pa-link">Ver ↗</a>;
    if (col === "codigo_hex") return (
      <span className="pa-color-cell">
        <span className="pa-color-swatch" style={{ background: val }} />{val}
      </span>
    );
    return String(val);
  };

  const isImageSection = section.key === "imagenes";
  const isColorSection = section.key === "colores";

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
            <thead>
              <tr>
                {(isImageSection || isColorSection) && <th style={{ width: 64 }}>Vista previa</th>}
                {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i}>
                  {isImageSection && <td style={{ padding: "8px 12px" }}><Thumb src={row.imagen} size={44} radius={6} /></td>}
                  {isColorSection && <td style={{ padding: "8px 12px" }}><Thumb src={row.imagen_url} size={44} radius={6} /></td>}
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

/* ─── Secciones ──────────────────────────────────────────── */
const SECTIONS = [
  {
    key: "citas", label: "Citas", endpoint: `${BASE}/citas/`,
    isCita: true, fields: [], columns: [], columnLabels: [],
  },
  {
    key: "categorias", label: "Categorías", endpoint: `${BASE}/categorias/`,
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
    columns: ["nombre", "descripcion"], columnLabels: ["Nombre", "Descripción"],
  },
  {
    key: "colores", label: "Color productos", endpoint: `${BASE}/colores/`,
    isFileUpload: true,
    fields: [
      { name: "nombre", label: "Nombre del color", type: "text", required: true },
      { name: "codigo_hex", label: "Código hex", type: "text" },
      { name: "imagen", label: "Imagen del color / tapizado", type: "file", imgUrlField: "imagen_url" },
    ],
    columns: ["nombre", "codigo_hex"], columnLabels: ["Nombre", "Código hex"],
  },
  {
    key: "productos", label: "Productos", endpoint: `${BASE}/productos/`,
    isProducto: true, fields: [],
    columns: ["nombre", "precio", "categoria_nombre", "stock"],
    columnLabels: ["Nombre", "Precio", "Categoría", "Stock"],
  },
  {
    key: "imagenes", label: "Imagen productos", endpoint: `${BASE}/imagenproducto/`,
    fields: [
      { name: "color", label: "Color (ID)", type: "number", required: true },
      { name: "orden", label: "Orden", type: "number" },
    ],
    columns: ["id", "color", "orden"], columnLabels: ["ID", "Color", "Orden"],
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

/* ─── Panel principal ────────────────────────────────────── */
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
            style={{ padding: "14px 20px", background: "transparent", border: "none", borderTop: "1px solid rgba(222,219,205,0.15)", color: "rgba(222,219,205,0.45)", fontSize: 12.5, cursor: "pointer", textAlign: "left", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", transition: "color 0.15s" }}
            onMouseEnter={(e) => e.target.style.color = "#924621"}
            onMouseLeave={(e) => e.target.style.color = "rgba(222,219,205,0.45)"}
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

/* ─── App root ───────────────────────────────────────────── */
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
