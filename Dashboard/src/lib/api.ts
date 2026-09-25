import axios from "axios";

// Base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

// REQUEST INTERCEPTOR (envia token automaticamente)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (tratamento global)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        // Token inválido ou expirado
        if (status === 401) {
            console.warn("Sessão expirada");

            localStorage.removeItem("token");

            // Redirecionar para login
            window.location.href = "/login";
        }

        // Outros erros
        if (status === 500) {
            console.error("Erro interno do servidor");
        }

        return Promise.reject(error);
    }
);

export default api;