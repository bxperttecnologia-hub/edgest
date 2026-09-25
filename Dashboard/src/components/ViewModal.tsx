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

interface ViewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export function ViewFileModal({
  isOpen,
  onClose,
  fileUrl,
  title,
}: ViewFileModalProps) {
  const { toast } = useToast();

  console.log(fileUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[920px] max-h-[92vh] bg-transparent overflow-y-auto rounded-2xl p-0 border-0">
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-none bg-transparent rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight"></DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mt-6">
            <div className="flex items-center justify-center" style={{
              width: '100%',
              height: '100%'
            }}>
              <iframe
                src={fileUrl}
                frameborder="0"
              ></iframe>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
