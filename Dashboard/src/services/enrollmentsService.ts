const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");


export const getTeachers = async (playLoad) => {
  const res = await fetch(
    `${apiUrl}/enrollments/teachers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(playLoad)
    }
  );

    const data = await res.json();
    if (!res) false;
    return data;
};

export const getClasses = async () => {
  const res = await fetch(
    `${apiUrl}/enrollments/classes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar instrutores");
  }

  return res.json();
};


export const addTeacher = async (payload) => {
  const res = await fetch(`${apiUrl}/enrollments/addTeacher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erro ao adicionar instrutor");
  }

  return res.json();
};

export const addClasses = async (payload) => {
  const res = await fetch(`${apiUrl}/enrollments/addClass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erro ao adicionar Turma");
  }

  return res.json();
};

export const addEnrollment = async (payload) => {
  try {
    const res = await fetch(`${apiUrl}/enrollments/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json(); // pega o JSON do servidor

    if (!res.ok) {
      // lança erro com a mensagem retornada da API
      throw new Error(data?.error || "Erro ao adicionar Turma");
    }

    return data;
  } catch (err: any) {
    console.error("addEnrollment error:", err);
    throw new Error(err.message || "Erro ao adicionar Turma");
  }
};


export const getStudentEnrollments = async (id) => {
  const res = await fetch(
    `${apiUrl}/enrollments/studentEnrollment/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

    const data = await res.json();
    if (!res) false;
    return data;
};

export const deleteStudentEnrollments = async (id) => {
  const res = await fetch(
    `${apiUrl}/enrollments/delete-student-enrollment/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

    const data = await res.json();
    if (!res) false;
    return data;
};
