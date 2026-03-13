import React, { useState } from "react";
import "./AgendarCita.css";

const AgendarCita = () => {

const [form, setForm] = useState({
identificacion:"",
nombre:"",
primerApellido:"",
segundoApellido:"",
correo:"",
telefono:"",
direccion:"",
fecha:"",
hora:"",
descripcion:""
});

const handleChange = (e) => {

setForm({
...form,
[e.target.name]: e.target.value
});

};

const buscarUsuario = async (correo) => {

if(!correo) return;

try{

const res = await fetch(`http://127.0.0.1:8000/api/citas/buscar-usuario/?correo=${correo}`);

if(res.ok){

const data = await res.json();

setForm({
...form,
...data
});

}

}catch(error){

console.log(error);

}

};

const enviarCita = async (e) => {

e.preventDefault();

try{

const response = await fetch("http://127.0.0.1:8000/api/citas/",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
});

if(response.ok){

alert("Cita registrada correctamente");

setForm({
identificacion:"",
nombre:"",
primerApellido:"",
segundoApellido:"",
correo:"",
telefono:"",
direccion:"",
fecha:"",
hora:"",
descripcion:""
});

}else{

alert("Error al registrar cita");

}

}catch(error){

console.log(error);

}

};

return (

<div className="cita-container">

<h2>Agendar Cita</h2>

<form className="cita-form" onSubmit={enviarCita}>

<input
type="email"
name="correo"
placeholder="Correo"
value={form.correo}
onChange={handleChange}
onBlur={(e)=>buscarUsuario(e.target.value)}
required
/>

<input
type="text"
name="identificacion"
placeholder="Identificación"
value={form.identificacion}
onChange={handleChange}
required
/>

<input
type="text"
name="nombre"
placeholder="Nombre"
value={form.nombre}
onChange={handleChange}
required
/>

<input
type="text"
name="primerApellido"
placeholder="Primer apellido"
value={form.primerApellido}
onChange={handleChange}
required
/>

<input
type="text"
name="segundoApellido"
placeholder="Segundo apellido"
value={form.segundoApellido}
onChange={handleChange}
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
type="text"
name="direccion"
placeholder="Dirección"
value={form.direccion}
onChange={handleChange}
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
name="descripcion"
placeholder="Descripción"
value={form.descripcion}
onChange={handleChange}
/>

<button type="submit">
Agendar Cita
</button>

</form>

</div>

);

};

export default AgendarCita;