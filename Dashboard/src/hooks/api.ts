import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Cria uma instância do Axios já configurada
export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});