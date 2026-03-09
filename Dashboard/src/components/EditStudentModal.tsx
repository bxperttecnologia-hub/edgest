import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, PlusCircleIcon, IdCard, Phone } from "lucide-react";
import { upDateStudent } from "@/services/studentService";
import { formatDateForInput } from "@/services/auxiliarFunctions";

interface Student {
  id?: number | null;
  name: string;
  email: string;
  nationality: string;
  birth_date: string;
  identity_type: string;
  identity_number: string;
  identity_valid_data: string;
  address: string;
  contact: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedData?: any;
  refresh: () => void;
}

export function EditStudentFormModal({
  isOpen,
  onClose,
  selectedData,
  refresh
}: Props) {

  const { toast } = useToast();

  const [formData, setFormData] = useState<Student>({
    id: null,
    name: "",
    email: "",
    nationality: "",
    birth_date: "",
    identity_type: "",
    identity_number: "",
    identity_valid_data: "",
    address: "",
    contact: ""
  });

  // 🔹 Preenche dados ao editar
  useEffect(() => {
    if (selectedData) {
      setFormData({
        id: selectedData.id ?? null,
        name: selectedData.name ?? "",
        email: selectedData.email ?? "",
        nationality: selectedData.nationality ?? "",
        birth_date: selectedData.birth_date?.split("T")[0] ?? "",
        identity_type: selectedData.identity_type ?? "",
        identity_number: selectedData.identity_number ?? "",
        identity_valid_data: selectedData.identity_valid_data?.split("T")[0] ?? "",
        address: selectedData.address ?? "",
        contact: selectedData.contact ?? ""
      });
    }
  }, [selectedData]);

  const handleChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Nome é obrigatório";
    if (!formData.email.trim()) return "Email é obrigatório";
    if (!formData.contact.trim()) return "Telefone é obrigatório";
    return null;
  };

  const saveStudentData = async () => {
    try {
      const error = validate();

      if (error) {
        return toast({
          title: "Erro",
          description: error,
          variant: "destructive"
        });
      }

      const response = await upDateStudent(formData);

      toast({
        title: "Sucesso",
        description: response?.message || "Estudante atualizado com sucesso"
      });

      refresh();
      onClose();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar estudante",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.id ? (
              <>
                <RefreshCw size={18} /> Atualizar Estudante
              </>
            ) : (
              <>
                <PlusCircleIcon size={18} /> Cadastrar Estudante
              </>
            )}
          </DialogTitle>
          <hr />
        </DialogHeader>

        {/* Informações pessoais */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">

          <div className="p-4">
            <label className="font-bold">Nome completo</label>
            <input
              className="Input"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="p-4">
            <label className="font-bold">Nacionalidade</label>
            <select
              className="select"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Angola">Angola</option>
              <option value="Portugal">Portugal</option>
            </select>
          </div>

          <div className="p-4">
            <label className="font-bold">Data de Nascimento</label>
            <input
              type="date"
              className="Input"
              value={formatDateForInput(formData.birth_date)}
              onChange={(e) => handleChange("birth_date", e.target.value)}
            />
          </div>

          <div className="p-4">
            <label className="font-bold">Tipo de Documento</label>
            <select
              className="select"
              value={formData.identity_type}
              onChange={(e) => handleChange("identity_type", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="BI">Bilhete de Identidade</option>
              <option value="Passaporte">Passaporte</option>
            </select>
          </div>

          <div className="p-4">
            <label className="font-bold">Número do Documento</label>
            <input
              className="Input"
              value={formatDateForInput(formData.identity_number)}
              onChange={(e) => handleChange("identity_number", e.target.value)}
            />
          </div>

          <div className="p-4">
            <label className="font-bold">Data de Validade</label>
            <input
              type="date"
              className="Input"
              value={formData.identity_valid_data}
              onChange={(e) => handleChange("identity_valid_data", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 p-4">
            <label className="font-bold">Endereço</label>
            <input
              className="Input"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="p-4">
            <label className="font-bold">Email</label>
            <input
              className="Input"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="p-4">
            <label className="font-bold">Telefone</label>
            <input
              className="Input"
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={saveStudentData}
            className="bg-green-600 hover:bg-green-700 rounded-3xl"
          >
            {formData.id ? "Atualizar" : "Adicionar"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
