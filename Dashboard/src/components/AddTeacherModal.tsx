import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addTeacher } from "@/services/enrollmentsService";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addTeacherSchema,
  AddTeacherFormData,
} from "@/schemas/addTeacherSchema";


interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
}

export const AddTeacherModal = ({
  isOpen,
  onClose,
  refresh
}: AddTeacherModalProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTeacherFormData>({
    resolver: zodResolver(addTeacherSchema),
  });

  const onSubmit = async (data: AddTeacherFormData) => {
    try {
      const res = await addTeacher(data);

      toast({
        title: "Instrutor adicionado",
        description: res?.message || "Operação realizada com sucesso.",
      });

      reset();
      refresh();
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o instrutor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-green-600" />
            Adicionar Instrutor
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input placeholder="Paulo José" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Contacto */}
          <div className="space-y-1">
            <Label>Contacto</Label>
            <Input placeholder="9xxxxxxxx" {...register("contact")} />
            {errors.contact && (
              <p className="text-sm text-red-500">
                {errors.contact.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
