import { useState, useEffect } from 'react';
import { CalendarEvent, EventColor, RecurrenceType } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Search,
    Filter,
    PlusCircleIcon,
    X,
    IdCard,
    Phone,
    Book,
    RefreshCw,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { addStudent, upDateStudent } from '@/services/studentService';


interface AddStudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    onUpdate?: (id: string, event: Partial<CalendarEvent>) => void;
    editingEvent?: null;
    selectedData?: {};
    courses?: [];
    studentID: null;
}


export function EditStudentFormModal({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    editingEvent,
    selectedData,
    courses,
    studentID,
    refresh
}: AddStudentFormModalProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({});
    const [inputID, setStudentID] = useState(studentID);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nationality, setNationality] = useState("");
    const [birth_date, setBirth_date] = useState("");
    const [identity_type, setIdentity_type] = useState("");
    const [identity_number, setIdentity_number] = useState("");
    const [identity_valid_data, setIdentity_valid_data] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");

    const formatDateForInput = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const saveStudentData = async () => {
        try {
            if (!name && !email && !nationality && !birth_date && !identity_type && !identity_number && !identity_valid_data && !address && !contact) {
                toast({
                    title: "Erro!",
                    description: "Preencha todos os campos!",
                    variant: "destructive"
                })
            }

            let playLoad = {
                id: inputID,
                name: name,
                email: email,
                nationality: nationality,
                birth_date: birth_date,
                identity_type: identity_type,
                identity_number: identity_number,
                identity_valid_data: identity_valid_data,
                address: address,
                contact: contact
            }

            const data = await upDateStudent(playLoad);

            if (!data) {
                toast({
                    title: "Atualizar estudante",
                    description: data?.message,
                    variant: "destructive"
                })
            }

            toast({
                title: "Atualizar",
                description: data?.message,
                variant: "default"
            })

            refresh()
            cleanFields();
            setTimeout(() => {
                onClose()
            }, 200);

        } catch (error) {

        }

    }

    const cleanFields = () => {
        setName("");
        setEmail("");
        setNationality("");
        setBirth_date("");
        setIdentity_type("");
        setIdentity_number("");
        setIdentity_valid_data("");
        setAddress("");
        setContact("");
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="DialogTitle flex items-center gap-2">
                        {inputID !== null ? <>
                            <RefreshCw /> <span>Atualizar Estudante</span>
                        </> : <>
                            <PlusCircleIcon /> <span>Cadastar Estudante</span>
                        </>}
                    </DialogTitle>
                    <hr />
                </DialogHeader>

                <div className="mb-2 my-2 flex gap-2">
                    <IdCard />
                    <h4>Informações pessoais</h4>
                </div>

                <div className="grid md:grid-cols-2">
                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">Nome completo</label>
                        <input
                            className="Input"
                            id="id"
                            type='hidden'
                            value={studentID}
                            placeholder="João Silva Pascoal"
                            onInput={(e) => setStudentID(e.target.value)}
                        />
                        <input
                            className="Input"
                            id="name"
                            value={name ? name : selectedData?.name}
                            placeholder="João Silva Pascoal"
                            onInput={(e) => setName(e.target.value)}
                        />
                    </fieldset>

                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">Nacionalidade</label>
                        <select
                            name="Nacionality"
                            className="select"
                            value={nationality ? nationality : selectedData?.nationality}
                            onChange={(e) => setNationality(e.target.value)}
                        >
                            <option value="">Selecione a Nacionalidade</option>;
                            <option value="Angola">Angola</option>;
                            <option value="Português">Portugal</option>;
                        </select>
                    </fieldset>
                </div>

                <div className="grid md:grid-cols-2">
                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">
                            Data de Nascimento
                        </label>
                        <input
                            className="Input"
                            id="birthDate"
                            type="date"
                            value={birth_date ? birth_date : formatDateForInput(selectedData?.birth_date)}
                            onInput={(e) => setBirth_date(e.target.value)}
                        />
                    </fieldset>

                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">
                            Tipo de documento
                        </label>
                        <select
                            name="Nacionality"
                            className="select"
                            value={identity_type ? identity_number : selectedData?.identity_type}
                            onChange={(e) => setIdentity_type(e.target.value)}
                        >
                            <option value="">Selecione o tipo de documento</option>;
                            <option value="BI">Bilhete de Identidade</option>;
                            <option value="Passaporte">Passaporte</option>;
                        </select>
                    </fieldset>
                </div>

                <div className="grid md:grid-cols-2">
                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">
                            Número do documento
                        </label>
                        <input
                            className="Input"
                            id="identity_number"
                            type="text"
                            placeholder='8939823234'
                            value={identity_number ? identity_number : selectedData?.identity_number}
                            onInput={(e) => setIdentity_number(e.target.value)}
                        />
                    </fieldset>

                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">Data de Validade</label>
                        <input
                            className="Input"
                            id="birthDate"
                            type="date"
                            value={identity_valid_data ? identity_valid_data : formatDateForInput(selectedData?.identity_valid_data)}
                            onInput={(e) => setIdentity_valid_data(e.target.value)}
                        />
                    </fieldset>
                </div>

                <div className="grid md:grid-cols-2">
                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">Endereço</label>
                        <input
                            className="Input"
                            id="address"
                            placeholder='Ex: Icolo e Bengo, Zango 4, Rua 9, Casas Azuis, Casa N'
                            type="text"
                            value={address ? address : selectedData?.address}
                            onInput={(e) => setAddress(e.target.value)}
                        />
                    </fieldset>
                </div>

                <hr />

                <div className="mb-2 my-2 flex gap-2">
                    <Phone />
                    <h4>Contactos</h4>
                </div>

                <div className="grid md:grid-cols-2">
                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">E-mail</label>
                        <input
                            className="Input"
                            id="email"
                            placeholder="email@exemplo.com"
                            value={email ? email : selectedData?.email}
                            onInput={(e) => setEmail(e.target.value)}
                        />
                    </fieldset>

                    <fieldset className="Fieldset d-block p-4 py-1">
                        <label className="Label mb-3 font-bold">Telefone</label>
                        <input
                            className="Input"
                            id="contact"
                            type="number"
                            placeholder='9xxx xxx xxx'
                            value={contact ? contact : selectedData?.contact}
                            onInput={(e) => setContact(e.target.value)}
                        />
                    </fieldset>
                </div>

                <hr />

                <div className="flex justify-end items-center content-center gap-2 mt-2">
                    <Button
                        className="btn hover:bg-green-900 bg-green-600 text-success-foreground px-5 py-0"
                        onClick={() => saveStudentData()}
                    >
                        {inputID !== null ? "Atualizar" : "Adicionar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
