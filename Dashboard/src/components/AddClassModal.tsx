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
import { addClasses, getClasses } from "@/services/enrollmentsService";

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
    courses: [];
    instrutors: [];
}

export const AddClassModal = ({
    isOpen,
    onClose,
    courses,
    instrutors,
    refresh
}: AddClassModalProps) => {

    const [formData, setFormData] = useState({})
    const { toast } = useToast();

    const saveClasse = async () => {

        const match = courses.find(c => c?.id == formData?.course_id);
        const course_name = match?.title;


        const playLoad = { ...formData, name: course_sigla(course_name), schedule: `${formData?.initial_schedule} às ${formData?.final_schedule}` };

        const res = await addClasses(playLoad);

        if (res) {
            toast({
                title: "Adicionar Turma",
                description: res?.message,
                variant: "default"
            })

            clearFields();
            refresh();
            setTimeout(() => {
                onClose();
            }, 200);
        }
    }

    const clearFields = () => {
        setFormData({})
    }


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
                                <label className="Label py-4 font-bold">Curso</label><br />
                                <select
                                    name="course"
                                    className="select"
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                >
                                    <option value="">Selecione o curso</option>;
                                    {courses.map(c => {
                                        return <option value={c?.id}>{c?.title}</option>
                                    })
                                    }
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Capacidade</label><br />
                                <select
                                    name="capacity"
                                    className="select"
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                >
                                    <option value="">Selecione o curso</option>;
                                    {["10", "15", "20", "25", "30"].map(c => {
                                        return <option value={c}>{c}</option>
                                    })
                                    }
                                </select>
                            </div>
                        </fieldset>

                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0">
                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Instrutor</label><br />
                                <select
                                    name="course"
                                    className="select"
                                    onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                >
                                    <option value="">Selecione instrutor</option>;
                                    {instrutors.map(c => {
                                        return <option value={c?.id}>{c?.name}</option>
                                    })
                                    }
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Horário</label><br />
                                <div className="flex items-center align-center justify-center gap-2">
                                    <input
                                        name="course"
                                        className="Input"
                                        type="time"
                                        onInput={(e) => setFormData({ ...formData, initial_schedule: e.target.value })}
                                    />
                                    <span>Às</span>
                                    <input
                                        name="course"
                                        className="Input"
                                        type="time"
                                        onInput={(e) => setFormData({ ...formData, final_schedule: e.target.value })}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0 w-[90%]">
                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Ínicio</label><br />
                                <input
                                    name="date"
                                    className="Input"
                                    type="date"
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                        </fieldset>

                        <fieldset className="Fieldset md:grid-cols-2 p-3 py-0 w-[90%]">
                            <div className="mb-3">
                                <label className="Label py-4 font-bold">Final</label><br />
                                <input
                                    name="date"
                                    className="Input"
                                    type="date"
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="flex flex-1 items-center align-end justify-end gap-2">

                    <Button className="btn hover:bg-green-900 bg-green-600 text-success-foreground px-9 py-0 rounded-3xl"
                        onClick={() => saveClasse()}>Guardar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}