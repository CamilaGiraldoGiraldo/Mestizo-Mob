import axios from "axios";

const API_URL = "http://192.168.1.8:8000/api/productos";

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
    const response = await axios.get("http://192.168.1.8:8000/api/categorias");
    return response.data;
  } catch (error) {
    console.error("Error al traer categorías:", error);
    return [];
  }
};
