const apiUrl = import.meta.env.VITE_API_URL;
import { api } from "@/hooks/api";
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

    // =========================================
    // LER COMO TEXTO PRIMEIRO (SEGURANÇA)
    // =========================================
    const text = await res.text();

    let data = null;

    // =========================================
    // TENTAR CONVERTER PARA JSON
    // =========================================
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error("Resposta inválida do backend:", text);

      throw new Error(
        "Resposta inválida do servidor (não é JSON)",
      );
    }

    // =========================================
    // TRATAR ERROS HTTP
    // =========================================
    if (!res.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Erro ao adicionar Turma",
      );
    }

    return data;
  } catch (err) {
    console.error("addEnrollment error:", err);

    throw new Error(
      err.message || "Erro ao adicionar Turma",
    );
  }
};


export const getStudentEnrollments = async (id) => {
  try {
    const res = await fetch(
      `${apiUrl}/enrollments/studentEnrollment/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Erro ao buscar matrículas",
      };
    }

    return {
      success: true,
      data: data?.data,
    };
  } catch (error) {
    console.error("getStudentEnrollments error:", error);

    return {
      success: false,
      message: "Erro de rede ou servidor",
    };
  }
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


export const generateCertificate = async (id: number | string): Promise<string> => {
  try {
    if (!id) {
      throw new Error("enrollmentId é obrigatório");
    }

    const { data } = await api.post(
      `/enrollments/generateCertificate/${id}`
    );

    const certificateUrl = data?.certificateUrl || data?.url;

    if (!certificateUrl) {
      throw new Error("Resposta inválida: CertificateUrl não encontrada");
    }

    return certificateUrl;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Erro ao gerar fatura";

    console.error("invoiceService.generateInvoice:", message);

    throw new Error(message);
  }
};
