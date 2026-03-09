import { api } from "@/hooks/api";

// Função para buscar pagamentos
export const getPayments = async (status?: string) => {
  const params: any = {};
  if (status) params.status = status;

  // axios usa `params` para query string
  const { data } = await api.get("/payments", { params });
  return data;
};


// Função para marcar pagamento como pago
export const payPayment = async (id: number | string, method?: string, transaction_reference?: string) => {
  const { data } = await api.post(`/payments/pay/${id}`, { method, transaction_reference });
  return data;
};

// Função para marcar pagamento como pago
export const exportPayments = async () => {
  const { data } = await api.get("/payments/export");
  return data;
};


export const invoiceService = {
  /**
   * Gera uma fatura PDF para um pagamento específico
   * @param paymentId ID do pagamento
   * @returns URL do PDF gerado
   */
  generateInvoice: async (paymentId: number | string): Promise<string> => {
    try {
      const { data } = await api.post(`/payments/generateInvoice/${paymentId}`);
      if (data && data.invoiceUrl) return data.invoiceUrl;
      throw new Error("Erro ao gerar fatura: resposta inválida");
    } catch (err: any) {
      console.error("invoiceService.generateInvoice:", err.response?.data || err.message);
      throw err;
    }
  },
};
