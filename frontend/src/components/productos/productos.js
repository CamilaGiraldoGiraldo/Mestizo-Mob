import axios from "axios";

const API_URL = "https://mestizo-mob-3.onrender.com/api/productos";

export const getProductos = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error("Error al traer productos:", error);
    return [];
  }
};

export const getCategorias = async () => {
  try {
    const response = await axios.get("https://mestizo-mob-3.onrender.com/api/categorias");
    return response.data;
  } catch (error) {
    console.error("Error al traer categorías:", error);
    return [];
  }
};
