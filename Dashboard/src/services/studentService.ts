import { api } from "@/hooks/api";
const apiUrl = import.meta.env.VITE_API_URL;

export const addStudent = async (playLoad) => {
  let token = localStorage.getItem("token");

  const formData = new FormData();

  // =========================
  // TEXT FIELDS
  // =========================
  Object.keys(playLoad).forEach((key) => {
    if (key !== "photo" && key !== "document") {
      formData.append(key, playLoad[key]);
    }
  });

  // =========================
  // FILES
  // =========================
  if (playLoad.photo) {
    formData.append("photo", playLoad.photo);
  }

  if (playLoad.document) {
    formData.append("document", playLoad.document);
  }

  const res = await fetch(apiUrl + "/students/add", {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // NÃO colocar Content-Type aqui (browser define boundary)
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw data;

  return data;
};

export const upDateStudent = async (playLoad) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  Object.keys(playLoad).forEach((key) => {
    if (key !== "photo" && key !== "document") {
      formData.append(key, playLoad[key] ?? "");
    }
  });

  if (playLoad.photo instanceof File) {
    formData.append("photo", playLoad.photo);
  }

  if (playLoad.document instanceof File) {
    formData.append("document", playLoad.document);
  }

  const res = await fetch(`${apiUrl}/students/update/${playLoad?.id}`, {
    method: "PUT",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Backend não retornou JSON válido");
  }

  if (!res.ok) throw data;

  return data;
};

export const deleteStudent = async (id) => {
  if (id) {
    const res = await fetch(`${apiUrl}/students/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res) false;
    return data;
  }

  return false;
};

export const getStudents = async (playLoad = {}) => {
  let token = localStorage.getItem("token");
  const res = await fetch(apiUrl + "/students/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(playLoad),
  });
  const data = await res.json();
  if (!res) false;
  return data?.students;
}

export const generateContract = async (id: number | string) => {
  try {
    if (!id) {
      throw new Error("paymentId é obrigatório");
    }

    const { data } = await api.get(
      `/students/generateContract/${id}`
    );

    const contractUrl = data?.contractUrl || data?.url;

    if (!contractUrl) {
      throw new Error("Resposta inválida: invoiceUrl não encontrada");
    }

    return contractUrl;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Erro ao gerar fatura";

    console.error("studentService.generateContrct:", message);

    throw new Error(message);
  }
};

