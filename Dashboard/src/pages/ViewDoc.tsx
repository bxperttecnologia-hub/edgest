import { useState } from "react";
import {
  Upload,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  Filter,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const [searchparams] = useSearchParams();

  const id = searchparams.get("id");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"></div>
    </div>
  );
}
