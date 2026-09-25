import { Users, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PaymentAlert } from "@/components/dashboard/PaymentAlert";
import { Badge } from "@/components/ui/badge";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

// meses
const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function Dashboard() {
  const { data, loading } = useDashboard();
  const dataChart = data?.data;

  // -------------------------
  // 📊 GRÁFICO MATRÍCULAS
  // -------------------------
  const enrollmentsChart = {
    labels:
      dataChart?.enrollmentsByMonth?.map((d: any) => months[d.month - 1]) || [],
    datasets: [
      {
        label: "Matrículas",
        data: dataChart?.enrollmentsByMonth?.map((d: any) => d.total) || [],
        borderColor: "#6f2dbd",
        backgroundColor: "rgba(111,45,189,0.2)",
        tension: 0.4,
      },
    ],
  };

  // -------------------------
  // 💰 GRÁFICO RECEITA
  // -------------------------
  const revenueChart = {
    labels: dataChart?.revenueByMonth?.map((d: any) => months[d.month - 1]) || [],
    datasets: [
      {
        label: "Receita (AKZ)",
        data: dataChart?.revenueByMonth?.map((d: any) => d.total) || [],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do centro de formação
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Estudantes Ativos"
          value={dataChart?.students ?? 0}
          description="Atualizado em tempo real"
          icon={Users}
          variant="default"
        />

        <StatsCard
          title="Cursos Disponíveis"
          value={dataChart?.courses ?? 0}
          description="Ativos no sistema"
          icon={BookOpen}
          variant="success"
        />

        <StatsCard
          title="Receita Mensal"
          value={`${dataChart?.revenue ?? 0} AKZ`}
          description="Total arrecadado"
          icon={TrendingUp}
          variant="success"
        />

        <StatsCard
          title="Pagamentos Pendentes"
          value={dataChart?.pendingPayments ?? 0}
          description="Em atraso ou por pagar"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* CHARTS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* MATRÍCULAS */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Matrículas por Mês</h3>

          <div className="h-[300px]">
            {loading ? <p>Carregando...</p> : <Line data={enrollmentsChart} />}
          </div>
        </div>

        <PaymentAlert />
      </div>

      {/* RECEITA + OUTROS */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>

          <div className="h-[280px]">
            {loading ? <p>Carregando...</p> : <Line data={revenueChart} />}
          </div>
        </div>

        {/* ATIVIDADE RECENTE */}
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>

          <div className="space-y-3">
            {[
              {
                action: "Nova matrícula",
                student: "Ana Pereira",
                time: "Há 5 min",
              },
              {
                action: "Pagamento recebido",
                student: "Carlos Nunes",
                time: "Há 1 hora",
              },
              {
                action: "Curso concluído",
                student: "Sofia Lima",
                time: "Há 2 horas",
              },
            ].map((atividade, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="text-sm font-medium">{atividade.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {atividade.student} • {atividade.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
