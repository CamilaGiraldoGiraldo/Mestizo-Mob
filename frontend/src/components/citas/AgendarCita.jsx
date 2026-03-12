import React, { useState } from "react";
import "./AgendarCita.css";

const AgendarCita = () => {

    const [form, setForm] = useState({
        identificacion: "",
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        fecha: "",
        hora: "",
        descripcion: ""
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const buscarUsuario = async (id) => {

        if (!id) return;

        try {

            const res = await fetch(`http://127.0.0.1:8000/api/citas/buscar-usuario/?identificacion=${id}`);

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            if (data && data.nombre) {

                setForm(prev => ({
                    ...prev,
                    nombre: data.nombre || "",
                    primerApellido: data.primerApellido || "",
                    segundoApellido: data.segundoApellido || "",
                    correo: data.correo || "",
                    telefono: data.telefono || "",
                    direccion: data.direccion || ""
                }));

            }

        } catch (error) {

            console.error("Error buscando usuario:", error);

        }
    };

    const enviarCita = async (e) => {

        e.preventDefault();

        try {

            const res = await fetch("http://127.0.0.1:8000/api/citas/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {

                console.log("Error backend:", data);
                alert("Error al registrar cita: " + JSON.stringify(data));
                return;

            }

            alert("Cita registrada correctamente");

            // limpiar formulario
            setForm({
                identificacion: "",
                nombre: "",
                primerApellido: "",
                segundoApellido: "",
                correo: "",
                telefono: "",
                direccion: "",
                fecha: "",
                hora: "",
                descripcion: ""
            });

        } catch (error) {

            console.error("Error conexión:", error);
            alert("No se pudo conectar con el servidor");

        }
    };

    return (

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
                    required
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
                    name="direccion"
                    placeholder="Dirección"
                    value={form.direccion}
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
                    required
                />

                <button type="submit">Agendar cita</button>

            </form>

        </div>
    );
};

export default AgendarCita;