import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  studentName: string;
  parcelaNumero: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

const mockPayments: Payment[] = [
  {
    id: "1",
    studentName: "João Silva",
    parcelaNumero: 3,
    amount: 25000,
    dueDate: "2025-10-18",
    status: "pending",
  },
  {
    id: "2",
    studentName: "Maria Santos",
    parcelaNumero: 2,
    amount: 30000,
    dueDate: "2025-10-10",
    status: "overdue",
  },
  {
    id: "3",
    studentName: "Pedro Costa",
    parcelaNumero: 4,
    amount: 25000,
    dueDate: "2025-10-20",
    status: "pending",
  },
];

const statusConfig = {
  paid: {
    label: "Pago",
    color: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  pending: {
    label: "A vencer",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  overdue: {
    label: "Atrasado",
    color: "bg-danger text-danger-foreground",
    icon: AlertCircle,
  },
};

export function PaymentAlert() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Alertas de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockPayments.map((payment) => {
          const config = statusConfig[payment.status];
          const Icon = config.icon;

          return (
            <div
              key={payment.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{payment.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  Parcela {payment.parcelaNumero} • {payment.amount.toLocaleString()} AKZ
                </p>
              </div>
              <div className="text-right">
                <Badge className={config.color}>{config.label}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{payment.dueDate}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
