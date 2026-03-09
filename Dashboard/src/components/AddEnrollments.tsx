import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { course_sigla } from "@/services/auxiliarFunctions";
import { addClasses, addEnrollment } from "@/services/enrollmentsService";

interface AddEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
    classes: [];
    courses: [];
    students: [];
}

export const AddEnrollmentModal = ({
    isOpen,
    onClose,
    classes,
    courses,
    students,
    refresh
}: AddEnrollmentModalProps) => {

    const [formData, setFormData] = useState({
        student_id: null,
        class_id: null,
        selected_parcela: null,
        parcelas_total: null,
        enrollment_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD

    })
    const [payment_parcelas, setPayment_parcelas] = useState([])
    const { toast } = useToast();

    
    const saveEnrollment = async () => {
        if (!students || students.length === 0) {
            toast({
                title: "Adicionar Turma",
                description: "Selecione pelo menos 1 estudante",
                variant: "default",
            });
            return;
        }

        if (!formData.class_id) {
            toast({
                title: "Adicionar Turma",
                description: "Selecione uma turma",
                variant: "default",
            });
            return;
        }

        try {
            const results = [];
            
            for (const student of students) {
                const student_id = typeof student === "object" ? student.id : student;

                const payload = {
                    ...formData,
                    student_id
                };

                console.log("Payload enviado para API:", payload); // <-- log importante

                const res = await addEnrollment(payload);

                if (!res || res.error) {
                    console.error("Erro na API:", res);
                    toast({
                        title: "Erro",
                        description: `Erro ao adicionar matrícula do estudante ${student_id}`,
                        variant: "destructive",
                    });
                    continue; // tenta os outros estudantes
                }

                results.push(res);
            }

            if (results.length > 0) {
                toast({
                    title: "Sucesso",
                    description: "Matrículas adicionadas com sucesso!",
                    variant: "default",
                });
                refresh()
                clearFields();
                setTimeout(() => {
                    onClose();
                }, 200);
            }
        } catch (error) {
            console.error("Erro ao chamar addEnrollment:", error);
            toast({
                title: "Erro",
                description: "Erro ao adicionar Turma",
                variant: "destructive",
            });
        }
    };



    const clearFields = () => {
        isOpen = false;
        setFormData({})
    }

    const payment_dues = (courseId: number) => {
        const course = courses.find(c => c.id == courseId);
        if (!course) {
            setPayment_parcelas([]);
            return;
        }

        const total = Number(course.price);               // preço total do curso
        const parcelas = Number(course.payment_parcelas || 1); // número de parcelas

        // valor base de cada parcela (arredondado para 2 casas)
        const baseValue = Math.floor((total / parcelas) * 100) / 100;

        // centavos restantes para distribuir
        let restante = +(total - baseValue * parcelas).toFixed(2);

        const payments = [];

        for (let i = 1; i <= parcelas; i++) {
            let value = baseValue;

            // distribuir centavos restantes
            if (restante > 0) {
                value += 0.01;
                restante -= 0.01;
                restante = +restante.toFixed(2);
            }

            payments.push({
                parcela: i,   // número da parcela
                value: value, // valor da parcela
                total: total  // total do curso
            });
        }

        setPayment_parcelas(payments); // atualiza o estado
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="DialogTitle flex items-center gap-2">
                        <Plus size={30} color="red" /> Adicionar Turma
                    </DialogTitle>
                    <hr />
                </DialogHeader>

                <div className="grid md:grid-cols-1">
                    <div className="grid md:grid-cols-2">
                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0">
                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Turma</label><br />
                                <select
                                    className="select"
                                    value={formData.class_id || ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setFormData({ ...formData, class_id: id });
                                        payment_dues(id);
                                    }}
                                >
                                    <option value="">Selecione a turma</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.code || c.name} | {c.course}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </fieldset>
                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0">
                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Pagamento</label><br />
                                <select
                                    className="select"
                                    value={formData.selected_parcela || ""}
                                    onChange={(e) => setFormData({ ...formData, selected_parcela: e.target.value })}
                                >
                                    <option value="">Selecione a parcela</option>

                                    {payment_parcelas.map(p => (
                                        <option key={p.parcela} value={p.parcela}>
                                            {p.parcela}ª — {p.value.toLocaleString("pt-PT")} AOA (Total: {p.total.toLocaleString("pt-PT")} AOA)
                                        </option>
                                    ))}

                                    {payment_parcelas.length > 1 && (
                                        <option value="total">
                                            Total — {payment_parcelas.reduce((acc, p) => acc + p.value, 0).toLocaleString("pt-PT")} AOA
                                        </option>
                                    )}
                                </select>

                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="flex flex-1 items-center align-end justify-end gap-2">

                    <Button className="btn hover:bg-green-900 bg-green-600 text-success-foreground px-9 py-0 rounded-3xl"
                        onClick={saveEnrollment}>Guardar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}