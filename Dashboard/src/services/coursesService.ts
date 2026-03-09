const apiUrl = import.meta.env.VITE_API_URL;
let token = localStorage.getItem("token");

export const getCourse = async () => {
    const res = await fetch(apiUrl+"/courses/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),

      },
    });
    const data = await res.json();
    if (!res) console.log("Erro ao pegar cursos!");
    return data;
  };

export const addCourse = async (playload) => {
    const res = await fetch(apiUrl+"/courses/addCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(playload)
    });
    const data = await res.json();
    if (!res) console.log("Erro ao pegar cursos!");
    return data;
  };
