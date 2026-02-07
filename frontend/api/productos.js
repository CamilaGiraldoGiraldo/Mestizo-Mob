import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/productos/";

export const getProductos = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error("Error al traer productos:", error);
    return null;
  }
};

export const getCategorias = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/categorias/"); // Suponiendo que tengas endpoint de categorías
    return response.data;
  } catch (error) {
    console.error("Error al traer categorías:", error);
    return [];
  }
};
