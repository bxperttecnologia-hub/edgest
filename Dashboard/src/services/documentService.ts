const apiUrl = import.meta.env.VITE_API_URL;

export const getDocuments = async (payload = {}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${apiUrl}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();

      console.log(text);

      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.log("Erro getDocuments:", error);
    return [];
  }
};