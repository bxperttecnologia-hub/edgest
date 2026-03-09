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

interface CourseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseID: number;
}

export const CourseDetailModal = ({
    isOpen,
    onClose,
    courseID
}: CourseDetailModalProps) => {

    let courses = [];
    let courseDetail = [];

    useEffect(() => {
        const loadData = async() => {
           const data = await getCourse();

           if(data) courses = data || [];

           setTimeout(() => {
            courseDetail = courses.find(c => c?.id == courseID);
           }, 300);
            
        }

        loadData()
    }, [])

    console.log(courseDetail)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                
            </DialogContent>
        </Dialog>
    )

}