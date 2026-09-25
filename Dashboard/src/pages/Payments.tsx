import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Search,
  Filter,
  Download,
  AlertCircle,
  DotIcon,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPayments,
  payPayment,
  invoiceService,
  exportPayments,
  registerPayment,
  getEnrollments,
} from "@/services/paymentService";
import { generateContract } from "@/services/studentService";
import { useToast } from "@/hooks/use-toast";
import { leadingZero } from "@/services/auxiliarFunctions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusConfig = {
  paid: {
    label: "Pago",
    className: "bg-success text-success-foreground",
    icon: "🟢",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning text-warning-foreground",
    icon: "🟡",
  },
  overdue: {
    label: "Atrasado",
    className: "bg-destructive text-destructive-foreground",
    icon: "🔴",
  },
};

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const { toast } = useToast();

  // Busca pagamentos da API
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getEnrollments();
      setEnrollments(data?.data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Busca pagamentos da API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPayments(data?.data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (item: any) => {
    // se ainda não tem seleção
    if (selected.length === 0) {
      setSelected([item]);
      setSelectedStudentId(item.studentId);
      return;
    }

    // se já existe seleção, validar estudante
    if (item.studentId !== selectedStudentId) {
      toast({
        title: "Não permitido",
        description: "Só pode selecionar pagamentos do mesmo estudante.",
        variant: "destructive",
      });
      return;
    }

    // toggle normal
    const exists = selected.some((i) => i.id === item.id);

    if (exists) {
      const newSelected = selected.filter((i) => i.id !== item.id);

      setSelected(newSelected);

      // reset se vazio
      if (newSelected.length === 0) {
        setSelectedStudentId(null);
      }
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleInvoice = async (paymentId: number) => {
    try {
      const url = await invoiceService.generateInvoice(paymentId);
      window.open(url, "_blank"); // abre a fatura em nova aba
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao gerar fatura",
        description:
          err.response?.data?.message || err.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleBulkInvoice = async () => {
    if (selected.length === 0) return;

    const studentId = selected[0].studentId;

    const payload = {
      studentId,
      enrollments: selected.map((i) => i.enrollmentId),
      total: selected.reduce((sum, i) => sum + Number(i.amount), 0),
    };

    try {
      const res = await api.post("/invoices/bulk-create", payload);

      toast({
        title: "Sucesso",
        description: "Fatura gerada com sucesso",
      });

      setSelected([]);
      setSelectedStudentId(null);

      window.open(res.data.url, "_blank");
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao gerar fatura",
        variant: "destructive",
      });
    }
  };

  const handlePay = async (id: number) => {
    try {
      const match = payments.find((p) => p?.id == id);
      if (match) {
        const res = await payPayment(
          match?.id,
          match?.method,
          match?.transaction_reference,
        );

        if (res) {
          toast({
            title: "Válidar pagamento",
            description: "Pagamento realizado com sucesso!",
            variant: "default",
          });
          fetchPayments();
        } else {
          toast({
            title: "Válidar pagamento",
            description: "Erro ao realizar pagamento!",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Válidar pagamento",
          description: "ID do pagamento não encontrado!",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao gerar fatura",
        description:
          err.response?.data?.message || err.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  // Filtra pagamentos
  const filteredEnrollments = useMemo(() => {
    if (!searchTerm) return enrollments;
    return enrollments.filter(
      (p) =>
        p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, enrollments]);

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(
      (p) =>
        p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, payments]);

  const handleExport = async () => {
    try {
      const res = await exportPayments();

      window.open(res?.url, "_blank");
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const handleContract = async (id) => {
    try {
      const url = await generateContract(id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const handleRegisterPayment = async (item: any) => {
    try {
      const payload = {
        enrollment_id: item.id,
        student_id: item.studentId,
        amount: item.amount,
        status: "paid",
      };

      await registerPayment(payload);

      toast({
        title: "Sucesso",
        description: "Pagamento registado com sucesso",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao registar pagamento",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchEnrollments();
  }, [handleInvoice, handleRegisterPayment]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Controlo financeiro e gestão de mensalidades
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-5" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar
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

      <Tabs defaultValue="enrollments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrollments">Pagamentos</TabsTrigger>
          <TabsTrigger value="payments">Facturas</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-6">
          <div className="rounded-lg border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Inscrição</TableHead>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEnrollments.map((item, index) => {
                  return (
                    <TableRow
                      key={item.enrollmentId}
                      className="hover:bg-accent/50"
                    >
                      {/* INDEX */}
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.some((i) => i.id === item.id)}
                          onChange={() => toggleSelect(item)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>

                      {/* ENROLLMENT ID */}
                      <TableCell>
                        #<b>{leadingZero(item.id, 4)}</b>
                      </TableCell>

                      {/* STUDENT */}
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.studentNumber}
                          </p>
                        </div>
                      </TableCell>

                      {/* COURSE */}
                      <TableCell className="text-muted-foreground">
                        {item.course}
                      </TableCell>

                      {/* AMOUNT */}
                      <TableCell className="font-semibold text-primary">
                        {Number(item.amount).toLocaleString()} AKZ
                      </TableCell>

                      {/* STATUS FIXO */}
                      <TableCell>
                        <Badge className={[item.status]?.className}>
                          {statusConfig[item.status]?.label}
                        </Badge>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRegisterPayment(item)}
                        >
                          Registrar Pagamento
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="payments" className="space-y-6">
          <div className="rounded-lg border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPayments.map((item, index) => {
                  return (
                    <TableRow key={item.id} className="hover:bg-accent/50">
                      {/* INDEX */}
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.some((i) => i.id === item.id)}
                          onChange={() => toggleSelect(item)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>

                      {/* ENROLLMENT ID */}
                      <TableCell>
                        <b>{item.reference || "-"}</b>
                      </TableCell>

                      {/* STUDENT */}
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.studentNumber}
                          </p>
                        </div>
                      </TableCell>

                      {/* COURSE */}
                      <TableCell className="text-muted-foreground">
                        {item.course}
                      </TableCell>

                      {/* AMOUNT */}
                      <TableCell className="font-semibold text-primary">
                        {Number(item.amount).toLocaleString()} AKZ
                      </TableCell>

                      {/* STATUS FIXO */}
                      <TableCell>
                        <Badge className="bg-green-600 text-white">Pago</Badge>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative"
                            >
                              <MoreVertical className="h-5 w-5"/>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleInvoice(item.id)}
                              >
                                Ver Factura
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContract(item.studentId)}
                              >
                                Ver Contracto
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContract(item.studentId)}
                              >
                                Nota de crédito
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContract(item.studentId)}
                              >
                                Recibo
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
