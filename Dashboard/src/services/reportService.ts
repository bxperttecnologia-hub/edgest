import { api } from "@/hooks/api";
const token = localStorage.getItem("token");


export const getFinancialReports = async () => {
  const { data } = await api.get("/reports/financial");
  return data;
};

export const exportFinancialReport = async () => {
  const res = await api.get("/reports/financial/export", {
    responseType: "blob",
  });

  return res.data;
};

// 🔹 Académico
export const getAcademicReports = async () => {
  const { data } = await api.get("/reports/academic");
  return data;
};

export const exportAcademicReport = async () => {
  const res = await api.get("/reports/academic/export", {
    responseType: "blob",
  });

  return res.data;
};

// 🔹 Matrículas
export const getEnrollmentReports = async () => {
  const { data } = await api.get("/reports/enrollment");
  return data;
};

export const exportEnrollmentReport = async () => {
  const res = await api.get("/reports/enrollment/export", {
    responseType: "blob",
  });

  return res.data;
};

// 🔹 Operacional
export const getOperationalReports = async () => {
  const { data } = await api.get("/reports/operational");
  return data;
};

export const exportOperationalReport = async () => {
  const res = await api.get("/reports/operational/export", {
    responseType: "blob",
  });

  return res.data;
};