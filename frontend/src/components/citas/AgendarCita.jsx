import React, { useState, useEffect } from "react";
import "./AgendarCita.css";

// ── Toast component ──────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div className="toast-wrapper">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`toast toast--${t.type}`}
        onClick={() => removeToast(t.id)}
      >
        <span className="toast-icon">
          {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "!"}
        </span>
        <span className="toast-msg">{t.message}</span>
        <div className="toast-bar" />
      </div>
    ))}
  </div>
);

// ── Hook ─────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast };
};

// ── Main component ────────────────────────────────────────────
const AgendarCita = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    identificacion: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    telefono: "",
    fecha: "",
    hora: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buscarUsuario = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(
        `http://192.168.1.8/api/citas/buscar-usuario/?identificacion=${id}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.nombre) {
        setForm((prev) => ({
          ...prev,
          nombre: data.nombre || "",
          primerApellido: data.primerApellido || "",
          segundoApellido: data.segundoApellido || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
        }));
        addToast("Usuario encontrado y datos cargados.", "success", 3000);
      }
    } catch (error) {
      console.error("Error buscando usuario:", error);
    }
  };

  const enviarCita = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://192.168.1.8/api/citas/crear/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg =
          typeof data === "object"
            ? Object.values(data).flat().join(" · ")
            : "Error al registrar la cita.";
        addToast(errMsg, "error", 6000);
        return;
      }
      addToast("¡Cita registrada correctamente!", "success");
      setForm({
        identificacion: "",
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        correo: "",
        telefono: "",
        fecha: "",
        hora: "",
        descripcion: "",
      });
    } catch (error) {
      console.error("Error conexión:", error);
      addToast("No se pudo conectar con el servidor.", "error");
    }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="cita-container">
        <h2>Agendar cita</h2>

        <form onSubmit={enviarCita} className="cita-form">
          <input
            name="identificacion"
            placeholder="Identificación"
            value={form.identificacion}
            onChange={(e) => {
              handleChange(e);
              buscarUsuario(e.target.value);
            }}
            required
          />
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="primerApellido"
            placeholder="Primer apellido"
            value={form.primerApellido}
            onChange={handleChange}
            required
          />
          <input
            name="segundoApellido"
            placeholder="Segundo apellido"
            value={form.segundoApellido}
            onChange={handleChange}
          />
          <input
            name="correo"
            type="email"
            placeholder="Correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
          <input
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
          />
          <input
            name="hora"
            type="time"
            value={form.hora}
            onChange={handleChange}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Motivo de la cita"
            value={form.descripcion}
            onChange={handleChange}
          />
          <button type="submit">Agendar cita</button>
        </form>
      </div>
    </>
  );
};

export default AgendarCita;
