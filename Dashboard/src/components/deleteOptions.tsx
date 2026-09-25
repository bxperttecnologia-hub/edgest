import { Plus, BookOpen, Trash, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { addCourse, getCourse } from "@/services/coursesService";
import {
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { course_sigla, formatDateForInput } from "@/services/auxiliarFunctions";
import {
  addClasses,
  addEnrollment,
  deleteStudentEnrollments,
  getStudentEnrollments,
  generateCertificate,
} from "@/services/enrollmentsService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import file_pdf from "@/assets/pdf.png";

interface ViewEnrollmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  refresh: () => void;
  studentID: number;
  enrollments: [];
}

export const ViewEnrollmentsModal = ({
  isOpen,
  onClose,
  enrollments,
  refresh,
  onDelete,
}: ViewEnrollmentsModalProps) => {
  const { toast } = useToast();

  const statusLabels = (status) => {
    if (status === "active") {
      return "Ativo";
    } else {
      return "Inativo";
    }
  };

  // função react
  const onRemove = async (id) => {
    try {
      const data = await deleteStudentEnrollments(id);

      if (data?.success) {
        toast({
          title: "Apagar inscrição",
          description: data?.message || "Sucesso!",
        });

        refresh();
      } else {
        toast({
          title: "Erro ao apagar inscrição!",
          description: data?.message || "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);

      toast({
        title: "Erro interno!",
        description: "Não foi possível apagar a inscrição.",
        variant: "destructive",
      });
    }
  };

  const handleCertificate = async (id: number) => {
    try {
      const url = await generateCertificate(id);
      window.open(url, "_blank");
      console.log(id)
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao gerar Certificado",
        description:
          err.response?.data?.message || err.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="DialogTitle flex items-center gap-2">
            <BookOpen size={30} color="red" /> Inscrições
          </DialogTitle>
          <hr />
        </DialogHeader>

        <div className="grid md:grid-cols-1">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Código</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                  <TableHead className="text-right">...</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments && (
                  <>
                    {enrollments.map((e) => (
                      <TableRow key={e.id} className="group">
                        <TableCell className="font-medium">{e.code}</TableCell>
                        <TableCell className="font-medium">
                          {e.class_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {e.course}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              e.status === "active"
                                ? "border-success/30 text-success bg-success/10"
                                : "border-destructive/30 text-destructive bg-destructive/10"
                            }
                          >
                            {statusLabels[e.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateForInput(e.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <img
                                      src={file_pdf}
                                      className="w-5 h-5"
                                      alt="PDF"
                                      onClick={() => handleCertificate(e.id)}
                                    />
                                  </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <p>Emitir certificado</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(e.id)}
                                    aria-label="Remover"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <p>Remover</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-1 items-center align-end justify-end gap-2">
          <Button
            className="btn w-100 hover:bg-red-900 bg-red-600 text-success-foreground px-9 py-0 rounded-3xl"
            onClick={onDelete}
          >
            <Trash color="#fff" size={24} /> Eliminar estudante
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
