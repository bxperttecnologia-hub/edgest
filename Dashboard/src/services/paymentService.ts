import { api } from "@/hooks/api";

// Função para buscar pagamentos
export const getPayments = async (status?: string) => {
  const params: any = {};
  if (status) params.status = status;

  // axios usa `params` para query string
  const { data } = await api.get("/payments", { params });
  return data;
};

// Função para buscar pagamentos
export const getEnrollments = async (status?: string) => {
  const params: any = {};
  if (status) params.status = status;

  // axios usa `params` para query string
  const { data } = await api.get("/payments/enrollments", { params });
  return data;
};


// Função para marcar pagamento como pago
export const payPayment = async (id: number | string, method?: string, transaction_reference?: string) => {
  const { data } = await api.post(`/payments/pay/${id}`, { method, transaction_reference });
  return data;
};

export const exportPayments = async () => {
  const res = await api.get("/payments/export", {
    responseType: "blob",
  });

  // criar URL temporária do ficheiro
  const url = window.URL.createObjectURL(new Blob([res.data]));

  const link = document.createElement("a");
  link.href = url;

  // nome do ficheiro
  link.setAttribute(
    "download",
    `relatorio_pagamentos_${new Date().toISOString().split("T")[0]}.xlsx`,
  );

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export const invoiceService = {
  /**
   * Gera uma fatura PDF para um pagamento específico
   * @param paymentId ID do pagamento
   * @returns URL do PDF gerado
   */
  generateInvoice: async (paymentId: number | string): Promise<string> => {
    try {
      if (!paymentId) {
        throw new Error("paymentId é obrigatório");
      }

      const { data } = await api.post(
        `/payments/generateInvoice/${paymentId}`
      );

      const invoiceUrl = data?.invoiceUrl || data?.url;

      if (!invoiceUrl) {
        throw new Error("Resposta inválida: invoiceUrl não encontrada");
      }

      console.log(invoiceUrl)
      return invoiceUrl;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao gerar fatura";

      console.error("invoiceService.generateInvoice:", message);

      throw new Error(message);
    }
  },
};

// ======================================================
// REGISTRAR PAGAMENTO
// ======================================================
export const registerPayment = async (payload: {
  enrollment_id: number;
  student_id: number;
  amount: number;
  status: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      "/payments/pay",
      payload, // ✅ aqui está a correção
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  } catch (error: any) {
    console.error("registerPayment error:", error);

    throw (
      error?.response?.data || {
        success: false,
        message: "Erro ao registrar pagamento",
      }
    );
  }
};

// ======================================================
// GERAR FATURA (BULK)
// ======================================================
export const generateBulkInvoice = async (payload: {
  studentId: number;
  enrollments: number[];
  total: number;
}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post("/invoices/bulk-create", payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};