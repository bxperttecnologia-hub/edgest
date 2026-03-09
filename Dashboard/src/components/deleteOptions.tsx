import { Plus, BookOpen, Trash, Trash2 } from "lucide-react";
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
} from "@/services/enrollmentsService";

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
  onDelete
}: ViewEnrollmentsModalProps) => {
  const { toast } = useToast();

  const statusLabels = (status) => {
    if (status === "active") {
      return "Ativo";
    } else {
      return "Inativo";
    }
  };

  const onRemove = async (id?: number) => {
    const data = await deleteStudentEnrollments(id);

    if (data) {
      toast({
        title: "Apagar inscrição",
        description: "Sucesso!"
      });

      refresh()
    } else {
      toast({
        title: "Erro ao buscar inscrições!",
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
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleStatus(user.id)}
                          title={
                            user.status === "active" ? "Desativar" : "Ativar"
                          }
                        >
                          {user.status === "active" ? (
                            <ToggleRight className="h-4 w-4 text-success" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button> */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemove(e.id)}
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
