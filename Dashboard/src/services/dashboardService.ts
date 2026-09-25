const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export async function getDashboard() {
    const res = await fetch(`${apiUrl}/reports`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!res.ok) {
        throw new Error("Erro ao carregar dashboard");
    }

    const data = await res.json();

    return data; // ou data.data se realmente vier encapsulado
}