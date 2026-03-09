import { useState, useCallback, useEffect } from "react";
import {
  Plus, Users, Calendar, BookOpen, Search, Filter, CheckSquare, Trash, Book, InfoIcon,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCourse } from "@/services/coursesService";
import { AddClassModal } from "@/components/AddClassModal";
import { AddTeacherModal } from "@/components/AddTeacherModal";
import { getClasses, getTeachers } from "@/services/enrollmentsService";
import { course_sigla, formatLocalDate } from "@/services/auxiliarFunctions";
import { useDebounce } from "use-debounce";


const statusTConfig = {
  active: { label: "Activo", className: "bg-success text-success-foreground" },
  inactive: { label: "Inactivo", className: "bg-warning text-warning-foreground" },
};

const statusConfig = {
  active: { label: "Em Andamento", className: "bg-success text-success-foreground" },
  full: { label: "Lotada", className: "bg-warning text-warning-foreground" },
  upcoming: { label: "Brevemente", className: "bg-secondary text-secondary-foreground" },
  completed: { label: "Concluída", className: "bg-muted text-muted-foreground" },
};

export default function Classes() {
  const [selectMode, setSelectMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classesData, setClassesData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const selectedTeacher = [];
  const [selectedData, setSelectedData] = useState({});
  const { toast } = useToast()
  const [sortTeachers, setSortTeachers] = useState<null | string | object>(
    "recent"
  );
  const [page, setPage] = useState(1);
  const [limitData, setLimitData] = useState(40);
  const [minId, setMinId] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);


  const loadCourses = async () => {
    try {
      const data = await getCourse();
      setCoursesData(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao carregar cursos", error);
      }
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);


  const offset = (page - 1) * limitData;

  const sortKey =
    typeof sortTeachers === "string"
      ? sortTeachers
      : JSON.stringify(sortTeachers || "");


  const loadTeachers = useCallback(
    async (signal?: AbortSignal) => {
      // setLoading(true);

      const loadedIds = teachersData.map(s => { s.id });

      const body = {
        id: minId,
        limit: limitData,
        offset: offset,
        name: debouncedSearch,
        sort: sortKey,
        loadedIds
      };

      console.log("[getTeachersData] body:", body);

      try {
        const res = await getTeachers(body);

        const data = res?.data || res;

        console.log(res)
        setTeachersData(Array.isArray(data) ? data : data?.items ?? []);
      } catch {
        toast({
          title: "Erro",
          description: "Falha ao carregar formadores",
          variant: "destructive",
        });

      } finally {
        // setLoading(false);
      }
    },
    [minId, limitData, debouncedSearch, sortKey]
  );


  useEffect(() => {
    const controller = new AbortController();
    loadTeachers(controller.signal);
    return () => controller.abort();
  }, [loadTeachers])


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);



  const getAPIClassesData = useCallback(
    async () => {
      try {
        const res = await getClasses();
        setClassesData(res || []);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao carregar cursos",
          variant: "destructive",
        });
      }
    }
    , [toast])

  useEffect(() => {
    getAPIClassesData();
  }, [getAPIClassesData])

  const selectTeacher = () => {

  }

  const deletingEvent = (id) => {
    if (id) {
      let match = selectedTeacher.find(s => s.id == id);
      selectedTeacher.push(id);
      setTimeout(() => {
        // setOpenDialog(true)
      }, 100);
    }

    return 0;
  }

  const editingEvent = (id) => {
    if (id) {
      let match = teachersData.find(s => s.id == id);
      setSelectedData(match);
      setTimeout(() => {
        // setIsFormOpen(true)
      }, 300);
    }

    return 0;
  }

  const deleteTeacherData = async () => {
    if (selectedTeacher.length > 1) {
      //   selectedStudents.forEach(id => {
      //     const res = deleteStudent(id);
      //   })
    } else {
      // const res = deleteStudent(selectedStudents);
    }
  }

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


  return (
    <div className="space-y-6">

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
          <TabsTrigger value="instrutors">Instrutores</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">

          <AddClassModal
            isOpen={openDialog}
            onClose={setOpenDialog}
            courses={coursesData}
            instrutors={teachersData}
            refresh={getAPIClassesData}
          />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
              <p className="text-muted-foreground mt-1">
                Gestão de turmas e agendamento de aulas
              </p>
            </div>
            <Button className="gap-2" onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4" />
              Nova Turma
            </Button>
          </div>

          <div className="grid gap-6">
            {
              classesData.length > 0 ? <>
                {classesData.map((classItem) => {
                  const occupancyRate = (classItem.enrolled / classItem.capacity) * 100;
                  const statusInfo = statusConfig[classItem.status as keyof typeof statusConfig];

                  return (
                    <Card key={classItem.id} className="shadow-card hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">{classItem.code}</CardTitle>
                              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                            </div>
                            <CardDescription className="text-base">{classItem.course}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {classItem.enrolled}/{classItem.capacity}
                            </div>
                            <p className="text-xs text-muted-foreground">estudantes</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Taxa de Ocupação</span>
                            <span className="font-medium">{occupancyRate.toFixed(0)}%</span>
                          </div>
                          <Progress value={occupancyRate} className={occupancyRate >= 100 ? "color-red-400 h-2" : "h-2"} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground text-xs">Formador</p>
                              <p className="font-medium">{classItem.instructor}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground text-xs">Horário</p>
                              <p className="font-medium">{classItem.schedule}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground text-xs">Período</p>
                              <p className="font-medium">
                                {formatLocalDate(classItem.start_date)} À {formatLocalDate(classItem.end_date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" className="flex-1">
                            Ver Presenças
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Lista de Alunos
                          </Button>
                          <Button className="flex-1">Gerir Turma</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
                : <></>
            }
          </div>
        </TabsContent>

        <TabsContent value="instrutors" className="space-y-6">

          <AddTeacherModal
            isOpen={openDialog}
            onClose={setOpenDialog}
            refresh={loadTeachers}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Instrutores</h1>
              <p className="text-muted-foreground mt-1">
                Gestão de instrutores
              </p>
            </div>
            <Button className="gap-2" onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4" />
              Novo instructor
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
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
                        value={sortTeachers}
                        onValueChange={(value) => setSortTeachers(value)}
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
              </div>

              <div className="flex gap-0">
                <Button variant="outline" className="gap-2 ml-10 bg-blue-100 h-6" onClick={() => {
                  if (selectMode == false) {
                    setSelectMode(true)
                  } else {
                    setSelectMode(false)
                  }
                }}>
                  <CheckSquare className="h-4 w-4" />
                  Selecionar
                </Button>
                {selectMode && (
                  <>
                    <Button variant="secondary" className="gap-2 ml-2 h-6 btn hover:bg-red-900 bg-red-600 text-success-foreground" onClick={deletingEvent()}>
                      <Trash className="h-4 w-4" color="#fff" />
                      <p className="text-white">Eliminar {selectedTeacher.length > 0 ? `(${selectedTeacher.length})` : `(0)`}</p>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectMode == false ? <TableHead>#</TableHead> : <TableHead><Checkbox
                      id="terms1"
                      onCheckedChange={() => selectTeacher()}
                    /></TableHead>}
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachersData.map((teacher, index) => (
                    <TableRow id="row-line" key={teacher.id} className="hover:bg-accent/50">
                      {selectMode == true ?
                        <Checkbox
                          id="terms2"
                          onCheckedChange={selectTeacher(teacher.id)}
                        />
                        :
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                      }
                      <TableCell className="font-medium">
                        #{teacher.id}
                      </TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.courses || "_"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher.contact}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher.classes}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusTConfig[teacher.status as keyof typeof statusConfig]
                              .color
                          }
                        >
                          {
                            statusTConfig[teacher.status as keyof typeof statusConfig]
                              .label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" className="ml-2" size="sm">
                          <InfoIcon />
                        </Button>
                        <Button variant="secondary" className="ml-2" size="sm" onClick={() => editingEvent(teacher.id)}>
                          <Edit />
                        </Button>
                        <Button variant="destructive" className="ml-2" size="sm" onClick={() => deletingEvent(teacher.id)}>
                          <Trash />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-t w-[92%] absolute bottom-10">
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
        </TabsContent>
      </Tabs>

    </div>
  );
}
