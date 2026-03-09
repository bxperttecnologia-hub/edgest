import { useState } from "react";
import { Upload, Search, FileText, Download, Eye, Trash2, Filter } from "lucide-react";
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

const mockDocuments = [
  {
    id: "1",
    name: "Contrato_JoaoSilva_2025.pdf",
    type: "Contrato",
    student: "João Silva",
    course: "Gestão de Projetos",
    uploadDate: "2025-01-10",
    size: "245 KB",
    status: "approved",
  },
  {
    id: "2",
    name: "BI_MariaSantos.pdf",
    type: "Documento de Identidade",
    student: "Maria Santos",
    course: "Marketing Digital",
    uploadDate: "2025-01-15",
    size: "1.2 MB",
    status: "pending",
  },
  {
    id: "3",
    name: "Certificado_Conclusao_PedroCosta.pdf",
    type: "Certificado",
    student: "Pedro Costa",
    course: "Contabilidade Básica",
    uploadDate: "2024-12-20",
    size: "180 KB",
    status: "approved",
  },
  {
    id: "4",
    name: "ComprovativoPagamento_AnaFerreira.pdf",
    type: "Comprovativo",
    student: "Ana Ferreira",
    course: "Gestão de Projetos",
    uploadDate: "2025-01-18",
    size: "95 KB",
    status: "pending",
  },
];

const statusConfig = {
  approved: { label: "Aprovado", className: "bg-success text-success-foreground" },
  pending: { label: "Pendente", className: "bg-warning text-warning-foreground" },
  rejected: { label: "Rejeitado", className: "bg-destructive text-destructive-foreground" },
};

const documentTypes = [
  "Contrato",
  "Documento de Identidade",
  "Certificado",
  "Comprovativo",
  "Histórico Escolar",
  "Atestado",
  "Outros",
];

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de ficheiros e documentos dos estudantes
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Carregar Documento
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar documentos..."
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {documentTypes.slice(0, 4).map((type) => (
          <div
            key={type}
            className="p-4 rounded-lg border bg-card shadow-card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{type}</h3>
            </div>
            <p className="text-2xl font-bold">
              {Math.floor(Math.random() * 50) + 10}
            </p>
            <p className="text-xs text-muted-foreground mt-1">documentos</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Ficheiro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estudante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDocuments.map((doc) => {
              const statusInfo = statusConfig[doc.status as keyof typeof statusConfig];

              return (
                <TableRow key={doc.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.student}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.course}</TableCell>
                  <TableCell>{new Date(doc.uploadDate).toLocaleDateString("pt-AO")}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                  <TableCell>
                    <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
