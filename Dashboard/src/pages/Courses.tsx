import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
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
import { AddCourseDialog } from "@/components/AddCourseModal";
import { CourseDetailModal } from "@/components/CourseDetailModal";


export default function Courses() {
  const [coursesData, setCoursesData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog1, setOpenDialog1] = useState(false);
  const [course_id, setCourse_id] = useState(0);
  const { toast } = useToast()



  const loadInitialData = useCallback(async () => {
    try {
      const res = await getCourse();
      setCoursesData(res || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cursos",
        variant: "destructive",
      });
    }
  }, [toast])

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData])

  return (
    <div className="space-y-6">
      <AddCourseDialog
        isOpen={openDialog}
        onClose={() => {
          setOpenDialog(false);
          // setEditingEvent(null);
        }}
        refresh={loadInitialData}
      />

      <CourseDetailModal
        isOpen={openDialog1}
        onClose={() => { setOpenDialog1 }}
        courseID={course_id}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de cursos e programas de formação
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" />
          Novo Curso
        </Button>
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coursesData.map((course) => (
          <Card key={course.id} className="flex flex-col shadow-card hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <Badge variant="outline">{course.code}</Badge>
                </div>
                <Badge className="bg-success text-success-foreground">Ativo</Badge>
              </div>
              <CardTitle className="mt-4">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-medium">{course?.duration}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nível:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estudantes:</span>
                  <span className="font-medium">{course.total_students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço:</span>
                  <span className="font-semibold text-primary">
                    {course.price.toLocaleString()} AKZ
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => setOpenDialog1(true)}>
                Ver Detalhes
              </Button>
              <Button className="flex-1">Editar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
