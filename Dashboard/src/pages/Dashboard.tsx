import { Users, BookOpen, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PaymentAlert } from "@/components/dashboard/PaymentAlert";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do centro de formação
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Estudantes Ativos"
          value={342}
          description="8 novos esta semana"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Cursos Disponíveis"
          value={18}
          description="3 turmas abertas"
          icon={BookOpen}
          variant="success"
        />
        <StatsCard
          title="Receita Mensal"
          value="8,5M AKZ"
          description="Outubro 2025"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Pagamentos Pendentes"
          value={23}
          description="12 vencem esta semana"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Matrículas por Mês</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              [Gráfico de linha - será implementado]
            </div>
          </div>
        </div>
        
        <PaymentAlert />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Próximas Aulas</h3>
          <div className="space-y-3">
            {[
              { course: "Gestão de Projetos", time: "09:00", room: "Sala A1" },
              { course: "Marketing Digital", time: "14:00", room: "Sala B2" },
              { course: "Contabilidade Básica", time: "16:30", room: "Sala C3" },
            ].map((aula, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{aula.course}</p>
                  <p className="text-xs text-muted-foreground">{aula.room}</p>
                </div>
                <Badge variant="outline">{aula.time}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { action: "Nova matrícula", student: "Ana Pereira", time: "Há 5 min" },
              { action: "Pagamento recebido", student: "Carlos Nunes", time: "Há 1 hora" },
              { action: "Curso concluído", student: "Sofia Lima", time: "Há 2 horas" },
            ].map((atividade, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
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
