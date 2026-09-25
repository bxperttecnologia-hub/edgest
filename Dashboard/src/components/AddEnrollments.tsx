import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { addEnrollment } from "@/services/enrollmentsService";

interface AddEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
  classes: any[];
  students: any[];
}

export const AddEnrollmentModal = ({
  isOpen,
  onClose,
  classes,
  students,
  refresh,
}: AddEnrollmentModalProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: null,
    class_id: null,
    enrollment_date: new Date().toISOString().split("T")[0],
  });

  const saveEnrollment = async () => {
    // =========================================
    // NORMALIZAR ESTUDANTES
    // =========================================
    const normalizedStudents = Array.isArray(students)
      ? students
      : students
        ? [students]
        : [];

    // =========================================
    // VALIDAR ESTUDANTES
    // =========================================
    if (normalizedStudents.length === 0) {
      toast({
        title: "Adicionar Matrícula",
        description: "Selecione pelo menos 1 estudante",
        variant: "default",
      });
      return;
    }

    // =========================================
    // VALIDAR TURMA
    // =========================================
    if (!formData.class_id) {
      toast({
        title: "Adicionar Matrícula",
        description: "Selecione uma turma",
        variant: "default",
      });
      return;
    }

    try {
      const selectedClass = classes?.find(
        (cl) => Number(cl.id) === Number(formData.class_id),
      );

      if (!selectedClass) {
        toast({
          title: "Erro",
          description: "Turma não encontrada",
          variant: "destructive",
        });
        return;
      }

      const results: any[] = [];

      // =========================================
      // LOOP ESTUDANTES
      // =========================================
      for (const student of normalizedStudents) {
        const student_id = typeof student === "object" ? student?.id : student;

        const payload = {
          student_id,
          class_id: formData.class_id,
          enrollment_date: formData.enrollment_date,
        };

        const res = await addEnrollment(payload);

        if (!res || res.error) {
          toast({
            title: "Erro",
            description: `Erro ao adicionar matrícula do estudante ${student_id}`,
            variant: "destructive",
          });
          continue;
        }

        results.push(res);
      }

      // =========================================
      // SUCESSO
      // =========================================
      if (results.length > 0) {
        toast({
          title: "Sucesso",
          description: "Matrículas adicionadas com sucesso!",
          variant: "default",
        });

        refresh?.();

        setTimeout(() => {
          onClose?.();
        }, 200);
      }
    } catch (error) {
      console.error("Erro ao adicionar matrícula:", error);

      toast({
        title: "Erro",
        description: "Erro ao adicionar matrícula",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={24} /> Adicionar Matrícula
          </DialogTitle>
        </DialogHeader>

        {/* TURMA */}
        <div className="mb-4">
          <label className="font-bold">Turma</label>
          <select
            className="select w-full"
            value={formData.class_id || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                class_id: Number(e.target.value),
              })
            }
          >
            <option value="">Selecione a turma</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} | {c.course}
              </option>
            ))}
          </select>
        </div>

        {/* DATA */}
        <div className="mb-4">
          <label className="font-bold">Data de Matrícula</label>
          <input
            type="date"
            className="input w-full"
            value={formData.enrollment_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                enrollment_date: e.target.value,
              })
            }
          />
        </div>

        {/* BOTÃO */}
        <div className="flex justify-end">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            onClick={saveEnrollment}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
