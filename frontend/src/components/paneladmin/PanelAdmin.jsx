import React, { useState, useEffect } from "react";
import "./PanelAdmin.css";

const BASE = "http://127.0.0.1:8000/api";

// ── Secciones ────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "citas",
    label: "Citas",
    endpoint: `${BASE}/citas/`,
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
    key: "categorias",
    label: "Categorías",
    endpoint: `${BASE}/categorias/`,
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
    columns: ["nombre", "descripcion"],
    columnLabels: ["Nombre", "Descripción"],
  },
  {
    key: "colores",
    label: "Color productos",
    endpoint: `${BASE}/colores/`,
    fields: [
      { name: "nombre", label: "Nombre del color", type: "text", required: true },
      { name: "codigo_hex", label: "Código hex", type: "text" },
    ],
    columns: ["nombre", "codigo_hex"],
    columnLabels: ["Nombre", "Código hex"],
  },
  {
    key: "productos",
    label: "Productos",
    endpoint: `${BASE}/productos/`,
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
      { name: "precio", label: "Precio", type: "number", required: true },
      { name: "categoria", label: "Categoría (ID)", type: "number" },
      { name: "color", label: "Color (ID)", type: "number" },
    ],
    columns: ["nombre", "precio", "categoria", "color"],
    columnLabels: ["Nombre", "Precio", "Categoría", "Color"],
  },
  {
    key: "imagenes",
    label: "Imagen productos",
    endpoint: `${BASE}/imagenproducto/`,
    fields: [
      { name: "producto", label: "Producto (ID)", type: "number", required: true },
      { name: "url", label: "URL de imagen", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "text" },
    ],
    columns: ["producto", "url", "descripcion"],
    columnLabels: ["Producto", "URL", "Descripción"],
  },
  {
    key: "usuarios",
    label: "Usuarios",
    endpoint: `${BASE}/usuarios/`,
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

// ── Toast ────────────────────────────────────────────────────
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
  <div className="pa-toast-wrap">
    {toasts.map((t) => (
      <div key={t.id} className={`pa-toast pa-toast--${t.type}`} onClick={() => remove(t.id)}>
        <span className="pa-toast-icon">{t.type === "success" ? "✓" : "✕"}</span>
        <span>{t.message}</span>
        <div className="pa-toast-bar" />
      </div>
    ))}
  </div>
);

// ── Modal crear / editar ─────────────────────────────────────
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
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data === "object" ? Object.values(data).flat().join(" · ") : "Error al guardar.";
        toast(msg, "error");
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

// ── Confirmación eliminar ────────────────────────────────────
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

// ── Tabla por sección ────────────────────────────────────────
const SectionTable = ({ section, toast }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(section.endpoint);
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
      const res = await fetch(`${section.endpoint}${id}/`, { method: "DELETE" });
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

      {loading && (
        <div className="pa-state">
          <div className="pa-spinner" />
          <span>Cargando…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="pa-state">
          <span className="pa-state-icon">📭</span>
          <span>No hay registros.</span>
        </div>
      )}

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

// ── Panel principal ──────────────────────────────────────────
const PanelAdmin = () => {
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
        </aside>
        <main className="pa-main">
          <div className="pa-main-header">
            <h1>{current.label}</h1>
          </div>
          <SectionTable key={active} section={current} toast={add} />
        </main>
      </div>
    </>
  );
};

export default PanelAdmin;
