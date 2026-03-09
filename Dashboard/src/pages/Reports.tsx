import { Download, FileText, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCategories = [
  {
    id: "financial",
    title: "Relatórios Financeiros",
    description: "Análises de receitas, despesas e fluxo de caixa",
    icon: DollarSign,
    reports: [
      { name: "Receitas Mensais", description: "Detalhamento de pagamentos recebidos" },
      { name: "Pagamentos Atrasados", description: "Controlo de inadimplência" },
      { name: "Previsão de Receitas", description: "Projeção baseada em matrículas" },
      { name: "Extrato por Curso", description: "Receitas agrupadas por curso" },
    ],
  },
  {
    id: "academic",
    title: "Relatórios Académicos",
    description: "Desempenho, presenças e progressão dos estudantes",
    icon: Users,
    reports: [
      { name: "Taxa de Aprovação", description: "Análise por curso e turma" },
      { name: "Frequência de Presenças", description: "Controlo de assiduidade" },
      { name: "Desempenho por Módulo", description: "Notas e avaliações" },
      { name: "Diplomas Emitidos", description: "Histórico de conclusões" },
    ],
  },
  {
    id: "enrollment",
    title: "Relatórios de Matrícula",
    description: "Análise de inscrições e tendências de procura",
    icon: TrendingUp,
    reports: [
      { name: "Matrículas por Período", description: "Evolução temporal de inscrições" },
      { name: "Cursos Mais Procurados", description: "Ranking de popularidade" },
      { name: "Taxa de Conversão", description: "De interessados a matriculados" },
      { name: "Ocupação de Turmas", description: "Análise de vagas disponíveis" },
    ],
  },
  {
    id: "operational",
    title: "Relatórios Operacionais",
    description: "Gestão de recursos e calendário académico",
    icon: Calendar,
    reports: [
      { name: "Agenda de Aulas", description: "Calendário completo por turma" },
      { name: "Utilização de Salas", description: "Ocupação de espaços físicos" },
      { name: "Carga Horária de Formadores", description: "Distribuição de aulas" },
      { name: "Documentos Pendentes", description: "Controlo administrativo" },
    ],
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análises e exportações de dados do sistema
          </p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Relatório Personalizado
        </Button>
      </div>

      <div className="grid gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {category.reports.map((report) => (
                    <div
                      key={report.name}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {report.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Gerar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
