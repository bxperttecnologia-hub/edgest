import {
  Download,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useReports } from "@/hooks/useReports";
import { useExportReport } from "@/hooks/useExportReport";

const reportCategories = [
  {
    id: "financial",
    title: "Relatórios Financeiros",
    description: "Análises de receitas, despesas e fluxo de caixa",
    icon: DollarSign,
    reports: [
      { name: "Receitas Mensais" },
      { name: "Pagamentos Atrasados" },
      { name: "Previsão de Receitas" },
      { name: "Extrato por Curso" },
    ],
  },
  {
    id: "academic",
    title: "Relatórios Académicos",
    description: "Desempenho e progressão dos estudantes",
    icon: Users,
    reports: [
      { name: "Taxa de Aprovação" },
      { name: "Frequência de Presenças" },
      { name: "Desempenho por Módulo" },
      { name: "Diplomas Emitidos" },
    ],
  },
  {
    id: "enrollment",
    title: "Relatórios de Matrícula",
    description: "Análise de inscrições e tendências",
    icon: TrendingUp,
    reports: [
      { name: "Matrículas por Período" },
      { name: "Cursos Mais Procurados" },
      { name: "Taxa de Conversão" },
      { name: "Ocupação de Turmas" },
    ],
  },
  {
    id: "operational",
    title: "Relatórios Operacionais",
    description: "Gestão e organização académica",
    icon: Calendar,
    reports: [
      { name: "Agenda de Aulas" },
      { name: "Utilização de Salas" },
      { name: "Carga Horária de Formadores" },
      { name: "Documentos Pendentes" },
    ],
  },
];

export default function Reports() {
  const { data, loading } = useReports();
  const { exportReport } = useExportReport();

  const handleExport = async (type: string) => {
    await exportReport(type);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        A carregar relatórios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análises e exportações de dados do sistema
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => alert("Em breve: relatório customizado")}
        >
          <FileText className="h-4 w-4" />
          Relatório Personalizado
        </Button>
      </div>

      {/* CARDS */}
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
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>

                  {/* 🔥 EXPORT GLOBAL DA CATEGORIA */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(category.id)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
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

                        {/* 🔥 DADOS REAIS (se quiseres mostrar preview) */}
                        <p className="text-xs text-muted-foreground mt-1">
                          {data?.[category.id]?.length || 0} registros
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleExport(category.id)}
                      >
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
