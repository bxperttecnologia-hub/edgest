import { User, roleLabels, statusLabels } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ToggleLeft, ToggleRight, ShieldCheck, Pencil, Eye, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateForInput } from "@/services/auxiliarFunctions";

interface UserTableProps {
  users: User[];
  onRemove: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <ShieldCheck className="h-3.5 w-3.5" />,
  staff: <Users className="h-3.5 w-3.5" />,
  user: <Eye className="h-3.5 w-3.5" />,
};

const UserTable = ({ users, onRemove, onToggleStatus }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Nenhum usuário cadastrado</p>
        <p className="text-sm">Adicione um novo usuário usando o formulário acima.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="group">
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="gap-1"
                >
                  {roleIcons[user.role]}
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    user.status === "active"
                      ? "border-success/30 text-success bg-success/10"
                      : "border-destructive/30 text-destructive bg-destructive/10"
                  }
                >
                  {statusLabels[user.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDateForInput(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(user.id)}
                    title={user.status === "active" ? "Desativar" : "Ativar"}
                  >
                    {user.status === "active" ? (
                      <ToggleRight className="h-4 w-4 text-success" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(user.id)}
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
