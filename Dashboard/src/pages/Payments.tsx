import { useState, useEffect, useMemo } from "react";
import { DollarSign, Search, Filter, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPayments, payPayment, invoiceService, exportPayments } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import { leadingZero } from "@/services/auxiliarFunctions";


const statusConfig = {
  paid: { label: "Pago", className: "bg-success text-success-foreground", icon: "🟢" },
  pending: { label: "Pendente", className: "bg-warning text-warning-foreground", icon: "🟡" },
  overdue: { label: "Atrasado", className: "bg-destructive text-destructive-foreground", icon: "🔴" },
};

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();


  // Busca pagamentos da API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInvoice = async (paymentId: number) => {
    try {
      const url = await invoiceService.generateInvoice(paymentId);
      window.open(url, "_blank"); // abre a fatura em nova aba
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao gerar fatura",
        description: err.response?.data?.message || err.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handlePay = async (id: number) => {
    try {

      const match = payments.find(p => p?.id == id);
      if (match) {

        const res = await payPayment(
          match?.id,
          match?.method,
          match?.transaction_reference);

        if (res) {
          toast({
            title: "Válidar pagamento",
            description: "Pagamento realizado com sucesso!",
            variant: "default"
          })
          fetchPayments()
        } else {
          toast({
            title: "Válidar pagamento",
            description: "Erro ao realizar pagamento!",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Válidar pagamento",
          description: "ID do pagamento não encontrado!",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao gerar fatura",
        description: err.response?.data?.message || err.message || "Tente novamente",
        variant: "destructive",
      });
    }
  }

  // Filtra pagamentos
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(
      (p) =>
        p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, payments]);

  const handleExport = async () => {
    const res = await exportPayments();

    window.open(res, "_blank");
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">Controlo financeiro e gestão de mensalidades</p>
        </div>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar por estudante ou curso..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Estudante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment, index) => {
              const statusInfo = statusConfig[payment.status];
              const isOverdue = payment.status === "overdue";

              return (
                <TableRow key={payment.id} className="hover:bg-accent/50">
                  <TableCell>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    #<b>{leadingZero(payment.id, 4)}</b>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">{payment.studentNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.course}</TableCell>
                  <TableCell>
                    <span className="font-medium">{payment.parcelaNumber}/{payment.parcelasTotal}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isOverdue && <AlertCircle className="h-3 w-3 text-destructive" />}
                      <span className={isOverdue ? "text-destructive" : ""}>
                        {new Date(payment.dueDate).toLocaleDateString("pt-AO")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {payment.amount.toLocaleString()} AKZ
                  </TableCell>
                  <TableCell>
                    <Badge className={statusInfo.className}>
                      {statusInfo.icon} {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        payment.status === "paid"
                          ? () => handleInvoice(payment.id) // abre fatura se já pago
                          : () => handlePay(payment.id) // registra pagamento se pendente
                      }
                    >
                      {payment.status === "paid" ? "Factura" : "Válidar Pagamento"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
