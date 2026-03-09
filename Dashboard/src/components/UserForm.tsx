import { useState } from "react";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, EyeOff, Eye, Lock, User, Mail } from "lucide-react";
import { roleLabels } from "../types/user";

interface UserFormProps {
  onSubmit: (data: { name: string; email: string; password: string; role: UserRole }) => boolean;
}

const UserForm = ({ onSubmit }: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const success = onSubmit({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
    });
    if (success) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="">Nome</Label>
          <div className="relative bg-blue-100 px-4 rounded-full">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10 h-12 w-[90%] rounded-full border-border bg-[]"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="">E-mail</Label>
          <div className="relative bg-blue-100 px-4 rounded-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="joao@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-12 w-[90%] rounded-full border-border bg-[]"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 items-end">
        <div className="space-y-2">
          <Label>Permissão</Label>
          <div className="relative bg-blue-100 px-4 rounded-full">
            <Select
              className="pl-10 h-16 w-[98%] rounded-full border-border bg-[]"
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Senha</Label>
          <div className="relative bg-blue-100 px-4 rounded-full">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-3 h-12 w-[90%] rounded-full border-border bg-[]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className="btn h-12 rounded-full hover:bg-green-900 bg-green-600 text-success-foreground px-5 py-0"
      >
        <UserPlus className="h-4 w-4" />
        Adicionar Usuário
      </Button>
    </form>
  );
};

export default UserForm;
