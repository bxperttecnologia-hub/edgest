import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  Filter,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "use-debounce";
import { getDocuments } from "@/services/documentService";
import file_png from "@/assets/png.png";
import file_pdf from "@/assets/pdf.png";
import { ViewFileModal } from "@/components/ViewModal";

const statusConfig = {
  validated: {
    label: "Aprovado",
    className: "bg-success text-success-foreground",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning text-warning-foreground",
  },
  rejected: {
    label: "Rejeitado",
    className: "bg-destructive text-destructive-foreground",
  },
};

const fileType = {
  pdf: {
    src: file_pdf,
  },
  png: {
    src: file_png,
  },
  jpg: {
    src: file_png,
  },
  jpeg: {
    src: file_png,
  },
  "": {
    src: file_pdf,
  },
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
  const { toast } = useToast();

  // ========================= STATES =========================
  const [sortDocuments, setSortDocuments] = useState<null | string | object>(
    "recent",
  );

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [filterValue, setFilterValue] = useState(null);
  const [minId, setMinId] = useState(1);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [urlModal, setUrlModal] = useState("");
  const [titModal, setTitleModal] = useState("");
  const [limitData, setLimitData] = useState(40);
  const [minIdHistory, setMinIdHistory] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [sortStatus, setSortStatus] = useState("");

  const offset = (page - 1) * limitData;

  // debounce da busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // sort key estável
  const sortKey =
    typeof sortDocuments === "string"
      ? sortDocuments
      : JSON.stringify(sortDocuments || "");

  // função de buscar produtos
  const getDocumentsData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      const loadedIds = documentData.map((s) => {
        s.id;
      });

      const body = {
        id: parseInt(minId),
        limit: parseInt(limitData),
        offset: parseInt(offset),
        name: debouncedSearch,
        sort: sortKey,
        status: sortStatus,
        loadedIds,
      };

      console.log("[getDocumentssData] body:", body);

      try {
        const res = await getDocuments(body);

        const data = res?.data || res;

        console.log(res);
        setDocumentData(Array.isArray(data) ? data : (data?.items ?? []));
      } catch {
        toast({
          title: "Erro",
          description: "Falha ao carregar documentos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [minId, limitData, debouncedSearch, sortKey, filterValue, sortStatus],
  );

  // chama getProducts sempre que dependências mudarem
  useEffect(() => {
    const controller = new AbortController();
    getDocumentsData(controller.signal);
    return () => controller.abort();
  }, [getDocumentsData]);

  const OpenModal = (url: String, name: String) => {
    setUrlModal(url);
    setTitleModal(name);
    setTimeout(() => {
      setOpenModal(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <ViewFileModal
        fileUrl={urlModal}
        title={titModal}
        isOpen={openModal}
        onClose={setOpenModal}
      />
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
            {documentData.map((doc) => {
              const statusInfo =
                statusConfig[doc.status as keyof typeof statusConfig];

              return (
                <TableRow key={doc.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        className="h-6 w-6 text-primary"
                        src={fileType[doc.file_type]?.src}
                        alt=""
                      />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.student}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.course}
                  </TableCell>
                  <TableCell>
                    {new Date(doc.uploadDate).toLocaleDateString("pt-AO")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.size}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusInfo?.className}>
                      {statusInfo?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => OpenModal(doc.file, doc.name)}
                      >
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
