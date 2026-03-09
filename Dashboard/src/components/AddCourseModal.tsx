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

interface AddCourseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
}

export const AddCourseDialog = ({
    isOpen,
    onClose,
    refresh
}: AddCourseDialogProps) => {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [duration_hours, setDuration_hours] = useState("")
    const [level, setLevel] = useState("")
    const [price, setPrice] = useState("")
    const [payment_parcelas, setPayment_parcelas] = useState("")
    const { toast } = useToast();

    const saveCourse = async () => {

        const playLoad = {
            title: title,
            description: description,
            duration_hours: duration_hours,
            level: level,
            price: price,
            payment_parcelas: payment_parcelas
        }
        const res = await addCourse(playLoad);

        if (res) {
            toast({
                title: "Adicionar curso",
                description: res?.message,
                variant: "default"
            })

            refresh()
            clearFields()
            setTimeout(() => {
                onClose();
            }, 200);
        }
    }

    const clearFields = () => {
        isOpen = false;
        setTitle("");
        setDescription("");
        setDuration_hours("");
        setLevel("");
        setPrice("");
        setPayment_parcelas("");
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="DialogTitle flex items-center gap-2">
                        <Plus size={30} color="red" /> Adicionar Curso
                    </DialogTitle>
                    <hr />
                </DialogHeader>

                <div className="grid md:grid-cols-1">
                    <div className="grid md:grid-cols-2">
                        <fieldset className="Fieldset md:grid-cols-2 p-4 py-1">
                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Nome</label>
                                <input
                                    className="Input"
                                    type='text'
                                    placeholder="Marketing"
                                    onInput={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Duração (horas)</label>
                                <input
                                    className="Input"
                                    type="number"
                                    min="0"
                                    onInput={(e) => setDuration_hours(e.target.value)}
                                />
                            </div>

                        </fieldset>

                        <fieldset className="Fieldset md:grid-cols-2 p-4 py-1">
                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Descrição</label>
                                <input
                                    className="Input"
                                    type='text'
                                    placeholder="Marketing Digital"
                                    onInput={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Preço(AKZ)</label>
                                <input
                                    className="Input"
                                    type='text'
                                    placeholder="12.500"
                                    onInput={(e) => setPrice(e.target.value)}
                                />
                            </div>

                        </fieldset>

                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0">
                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Parcelas(pagamento)</label>
                                <select
                                    name="parcelas"
                                    className="select"
                                    onChange={(e) => setPayment_parcelas(e.target.value)}
                                >
                                    <option value="">Selecione a parcela de pagamento</option>;
                                    <option value="1">1 Parcela</option>
                                    <option value="2">2 Parcelas</option>
                                    <option value="3">3 Parcelas</option>
                                    <option value="4">4 Parcelas</option>
                                </select>
                            </div>
                        </fieldset>
                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0">
                            <div className="mb-3">
                                <label className="Label mb-3 font-bold">Nível</label>
                                <select
                                    name="nivel"
                                    className="select"
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="">Selecione o nivel</option>;
                                    <option value="Básico">Básico</option>
                                    <option value="Intermédio">Intermédio</option>
                                    <option value="Médio">Médio</option>
                                    <option value="Avançado">Avançado</option>
                                </select>
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="flex flex-1 items-center align-end justify-end gap-2">

                    <Button className="btn hover:bg-green-900 bg-green-600 text-success-foreground px-5 py-0"
                        onClick={() => saveCourse()}>Guardar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}