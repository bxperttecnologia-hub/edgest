import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";

import {
  IdCard,
  Phone,
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
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { upDateStudent } from "@/services/studentService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedData?: any;
  refresh: () => void;
}

const STEPS = [
  { id: 1, label: "Pessoal", icon: User },
  { id: 2, label: "Documento", icon: IdCard },
  { id: 3, label: "Contactos", icon: Phone },
  { id: 4, label: "Endereço", icon: MapPin },
];

export function EditStudentFormModal({
  isOpen,
  onClose,
  selectedData,
  refresh,
}: Props) {
  const { toast } = useToast();

  const [inputID, setStudentID] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [birth_date, setBirth_date] = useState("");
  const [identity_type, setIdentity_type] = useState("");
  const [identity_number, setIdentity_number] = useState("");
  const [identity_valid_data, setIdentity_valid_data] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [dragPhoto, setDragPhoto] = useState(false);
  const [dragDoc, setDragDoc] = useState(false);

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    if (!selectedData) return;

    setStudentID(selectedData.id ?? null);

    setName(selectedData.name ?? "");
    setEmail(selectedData.email ?? "");
    setNationality(selectedData.nationality ?? "");
    setBirth_date(selectedData.birth_date?.split("T")[0] ?? "");

    setIdentity_type(selectedData.identity_type ?? "");
    setIdentity_number(selectedData.identity_number ?? "");

    setIdentity_valid_data(
      selectedData.identity_valid_data?.split("T")[0] ?? "",
    );

    setAddress(selectedData.address ?? "");
    setContact(selectedData.contact ?? "");

    setAlternativeEmail(selectedData.alternative_email ?? "");
    setAlternativePhone(selectedData.alternative_phone ?? "");

    if (selectedData.photo) {
      setPhotoPreview(selectedData.photo);
    }
  }, [selectedData]);

  // ======================================================
  // PHOTO PREVIEW
  // ======================================================

  useEffect(() => {
    if (!photo) return;

    const url = URL.createObjectURL(photo);

    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // ======================================================
  // VALIDATION
  // ======================================================

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
          description: "Telefone principal é obrigatórios.",
          variant: "destructive",
        });

        return false;
      }
    }

    return true;
  };

  // ======================================================
  // NEXT / PREV
  // ======================================================

  const handleNext = () => {
    if (!validateStep(step)) return;

    setStep((s) => Math.min(4, s + 1));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  // ======================================================
  // FILES
  // ======================================================

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

  // ======================================================
  // SAVE
  // ======================================================

  const saveStudentData = async () => {
    try {
      setIsSaving(true);

      const playLoad: any = {
        id: inputID,
        name,
        email,
        nationality,
        birth_date,
        identity_type,
        identity_number,
        identity_valid_data,
        address,
        contact,
        alternative_email: alternativeEmail,
        alternative_phone: alternativePhone,
        photo,
        document: documentFile,
      };

      const data = await upDateStudent(playLoad);

      if (!data?.success) {
        toast({
          title: "Erro",
          description: data?.message || "Erro ao atualizar estudante",
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Sucesso",
        description: data?.message || "Estudante atualizado com sucesso",
      });

      refresh?.();

      setTimeout(() => {
        onClose?.();
      }, 200);
    } catch (error: any) {
      console.error(error);

      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar estudante",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ======================================================
  // CLEAN
  // ======================================================

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
    setPhotoPreview(null);
    setStep(1);
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[920px] max-h-[92vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
        {/* HEADER */}
        <div className="px-8 pt-7 pb-5 border-b bg-gradient-to-br from-background to-muted/30 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <RefreshCw className="h-5 w-5" />
              </div>

              <div className="flex flex-col">
                <span>Atualizar Estudante</span>

                <span className="text-xs font-normal text-muted-foreground">
                  Etapa {step} de {STEPS.length} — {STEPS[step - 1].label}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* STEPPER */}
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
                          animate={{
                            width: step > s.id ? "100%" : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PROGRESS */}
            <div className="mt-5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* STEP 1 */}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>

                    <Field label="Nacionalidade" icon={Globe}>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione</option>

                        <option value="Angola">Angola</option>

                        <option value="Portugal">Portugal</option>
                      </select>
                    </Field>

                    <Field label="Data de Nascimento" icon={Calendar}>
                      <Input
                        type="date"
                        value={birth_date}
                        onChange={(e) => setBirth_date(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={IdCard}
                    title="Documento"
                    subtitle="Documento de identificação"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Tipo de documento" icon={FileText}>
                      <select
                        value={identity_type}
                        onChange={(e) => setIdentity_type(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione</option>

                        <option value="BI">Bilhete de Identidade</option>

                        <option value="Passaporte">Passaporte</option>
                      </select>
                    </Field>

                    <Field label="Número do documento" icon={Hash}>
                      <Input
                        value={identity_number}
                        onChange={(e) => setIdentity_number(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>

                    <Field label="Data de validade" icon={CalendarCheck}>
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

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={Phone}
                    title="Contactos"
                    subtitle="Informações de contacto"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email principal" icon={Mail}>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>

                    <Field label="Email alternativo" icon={Mail} optional>
                      <Input
                        value={alternativeEmail}
                        onChange={(e) => setAlternativeEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>

                    <Field label="Telefone principal" icon={Phone}>
                      <Input
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>

                    <Field label="Telefone alternativo" icon={Phone} optional>
                      <Input
                        value={alternativePhone}
                        onChange={(e) => setAlternativePhone(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-5">
                  <SectionTitle
                    icon={MapPin}
                    title="Endereço & Ficheiros"
                    subtitle="Dados adicionais"
                  />

                  <Field label="Endereço" icon={MapPin}>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* PHOTO */}
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        Foto
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
                          "cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center min-h-[180px] flex flex-col items-center justify-center",
                          dragPhoto
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/30",
                        )}
                      >
                        {photoPreview ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={photoPreview}
                              className="h-24 w-24 rounded-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                setPhoto(null);
                                setPhotoPreview(null);
                              }}
                              className="text-xs text-destructive"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-7 w-7 mb-2" />

                            <p className="text-sm font-medium">
                              Clique para enviar
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

                    {/* DOCUMENT */}
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        Documento
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
                          "cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center min-h-[180px] flex flex-col items-center justify-center",
                          dragDoc
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/30",
                        )}
                      >
                        {documentFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8" />

                            <span className="text-xs">{documentFile.name}</span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                setDocumentFile(null);
                              }}
                              className="text-xs text-destructive"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-7 w-7 mb-2" />

                            <p className="text-sm font-medium">
                              Clique para enviar
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

        {/* FOOTER */}
        <div className="px-8 py-5 border-t bg-muted/30 rounded-b-2xl flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              cleanFields();
              onClose();
            }}
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
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}

            {step < STEPS.length ? (
              <Button onClick={handleNext}>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={saveStudentData}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Atualizar
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

/* ======================================================
   HELPERS
====================================================== */

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
        <h4 className="font-semibold">{title}</h4>

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
      <label className="text-sm font-medium flex items-center gap-2">
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
