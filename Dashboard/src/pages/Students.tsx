import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Trash,
  Book,
  InfoIcon,
  Edit,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import "../../public/styles/dialog.css";
import { AddStudentFormModal } from "@/components/AddStudentModal";
import { AddEnrollmentModal } from "@/components/AddEnrollments";
import { EditStudentFormModal } from "@/components/editStudentModal";
import { ViewEnrollmentsModal } from "@/components/deleteOptions";
import { useToast } from "@/hooks/use-toast";
import { getCourse } from "@/services/coursesService";
import { deleteStudent, getStudents } from "@/services/studentService";
import { getClasses, getStudentEnrollments } from "@/services/enrollmentsService";
import { useDebounce } from "use-debounce";

export default function Students() {
  const { toast } = useToast();

  // ========================= STATES =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [sortStudents, setSortStudents] = useState<null | string | object>(
    "recent",
  );

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [filterValue, setFilterValue] = useState(null);
  const [minId, setMinId] = useState(1);
  const [page, setPage] = useState(1);
  const [limitData, setLimitData] = useState(40);
  const [minIdHistory, setMinIdHistory] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [sortStatus, setSortStatus] = useState("");
  const [studentData, setStudentData] = useState<any[]>([]);
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogEnroll, setOpenDialogEnroll] = useState(false);
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [openDialogEnroll1, setOpenDialogEnroll1] = useState(false);

  const [selectedData, setSelectedData] = useState<any>(null);
  const [studentID, setStudentID] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  // ========================= CONFIG =========================
  const statusConfig = {
    active: { label: "Ativo", color: "bg-success text-success-foreground" },
    inactive: { label: "Inativo", color: "bg-muted text-muted-foreground" },
    graduated: {
      label: "Diplomado",
      color: "bg-primary text-primary-foreground",
    },
  };

  const offset = (page - 1) * limitData;

  // ========================= DATA FETCH =========================

  const loadInitialData = useCallback(async () => {
    try {
      const [courses, classes] = await Promise.all([getCourse(), getClasses()]);
      setCoursesData(courses || []);
      setClassesData(classes || []);
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao carregar cursos ou turmas",
        variant: "destructive",
      });
    }
  }, [toast]);

  // debounce da busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // sort key estável
  const sortKey =
    typeof sortStudents === "string"
      ? sortStudents
      : JSON.stringify(sortStudents || "");

  // função de buscar produtos
  const getStudentsData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      const loadedIds = studentData.map((s) => {
        s.id;
      });

      const body = {
        id: parseInt(minId),
        limit: parseInt(limitData),
        offset: parseInt(offset),
        name: debouncedSearch,
        sort: sortKey,
        status: sortStatus,
        loadedIds,
      };

      console.log("[getStudentsData] body:", body);

      try {
        const res = await getStudents(body);

        const data = res?.data || res;

        console.log(res);
        setStudentData(Array.isArray(data) ? data : (data?.items ?? []));
      } catch {
        toast({
          title: "Erro",
          description: "Falha ao carregar estudantes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [minId, limitData, debouncedSearch, sortKey, filterValue, sortStatus],
  );

  // chama getProducts sempre que dependências mudarem
  useEffect(() => {
    const controller = new AbortController();
    getStudentsData(controller.signal);
    return () => controller.abort();
  }, [getStudentsData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ========================= DERIVED DATA =========================
  const studentsInscritos = useMemo(
    () => studentData.filter((s) => s?.courses?.length > 0),
    [studentData],
  );

  const studentsNaoInscritos = useMemo(
    () => studentData.filter((s) => !s?.courses?.length),
    [studentData],
  );

  // ========================= ACTIONS =========================
  const toggleSelectStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const deletingEvent = (id?: number) => {
    if (id) setSelectedStudents([id]);
    setOpenDialogDelete(true);
  };

  const loadGetStudentEnrollments = async (id) => {
    const data = await getStudentEnrollments(id);
  
      if (data) {
        setEnrollments(data);
      } else {
        toast({
          title: "Erro ao buscar inscrições!",
          variant: "destructive",
        });
      }
  }

  const onRemoveEvent = async (id?: number) => {
    await loadGetStudentEnrollments(id);
    setTimeout(() => {
      setStudentID(id)
      setOpenDialogEnroll1(true);
    }, 200);
  };

  const editingEvent = (id: number) => {
    const match = studentData.find((s) => s.id === id);
    if (match) {
      setSelectedData(match);
      setOpenDialogEdit(true);
    }
  };

  const deleteStudentData = async () => {
    try {
      await Promise.all(selectedStudents.map((id) => deleteStudent(id)));
      toast({ title: "Sucesso", description: "Estudante(s) eliminado(s)" });
      setSelectedStudents([]);
      setOpenDialogDelete(false);
      getStudentsData();
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao eliminar",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setMinId(0);
  }, [limitData]);

  // avançar
  const handleNext = () => {
    if (insights.total_products > 0 && insights.last_product) {
      setMinIdHistory((prev) => [...prev, minId]); // guarda posição atual
      setMinId(insights.last_product); // vai para o próximo
      console.log(minId);
    }
  };

  // voltar
  const handlePrev = () => {
    setMinIdHistory((prev) => {
      if (prev.length === 0) return prev; // nada no histórico → não faz nada

      const newHistory = [...prev];
      const lastMinId = newHistory.pop(); // pega último salvo

      if (lastMinId !== undefined) {
        setMinId(lastMinId); // volta para anterior
      }

      return newHistory; // atualiza histórico sem o último
    });
  };

  // ========================= DELETE DIALOG =========================
  const DeleteDialog = () => (
    <Dialog open={openDialogDelete} onOpenChange={setOpenDialogDelete}>
      <DialogContent className="sm:max-w-[500px] max-h-[25vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="DialogTitle flex items-center gap-2">
            <Trash size={30} color="red" /> Apagar estudante!
          </DialogTitle>
          <hr />
        </DialogHeader>

        <p className="text-center">
          Tem certeza que pretende eliminar{" "}
          {selectedStudents.length > 1 ? "estes estudantes" : "este estudante"}?
        </p>

        <div className="flex justify-center gap-2">
          <Button
            onClick={deleteStudentData}
            className="w-20 h-4 bg-green-600 hover:bg-green-900"
          >
            Sim
          </Button>
          <Button
            onClick={() => setOpenDialogDelete(false)}
            className="w-20 h-4 bg-red-600 hover:bg-red-900"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ========================= RENDER =========================
  return (
    <div className="space-y-6">
      <DeleteDialog />

      <ViewEnrollmentsModal
        isOpen={openDialogEnroll1}
        enrollments={enrollments}
        onClose={setOpenDialogEnroll1}
        refresh={loadGetStudentEnrollments(studentID)}
        onDelete={deleteStudentData}
      />

      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estudantes</h1>
          <p className="text-muted-foreground">
            Gestão de estudantes matriculados
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Estudante
        </Button>
      </div>

      <AddStudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setSelectedData(null);
          setIsFormOpen(false);
        }}
        refresh={getStudentsData}
      />

      <AddEnrollmentModal
        isOpen={openDialogEnroll}
        onClose={setOpenDialogEnroll}
        classes={classesData}
        students={selectedStudents}
        courses={coursesData}
        refresh={getStudentsData}
      />

      <EditStudentFormModal
        isOpen={openDialogEdit}
        onClose={setOpenDialogEdit}
        classes={classesData}
        selectedData={selectedData}
        courses={coursesData}
        refresh={getStudentsData}
      />

      {/* Search & Actions */}
      <div className="flex gap-4 justify-between items-center">
        <div className="flex w-[600px]">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-5 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou número..."
              className="pl-8"
              onInput={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex ml-[60px] items-center">
            <label htmlFor="" className="mr-4">
              Ordenar por:{" "}
            </label>
            <div className="w-[130px] mr-8 bg-[#F3F4F6] dark:bg-[#202023] rounded py-0 h-[40px] flex items-center justify-center">
              <Select
                value={sortStudents}
                onValueChange={(value) => setSortStudents(value)}
                className="w-[100px] bg-[#F3F4F6] dark:bg-[#202023] rounded"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="name_asc">Nome (A → Z)</SelectItem>
                  <SelectItem value="name_desc">Nome (Z → A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-blue-100 h-6"
            onClick={() => setSelectMode((prev) => !prev)}
          >
            <CheckSquare className="h-4 w-4" /> Selecionar
          </Button>

          {selectMode && (
            <>
              <Button
                className="h-6 bg-green-600 hover:bg-green-900"
                onClick={() => setOpenDialogEnroll(true)}
              >
                <Book className="h-4 w-4 text-white" /> Add Turma (
                {selectedStudents.length})
              </Button>

              <Button
                className="h-6 bg-red-600 hover:bg-red-900"
                onClick={() => setOpenDialogDelete(true)}
              >
                <Trash className="h-4 w-4 text-white" /> Eliminar (
                {selectedStudents.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs + Tables permanecem iguais (sem alterações visuais) */}
      <Tabs defaultValue="std1" className="space-y-6">
        <TabsList>
          <TabsTrigger value="std1">Inscritos</TabsTrigger>
          <TabsTrigger value="std2">N\Inscritos</TabsTrigger>
        </TabsList>

        <TabsContent value="std1" className="space-y-6">
          {/* Tabela de estudantes */}
          <div className="rounded-lg border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode ? (
                    <TableHead>
                      <Checkbox
                        id="selectAll"
                        checked={selectedStudents.length === studentData.length}
                        onCheckedChange={() => {
                          if (selectedStudents.length === studentData.length)
                            setSelectedStudents([]);
                          else
                            setSelectedStudents(studentData.map((s) => s.id));
                        }}
                      />
                    </TableHead>
                  ) : (
                    <TableHead>#</TableHead>
                  )}
                  <TableHead>Número</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {studentData.length > 0 ? (
                  <>
                    {studentsInscritos.map((student, index) => (
                      <TableRow key={student.id} className="hover:bg-accent/50">
                        {selectMode ? (
                          <TableCell>
                            <Checkbox
                              style={{
                                borderWidth: 1,
                                borderColor: "#000",
                              }}
                              id={`select-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() =>
                                toggleSelectStudent(student.id)
                              }
                            />
                          </TableCell>
                        ) : (
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          #{student.student_number}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          {Array.isArray(student?.courses) &&
                          student.courses.length > 0
                            ? student.courses
                                .map((c) => c?.title ?? "")
                                .filter(Boolean)
                                .join(", ")
                            : "_"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {student.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.contact}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig["active"]?.color}>
                            {statusConfig["active"]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" className="ml-2" size="sm">
                            <InfoIcon />
                          </Button>
                          <Button
                            variant="secondary"
                            className="ml-2"
                            size="sm"
                            onClick={() => editingEvent(student.id)}
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="destructive"
                            className="ml-2"
                            size="sm"
                            onClick={() => onRemoveEvent(student.id)}
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    <h4>Nenhum estudante encontrado</h4>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="std2" className="space-y-6">
          {/* Tabela de estudantes */}
          <div className="rounded-lg border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode ? (
                    <TableHead>
                      <Checkbox
                        id="selectAll"
                        checked={selectedStudents.length === studentData.length}
                        onCheckedChange={() => {
                          if (selectedStudents.length === studentData.length)
                            setSelectedStudents([]);
                          else
                            setSelectedStudents(studentData.map((s) => s.id));
                        }}
                      />
                    </TableHead>
                  ) : (
                    <TableHead>#</TableHead>
                  )}
                  <TableHead>Número</TableHead>
                  <TableHead>Nome</TableHead>
                  {/* <TableHead>Curso</TableHead> */}
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {studentData.length > 0 ? (
                  <>
                    {studentsNaoInscritos.map((student, index) => (
                      <TableRow key={student.id} className="hover:bg-accent/50">
                        {selectMode ? (
                          <TableCell>
                            <Checkbox
                              style={{
                                borderWidth: 1,
                                borderColor: "#000",
                              }}
                              id={`select-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() =>
                                toggleSelectStudent(student.id)
                              }
                            />
                          </TableCell>
                        ) : (
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          #{student.student_number}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        {/* <TableCell>{student.course || "_"}</TableCell> */}
                        <TableCell className="text-muted-foreground">
                          {student.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.contact}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig["inactive"]?.color}>
                            {statusConfig["inactive"]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" className="ml-2" size="sm">
                            <InfoIcon />
                          </Button>
                          <Button
                            variant="secondary"
                            className="ml-2"
                            size="sm"
                            onClick={() => editingEvent(student.id)}
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="destructive"
                            className="ml-2"
                            size="sm"
                            onClick={() => deletingEvent(student.id)}
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    <h4>Nenhum estudante encontrado!</h4>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t w-[100%] bottom-10">
        {/* seletor de quantidade */}
        <fieldset className="flex flex-row items-start items-center gap-2">
          {/* <legend className="text-sm text-muted-foreground">
                Exibindo
              </legend> */}
          <div className="flex gap-1">
            {[10, 20, 50, 100].map((size) => (
              <Button
                key={size}
                size="sm"
                variant={limitData === size ? "default" : "outline"}
                onClick={() => setLimitData(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </fieldset>

        {/* paginação baseada em minId */}
        <div className="flex gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={minId === 0}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            Próximo
          </Button>
        </div>
      </div>

      {isLoading && <Loader text="Carregando produtos..." />}
    </div>
  );
}
