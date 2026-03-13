import React, { useState, useEffect } from "react";
import "./PanelAdmin.css";

const BASE = "http://127.0.0.1:8000/api";

/* ─── Auth ───────────────────────────────────────────────── */
const AUTH_KEY = "pa_token";
const setAuthHeader = (h) => { sessionStorage.setItem(AUTH_KEY, h); };
const getAuthHeader = () => sessionStorage.getItem(AUTH_KEY);
const clearAuthHeader = () => sessionStorage.removeItem(AUTH_KEY);

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
      setAuthHeader(`Token ${data.token}`);
      return { ok: true, user: data.user };
    }
    return { ok: false, error: data.error || "Credenciales incorrectas." };
  } catch (_) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
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
    if (result.ok) { onLogin(result.user); }
    else { setError(result.error); }
  };

  const inp = {
    width: "100%", boxSizing: "border-box",
    background: "#2a2a2a", border: "1px solid #555",
    color: "#fff", padding: "7px 10px", fontSize: 13, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#121212" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: 32, width: 340, fontFamily: "'Roboto','Arial',sans-serif" }}>
        <div style={{ background: "#1b4a6b", padding: "12px 16px", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 24 }}>
          ⚙ Admin — Iniciar sesión
        </div>
        {error && (
          <div style={{ background: "#5c1f1f", border: "1px solid #a33", color: "#f99", padding: "8px 12px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#aaa", fontSize: 12, marginBottom: 4 }}>Correo</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoFocus style={inp} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", color: "#aaa", fontSize: 12, marginBottom: 4 }}>Contraseña</label>
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required style={inp} />
        </div>
        <button type="submit" disabled={loading} style={{
          background: "#2a6496", color: "#fff", border: "none",
          padding: "9px 20px", fontSize: 13, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Conectando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
};


/* ─── estilos Django Admin ───────────────────────────────── */
const DJ = {
  page: {
    fontFamily: "'Roboto','Arial',sans-serif",
    fontSize: 13,
    color: "#ddd",
  },
  pageHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  fieldRow: {
    display: "flex", alignItems: "flex-start",
    borderBottom: "1px solid #2a2a2a", padding: "10px 0",
  },
  fieldLabel: {
    width: 180, minWidth: 180, fontWeight: 700,
    paddingTop: 6, paddingRight: 16, color: "#ddd", fontSize: 13,
  },
  fieldInput: { flex: 1 },
  input: {
    background: "#2a2a2a", border: "1px solid #555",
    color: "#fff", padding: "5px 8px", fontSize: 13,
    width: "100%", boxSizing: "border-box", outline: "none",
  },
  textarea: {
    background: "#2a2a2a", border: "1px solid #555",
    color: "#fff", padding: "5px 8px", fontSize: 13,
    width: "100%", boxSizing: "border-box",
    minHeight: 140, resize: "vertical", outline: "none",
  },
  select: {
    background: "#2a2a2a", border: "1px solid #555",
    color: "#fff", padding: "5px 8px", fontSize: 13, outline: "none",
  },
  inlineHeader: {
    background: "#2a6496", padding: "8px 12px",
    fontSize: 12, fontWeight: 700, color: "#fff",
    letterSpacing: 1, textTransform: "uppercase", marginTop: 20,
  },
  inlineTable: { width: "100%", borderCollapse: "collapse" },
  inlineTh: {
    background: "#1e1e1e", padding: "6px 10px", fontSize: 12,
    fontWeight: 700, color: "#aaa", textAlign: "left",
    borderBottom: "1px solid #333",
  },
  inlineTd: {
    padding: "6px 8px", borderBottom: "1px solid #2a2a2a", verticalAlign: "middle",
  },
  inlineInput: {
    background: "#2a2a2a", border: "1px solid #555",
    color: "#fff", padding: "4px 6px", fontSize: 12,
    width: "100%", boxSizing: "border-box", outline: "none",
  },
  addLink: {
    display: "inline-block", marginTop: 8,
    color: "#5b9bd5", fontSize: 12, cursor: "pointer",
    textDecoration: "underline",
  },
  removeBtn: {
    background: "#333", border: "1px solid #555", color: "#fff",
    width: 22, height: 22, borderRadius: "50%",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 12, flexShrink: 0,
  },
  saveBar: {
    background: "#1e1e1e", padding: "12px 0",
    display: "flex", gap: 8, flexWrap: "wrap",
    borderTop: "1px solid #333", marginTop: 20,
  },
  btnSave: {
    background: "#2a6496", color: "#fff", border: "none",
    padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700,
  },
  btnAlt: {
    background: "#333", color: "#fff", border: "1px solid #555",
    padding: "8px 16px", fontSize: 13, cursor: "pointer",
  },
  btnBack: {
    background: "transparent", color: "#5b9bd5", border: "none",
    padding: "6px 0", fontSize: 13, cursor: "pointer",
    textDecoration: "underline",
  },
  fkWrap: { display: "flex", alignItems: "center", gap: 6 },
  fkBtn: {
    background: "#333", border: "1px solid #555", color: "#7ec891",
    padding: "3px 7px", cursor: "pointer", fontSize: 14, lineHeight: 1,
  },
};

/* ─── helpers ────────────────────────────────────────────── */
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
  <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((t) => (
      <div key={t.id} onClick={() => remove(t.id)} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 4, cursor: "pointer",
        background: t.type === "success" ? "#2a7a3b" : t.type === "error" ? "#b52828" : "#333",
        color: "#fff", fontSize: 13, minWidth: 220,
      }}>
        <span style={{ fontWeight: 700 }}>{t.type === "success" ? "✓" : "✕"}</span>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

/* ─── ProductForm (inline, sin modal) ───────────────────── */
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
  const [colores, setColores] = useState([emptyColor()]);
  const [imagenes, setImagenes] = useState([emptyImagen()]);
  const [saving, setSaving] = useState(false);

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
    try { return JSON.parse(text); }
    catch { return { _raw: text, status: res.status }; }
  };

  const handleSubmit = async (mode) => {
    if (!form.nombre || !form.precio) { toast("Nombre y precio son requeridos.", "error"); return; }
    setSaving(true);
    try {
      // ── Paso 1: guardar Producto ──────────────────────────
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("descripcion", form.descripcion);
      fd.append("precio", form.precio);
      if (form.categoria) fd.append("categoria", form.categoria);
      fd.append("stock", form.stock);
      if (form.modelo_glb) fd.append("modelo_glb", form.modelo_glb);
      if (form.modelo_usdz) fd.append("modelo_usdz", form.modelo_usdz);

      const productoUrl = isEdit ? `${BASE}/productos/${item.id}/` : `${BASE}/productos/`;
      const productoRes = await apiFetch(productoUrl, { method: isEdit ? "PATCH" : "POST", body: fd });
      const productoData = await safeJson(productoRes);

      if (!productoRes.ok) {
        if (productoData._raw) {
          // El servidor devolvió HTML — mostrar el status
          toast(`Error ${productoData.status} al guardar producto. Revisa la consola.`, "error");
          console.error("Respuesta del servidor:", productoData._raw);
        } else {
          toast(Object.values(productoData).flat().join(" · "), "error");
        }
        setSaving(false);
        return;
      }
      const productoId = productoData.id;

      // ── Paso 2: guardar ColorProducto (con su imagen) ────
      const activeColoresList = colores.filter((c) => !c.DELETE && c.nombre);
      for (const color of activeColoresList) {
        const cfd = new FormData();
        cfd.append("producto", productoId);
        cfd.append("nombre", color.nombre);
        if (color.codigo_hex) cfd.append("codigo_hex", color.codigo_hex);
        if (color.imagen_file) cfd.append("imagen", color.imagen_file);

        const colorUrl = color.id ? `${BASE}/colores/${color.id}/` : `${BASE}/colores/`;
        const colorRes = await apiFetch(colorUrl, { method: color.id ? "PATCH" : "POST", body: cfd });
        const colorData = await safeJson(colorRes);

        if (!colorRes.ok) {
          const msg = colorData._raw
            ? `Error ${colorData.status} en color "${color.nombre}"`
            : `Error en color "${color.nombre}": ${Object.values(colorData).flat().join(" · ")}`;
          toast(msg, "error");
          console.error("Error color:", colorData._raw || colorData);
          continue;
        }
        const colorId = colorData.id;

        // ── Paso 3: guardar ImagenProducto (Cloudinary) ───
        const activeImagenesList = imagenes.filter((i) => !i.DELETE && i.imagen_file && i._colorUid === color._uid);
        for (const img of activeImagenesList) {
          const ifd = new FormData();
          ifd.append("color", colorId);
          ifd.append("imagen", img.imagen_file);
          ifd.append("orden", img.orden);
          const imgRes = await apiFetch(`${BASE}/imagenproducto/`, { method: "POST", body: ifd });
          if (!imgRes.ok) {
            const imgData = await safeJson(imgRes);
            console.error("Error imagen:", imgData._raw || imgData);
          }
        }
      }

      toast(isEdit ? "Producto actualizado." : "Producto creado.", "success");
      onSaved();
      if (mode === "save") {
        onBack();
      } else if (mode === "add") {
        setForm({ nombre: "", descripcion: "", precio: "", categoria: "", stock: 0, modelo_glb: null, modelo_usdz: null });
        setColores([emptyColor()]);
        setImagenes([emptyImagen()]);
      }
    } catch (err) {
      toast("Error inesperado. Revisa la consola.", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activeColores = colores.filter((c) => !c.DELETE);
  const activeImagenes = imagenes.filter((i) => !i.DELETE);

  return (
    <div style={DJ.page}>
      {/* breadcrumb / back */}
      <div style={{ marginBottom: 12 }}>
        <button style={DJ.btnBack} onClick={onBack}>← Volver a Productos</button>
      </div>

      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        {isEdit ? `Editar producto: ${item.nombre}` : "Añadir producto"}
      </h2>

      {/* ── Campos principales ── */}
      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Nombre: <span style={{ color: "#e74c3c" }}>*</span></div>
        <div style={DJ.fieldInput}>
          <input style={DJ.input} type="text" value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} />
        </div>
      </div>

      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Descripcion:</div>
        <div style={DJ.fieldInput}>
          <textarea style={DJ.textarea} value={form.descripcion} onChange={(e) => setField("descripcion", e.target.value)} />
        </div>
      </div>

      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Precio: <span style={{ color: "#e74c3c" }}>*</span></div>
        <div style={DJ.fieldInput}>
          <input style={{ ...DJ.input, width: 150 }} type="number" step="0.01" value={form.precio} onChange={(e) => setField("precio", e.target.value)} />
        </div>
      </div>

      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Categoria:</div>
        <div style={DJ.fieldInput}>
          <div style={DJ.fkWrap}>
            <select style={DJ.select} value={form.categoria} onChange={(e) => setField("categoria", e.target.value)}>
              <option value="">----------</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <button style={DJ.fkBtn} type="button" title="Editar categoría">✏</button>
            <button style={DJ.fkBtn} type="button" title="Añadir categoría">+</button>
            <button style={DJ.fkBtn} type="button" title="Ver categoría">👁</button>
          </div>
        </div>
      </div>

      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Stock:</div>
        <div style={DJ.fieldInput}>
          <input style={{ ...DJ.input, width: 100 }} type="number" value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
        </div>
      </div>

      <div style={DJ.fieldRow}>
        <div style={DJ.fieldLabel}>Modelo_glb:</div>
        <div style={DJ.fieldInput}>
          <input type="file" accept=".glb" onChange={(e) => setField("modelo_glb", e.target.files[0])} style={{ color: "#ccc", fontSize: 12 }} />
        </div>
      </div>

      <div style={{ ...DJ.fieldRow, borderBottom: "none" }}>
        <div style={DJ.fieldLabel}>Modelo_usdz:</div>
        <div style={DJ.fieldInput}>
          <input type="file" accept=".usdz" onChange={(e) => setField("modelo_usdz", e.target.files[0])} style={{ color: "#ccc", fontSize: 12 }} />
        </div>
      </div>

      {/* ── Inline: Color Productos (cada uno con sus imágenes) ── */}
      <div style={DJ.inlineHeader}>Color Productos</div>

      {activeColores.map((color) => {
        const misImagenes = imagenes.filter((i) => !i.DELETE && i._colorUid === color._uid);
        return (
          <div key={color._uid} style={{ border: "1px solid #333", marginBottom: 12 }}>
            {/* fila del color */}
            <table style={DJ.inlineTable}>
              <thead>
                <tr>
                  <th style={DJ.inlineTh}>Nombre</th>
                  <th style={DJ.inlineTh}>Codigo Hex</th>
                  <th style={DJ.inlineTh}>Imagen del color</th>
                  <th style={{ ...DJ.inlineTh, width: 80 }}>¿Eliminar?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={DJ.inlineTd}>
                    <input style={DJ.inlineInput} type="text" value={color.nombre} onChange={(e) => setColorField(color._uid, "nombre", e.target.value)} />
                  </td>
                  <td style={DJ.inlineTd}>
                    <input style={DJ.inlineInput} type="text" value={color.codigo_hex} onChange={(e) => setColorField(color._uid, "codigo_hex", e.target.value)} />
                  </td>
                  <td style={DJ.inlineTd}>
                    <input type="file" accept="image/*" onChange={(e) => setColorField(color._uid, "imagen_file", e.target.files[0])} style={{ color: "#ccc", fontSize: 11 }} />
                    {color.imagen_file && <span style={{ color: "#7ec891", fontSize: 11, marginLeft: 6 }}>✓ {color.imagen_file.name}</span>}
                  </td>
                  <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                    <button type="button" style={DJ.removeBtn} onClick={() => removeColor(color._uid)}>✕</button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* imágenes de este color */}
            <div style={{ ...DJ.inlineHeader, background: "#1f6b42", marginTop: 0, fontSize: 11 }}>
              Imágenes del color: {color.nombre || "sin nombre"}
            </div>
            <table style={DJ.inlineTable}>
              <thead>
                <tr>
                  <th style={DJ.inlineTh}>Imagen (Cloudinary)</th>
                  <th style={{ ...DJ.inlineTh, width: 120 }}>Orden</th>
                  <th style={{ ...DJ.inlineTh, width: 80 }}>¿Eliminar?</th>
                </tr>
              </thead>
              <tbody>
                {misImagenes.map((img) => (
                  <tr key={img._uid}>
                    <td style={DJ.inlineTd}>
                      <input type="file" accept="image/*"
                        onChange={(e) => setImagenField(img._uid, "imagen_file", e.target.files[0])}
                        style={{ color: "#ccc", fontSize: 11 }} />
                      {img.imagen_file && <span style={{ color: "#7ec891", fontSize: 11, marginLeft: 6 }}>✓ {img.imagen_file.name}</span>}
                    </td>
                    <td style={DJ.inlineTd}>
                      <input style={{ ...DJ.inlineInput, width: 70 }} type="number" value={img.orden}
                        onChange={(e) => setImagenField(img._uid, "orden", e.target.value)} />
                    </td>
                    <td style={{ ...DJ.inlineTd, textAlign: "center" }}>
                      <button type="button" style={DJ.removeBtn} onClick={() => removeImagen(img._uid)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "6px 8px" }}>
              <span style={DJ.addLink} onClick={() => setImagenes((p) => [...p, emptyImagen(color._uid)])}>
                + Agregar imagen a este color
              </span>
            </div>
          </div>
        );
      })}

      <span style={{ ...DJ.addLink, display: "inline-block", marginTop: 4 }} onClick={() => setColores((p) => [...p, emptyColor()])}>
        Agregar Color Producto adicional.
      </span>

      {/* ── Barra guardar ── */}
      <div style={DJ.saveBar}>
        <button type="button" style={DJ.btnSave} disabled={saving} onClick={() => handleSubmit("save")}>
          {saving ? "Guardando…" : "GUARDAR"}
        </button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("add")}>
          Guardar y añadir otro
        </button>
        <button type="button" style={DJ.btnAlt} disabled={saving} onClick={() => handleSubmit("edit")}>
          Guardar y continuar editando
        </button>
      </div>
    </div>
  );
};

/* ─── Modal genérico (para secciones no-producto) ───────── */
const Modal = ({ section, item, onClose, onSaved, toast }) => {
  const isEdit = !!item;
  const empty = Object.fromEntries(section.fields.map((f) => [f.name, ""]));
  const [form, setForm] = useState(isEdit ? { ...item } : empty);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `${section.endpoint}${item.id}/` : section.endpoint;
      const res = await apiFetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(typeof data === "object" ? Object.values(data).flat().join(" · ") : "Error al guardar.", "error");
        return;
      }
      toast(isEdit ? "Registro actualizado." : "Registro creado.", "success");
      onSaved();
    } catch {
      toast("No se pudo conectar con el servidor.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pa-modal-header">
          <h3>{isEdit ? "Editar" : "Añadir"} {section.label}</h3>
          <button className="pa-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="pa-modal-form" onSubmit={handleSubmit}>
          {section.fields.map((f) =>
            f.type === "textarea" ? (
              <label key={f.name} className="pa-field">
                <span>{f.label}{f.required && " *"}</span>
                <textarea name={f.name} value={form[f.name] || ""} onChange={handleChange} required={!!f.required} />
              </label>
            ) : (
              <label key={f.name} className="pa-field">
                <span>{f.label}{f.required && " *"}</span>
                <input name={f.name} type={f.type} value={form[f.name] || ""} onChange={handleChange} required={!!f.required} />
              </label>
            )
          )}
          <div className="pa-modal-actions">
            <button type="button" className="pa-btn pa-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="pa-btn pa-btn--primary" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
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

/* ─── ProductSection (lista + form inline) ───────────────── */
const ProductSection = ({ section, toast }) => {
  const [view, setView] = useState("list"); // "list" | "form"
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
    } catch {
      toast("Error al cargar Productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${section.endpoint}${id}/`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Registro eliminado.", "success");
      load();
    } catch {
      toast("No se pudo eliminar.", "error");
    }
    setConfirmDelete(null);
  };

  const filtered = rows.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return section.columns.some((col) => String(r[col] ?? "").toLowerCase().includes(q));
  });

  /* ── vista formulario ── */
  if (view === "form") {
    return (
      <ProductForm
        item={editItem}
        onBack={() => { setView("list"); setEditItem(null); }}
        onSaved={() => load()}
        toast={toast}
      />
    );
  }

  /* ── vista lista ── */
  return (
    <div className="pa-section">
      <div className="pa-section-bar">
        <input
          className="pa-search"
          placeholder="Buscar en Productos…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button
          className="pa-btn pa-btn--primary"
          onClick={() => { setEditItem(null); setView("form"); }}
        >
          + Añadir Productos
        </button>
      </div>

      {!loading && <p className="pa-count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>}
      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && <div className="pa-state"><span className="pa-state-icon">📭</span><span>No hay registros.</span></div>}

      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i}>
                  {section.columns.map((col) => (
                    <td key={col}>{row[col] ?? <span className="pa-empty">—</span>}</td>
                  ))}
                  <td className="pa-td-actions">
                    <button
                      className="pa-action pa-action--edit"
                      title="Editar"
                      onClick={() => { setEditItem(row); setView("form"); }}
                    >✏</button>
                    <button
                      className="pa-action pa-action--del"
                      title="Eliminar"
                      onClick={() => setConfirmDelete(row.id)}
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete !== null && (
        <Confirm
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
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
    } catch {
      toast("Error al cargar " + section.label, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [section.key]);

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${section.endpoint}${id}/`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error();
      toast("Registro eliminado.", "success");
      load();
    } catch {
      toast("No se pudo eliminar.", "error");
    }
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
    if (col === "url") return <a href={val} target="_blank" rel="noreferrer" className="pa-link">Ver imagen ↗</a>;
    if (col === "codigo_hex") return (
      <span className="pa-color-cell">
        <span className="pa-color-swatch" style={{ background: val }} />
        {val}
      </span>
    );
    return String(val);
  };

  return (
    <div className="pa-section">
      <div className="pa-section-bar">
        <input
          className="pa-search"
          placeholder={`Buscar en ${section.label}…`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="pa-btn pa-btn--primary" onClick={() => setModal("create")}>
          + Añadir {section.label}
        </button>
      </div>

      {!loading && <p className="pa-count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>}
      {loading && <div className="pa-state"><div className="pa-spinner" /><span>Cargando…</span></div>}
      {!loading && filtered.length === 0 && <div className="pa-state"><span className="pa-state-icon">📭</span><span>No hay registros.</span></div>}

      {!loading && filtered.length > 0 && (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                {section.columnLabels.map((l) => <th key={l}>{l}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i}>
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

      {modal && (
        <Modal
          section={section}
          item={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
          toast={toast}
        />
      )}

      {confirmDelete !== null && (
        <Confirm
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

/* ─── Secciones ──────────────────────────────────────────── */
const SECTIONS = [
  {
    key: "citas", label: "Citas", endpoint: `${BASE}/citas/`,
    fields: [
      { name: "identificacion", label: "Identificación", type: "text", required: true },
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "primerApellido", label: "Primer apellido", type: "text", required: true },
      { name: "segundoApellido", label: "Segundo apellido", type: "text" },
      { name: "correo", label: "Correo", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text", required: true },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "descripcion", label: "Motivo", type: "textarea" },
    ],
    columns: ["identificacion", "nombre", "primerApellido", "correo", "fecha", "hora"],
    columnLabels: ["Identificación", "Nombre", "Apellido", "Correo", "Fecha", "Hora"],
  },
  {
    key: "categorias", label: "Categorías", endpoint: `${BASE}/categorias/`,
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
    columns: ["nombre", "descripcion"],
    columnLabels: ["Nombre", "Descripción"],
  },
  {
    key: "colores", label: "Color productos", endpoint: `${BASE}/colores/`,
    fields: [
      { name: "nombre", label: "Nombre del color", type: "text", required: true },
      { name: "codigo_hex", label: "Código hex", type: "text" },
    ],
    columns: ["nombre", "codigo_hex"],
    columnLabels: ["Nombre", "Código hex"],
  },
  {
    key: "productos", label: "Productos", endpoint: `${BASE}/productos/`,
    isProducto: true, fields: [],
    columns: ["nombre", "precio", "categoria", "stock"],
    columnLabels: ["Nombre", "Precio", "Categoría", "Stock"],
  },
  {
    key: "imagenes", label: "Imagen productos", endpoint: `${BASE}/imagenproducto/`,
    fields: [
      { name: "producto", label: "Producto (ID)", type: "number", required: true },
      { name: "url", label: "URL de imagen", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "text" },
    ],
    columns: ["producto", "url", "descripcion"],
    columnLabels: ["Producto", "URL", "Descripción"],
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
  const { toasts, add, remove } = useToast();
  const current = SECTIONS.find((s) => s.key === active);

  return (
    <>
      <Toasts toasts={toasts} remove={remove} />
      <div className="pa-layout">
        <aside className="pa-sidebar">
          <div className="pa-logo">⚙ Admin</div>
          <nav className="pa-nav">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                className={`pa-nav-item ${active === s.key ? "pa-nav-item--active" : ""}`}
                onClick={() => setActive(s.key)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <button
            onClick={onLogout}
            style={{
              marginTop: "auto", width: "100%", padding: "10px 16px",
              background: "transparent", border: "none", borderTop: "1px solid #333",
              color: "#aaa", fontSize: 12, cursor: "pointer", textAlign: "left",
            }}
          >
            ⎋ Cerrar sesión
          </button>
        </aside>

        <main className="pa-main">
          <div className="pa-main-header">
            <h1>{current.label}</h1>
          </div>

          {current.isProducto
            ? <ProductSection key={active} section={current} toast={add} />
            : <SectionTable key={active} section={current} toast={add} />
          }
        </main>
      </div>
    </>
  );
};



/* ─── App root con auth ──────────────────────────────────── */
const App = () => {
  const [authed, setAuthed] = useState(() => !!getAuthHeader());

  const handleLogin = (user) => setAuthed(true);

  const handleLogout = () => {
    clearAuthHeader();
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={handleLogin} />;
  return <PanelAdmin onLogout={handleLogout} />;
};

export default App;

