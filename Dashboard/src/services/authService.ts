// src/services/authService.ts
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token"); 


export const verifyToken = async (): Promise<boolean> => {
  try {

    if (!token) return false;

    const response = await fetch(`${apiUrl}/auth/checkToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn("❌ Token inválido ou sessão expirada");
      return false;
    }

    const data = await response.json();
    return Boolean(data?.valid == 1 ? true : false);
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return false;
  }
};
