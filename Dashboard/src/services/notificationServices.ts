import { api } from "@/hooks/api";

// Função para buscar pagamentos
export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

