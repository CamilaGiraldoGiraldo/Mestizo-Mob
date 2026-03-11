import React, { useState } from "react";
import "./AgendarCita.css";

const AgendarCita = () => {

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        telefono: "",
        fecha: "",
        hora: "",
        mensaje: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const enviarCita = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/citas/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                alert("Solicitud de cita enviada correctamente");
            } else {
                alert("Error al enviar la cita");
            }

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="cita-container">

            <h2>Agendar Cita</h2>

            <form className="cita-form" onSubmit={enviarCita}>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                />

                <input
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="mensaje"
                    placeholder="Mensaje adicional"
                    value={form.mensaje}
                    onChange={handleChange}
                />

                <button type="submit">Agendar Cita</button>

            </form>

        </div>
    );
};

export default AgendarCita;