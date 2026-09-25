import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { CalendarEvent, EventColor, RecurrenceType } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  User,
  Mail,
  MapPin,
  Calendar,
  Globe,
  FileText,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Hash,
  CalendarCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  addStudent,
  getStudents,
  upDateStudent,
} from "@/services/studentService";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AddStudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
  courses?: [];
  refresh: () => void;
  studentID: null;
}

const STEPS = [
  { id: 1, label: "Pessoal", icon: User },
  { id: 2, label: "Documento", icon: IdCard },
  { id: 3, label: "Contactos", icon: Phone },
  { id: 4, label: "Endereço", icon: MapPin },
];

export function AddStudentFormModal({
  isOpen,
  onClose,
  onSave,
  courses,
  refresh,
  studentID,
}: AddStudentFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [inputID, setStudentID] = useState(studentID || null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [birth_date, setBirth_date] = useState("");
  const [identity_type, setIdentity_type] = useState("");
  const [identity_number, setIdentity_number] = useState("");
  const [identity_valid_data, setIdentity_valid_data] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  // Novos states
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Wizard / UI states
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragPhoto, setDragPhoto] = useState(false);
  const [dragDoc, setDragDoc] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const saveStudentData = async () => {
    try {
      setIsSaving(true);
      if (
        !name &&
        !nationality &&
        !birth_date &&
        !identity_type &&
        !identity_number &&
        !identity_valid_data &&
        !address &&
        !contact
      ) {
        toast({
          title: "Erro!",
          description: "Preencha todos os campos!",
          variant: "destructive",
        });
      }

      let playLoad: any = {
        id: inputID,
        name: name,
        email: email,
        nationality: nationality,
        birth_date: birth_date,
        identity_type: identity_type,
        identity_number: identity_number,
        identity_valid_data: identity_valid_data,
        address: address,
        contact: contact,
        alternative_email: alternativeEmail,
        alternative_phone: alternativePhone,
        photo,
        document: documentFile,
      };

      const data =
        inputID == null
          ? await addStudent(playLoad)
          : await upDateStudent(playLoad);

      if (!data) {
        toast({
          title:
            inputID == null ? "Adicionar estudante" : "Atualizar estudante",
          description: data?.message,
          variant: "destructive",
        });
      }

      toast({
        title: inputID == null ? "Adicionar estudante" : "Atualizar",
        description: data?.message,
        variant: "default",
      });

      refresh();
      cleanFields();
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

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
    setAlternativeEmail("");
    setAlternativePhone("");
    setPhoto(null);
    setDocumentFile(null);
    setStep(1);
  };

  // Validação por step
  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!name || !nationality || !birth_date) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome, nacionalidade e data de nascimento.",
          variant: "destructive",
        });
        return false;
      }
    }
    if (s === 2) {
      if (!identity_type || !identity_number || !identity_valid_data) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os dados do documento.",
          variant: "destructive",
        });
        return false;
      }
    }
    if (s === 3) {
      if (!contact) {
        toast({
          title: "Campos obrigatórios",
          description: "Email e telefone principais são obrigatórios.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handlePhotoFile = (file?: File | null) => {
    if (!file) return;
    setPhoto(file);
  };
  const handleDocFile = (file?: File | null) => {
    if (!file) return;
    setDocumentFile(file);
  };

  const onDropPhoto = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragPhoto(false);
    handlePhotoFile(e.dataTransfer.files?.[0]);
  };
  const onDropDoc = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragDoc(false);
    handleDocFile(e.dataTransfer.files?.[0]);
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[920px] max-h-[92vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b bg-gradient-to-br from-background to-muted/30 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {inputID !== null ? (
                  <RefreshCw className="h-5 w-5" />
                ) : (
                  <PlusCircleIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span>
                  {inputID !== null
                    ? "Atualizar Estudante"
                    : "Cadastrar Estudante"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Etapa {step} de {STEPS.length} — {STEPS[step - 1].label}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isDone = step > s.id;
                const isActive = step === s.id;
                return (
                  <div
                    key={s.id}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.08 : 1,
                        }}
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                          isDone &&
                            "bg-primary border-primary text-primary-foreground",
                          isActive &&
                            "bg-primary/10 border-primary text-primary",
                          !isDone &&
                            !isActive &&
                            "bg-muted border-border text-muted-foreground",
                        )}
                      >
                        {isDone ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </motion.div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mx-2 bg-border relative overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-primary"
                          initial={false}
                          animate={{ width: step > s.id ? "100%" : "0%" }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 min-h-[340px]">
          {/* hidden id input preserved */}
          <input
            id="id"
            type="hidden"
            onInput={(e: any) => setStudentID(e.target.value)}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={User}
                    title="Informações pessoais"
                    subtitle="Dados básicos do estudante"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Nome completo" icon={User}>
                      <Input
                        id="name"
                        value={name}
                        placeholder="João Silva Pascoal"
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                    <Field label="Nacionalidade" icon={Globe}>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Selecione a Nacionalidade</option>
                        <option value="Angola">Angola</option>
                        <option value="Português">Portugal</option>
                      </select>
                    </Field>
                    <Field label="Data de Nascimento" icon={Calendar}>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birth_date}
                        onChange={(e) => setBirth_date(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={IdCard}
                    title="Documento de identificação"
                    subtitle="Informações do documento oficial"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Tipo de documento" icon={FileText}>
                      <select
                        value={identity_type}
                        onChange={(e) => setIdentity_type(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="BI">Bilhete de Identidade</option>
                        <option value="Passaporte">Passaporte</option>
                      </select>
                    </Field>
                    <Field label="Número do documento" icon={Hash}>
                      <Input
                        id="identity_number"
                        type="text"
                        value={identity_number}
                        placeholder="8939823234"
                        onChange={(e) => setIdentity_number(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                    <Field label="Data de Validade" icon={CalendarCheck}>
                      <Input
                        type="date"
                        value={identity_valid_data}
                        onChange={(e) => setIdentity_valid_data(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={Phone}
                    title="Contactos"
                    subtitle="Adicione os meios de contacto principais e alternativos"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email principal" icon={Mail}>
                      <Input
                        id="email"
                        value={email}
                        placeholder="email@exemplo.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                    <Field label="Email alternativo" icon={Mail} optional>
                      <Input
                        value={alternativeEmail}
                        placeholder="alternativo@exemplo.com"
                        onChange={(e) => setAlternativeEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                    <Field label="Telefone principal" icon={Phone}>
                      <Input
                        id="contact"
                        type="tel"
                        value={contact}
                        placeholder="9xx xxx xxx"
                        onChange={(e) => setContact(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                    <Field label="Telefone alternativo" icon={Phone} optional>
                      <Input
                        type="tel"
                        value={alternativePhone}
                        placeholder="9xx xxx xxx"
                        onChange={(e) => setAlternativePhone(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={MapPin}
                    title="Endereço & Ficheiros"
                    subtitle="Localização e anexos do estudante"
                  />
                  <Field label="Endereço" icon={MapPin}>
                    <Input
                      id="address"
                      value={address}
                      placeholder="Ex: Icolo e Bengo, Zango 4, Rua 9, Casas Azuis, Casa N"
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Photo upload */}
                    <div>
                      <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />{" "}
                        Foto do estudante
                      </label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragPhoto(true);
                        }}
                        onDragLeave={() => setDragPhoto(false)}
                        onDrop={onDropPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className={cn(
                          "cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-colors flex flex-col items-center justify-center min-h-[180px]",
                          dragPhoto
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-muted/30",
                        )}
                      >
                        {photoPreview ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={photoPreview}
                              alt="preview"
                              className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30"
                            />
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {photo?.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhoto(null);
                              }}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                              Arraste ou clique para enviar
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG até 5MB
                            </p>
                          </>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handlePhotoFile(e.target.files?.[0])
                          }
                        />
                      </div>
                    </div>

                    {/* Document upload */}
                    <div>
                      <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />{" "}
                        Documento (PDF/Imagem)
                      </label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragDoc(true);
                        }}
                        onDragLeave={() => setDragDoc(false)}
                        onDrop={onDropDoc}
                        onClick={() => docInputRef.current?.click()}
                        className={cn(
                          "cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-colors flex flex-col items-center justify-center min-h-[180px]",
                          dragDoc
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-muted/30",
                        )}
                      >
                        {documentFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <FileText className="h-6 w-6" />
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {documentFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentFile(null);
                              }}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                              Arraste ou clique para enviar
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, PNG, JPG até 10MB
                            </p>
                          </>
                        )}
                        <input
                          ref={docInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleDocFile(e.target.files?.[0])
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t bg-muted/30 rounded-b-2xl flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              cleanFields();
              onClose();
            }}
            className="rounded-xl"
            disabled={isSaving}
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={isSaving}
                className="rounded-xl gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
            )}

            {step < STEPS.length ? (
              <Button onClick={handleNext} className="rounded-xl gap-1 px-6">
                Próximo <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={saveStudentData}
                disabled={isSaving}
                className="rounded-xl gap-2 px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> A guardar...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {inputID !== null ? "Atualizar" : "Adicionar"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- helpers ---------- */

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground leading-tight">{title}</h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  optional,
  children,
}: {
  label: string;
  icon?: any;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {optional && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-normal">
            (opcional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
