import { useEffect, useState } from "react";
import { User, UserRole } from "@/types/user";
import { toast, useToast } from "@/hooks/use-toast";
import { getUsers, addUsers, deleteUser, updateUserStatus } from "@/services/usersService";

export function useUsers() {
  const initialUsers: User[] = [];

  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  const load = async () => {
    const data = await getUsers();

    if (data) {
      setUsers(data);
    } else {
      toast({
        title: "Buscar usuários",
        description: "Erro ao buscar usuários!",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const addUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const exists = users.some((u) => u.email === data.email);
    if (exists) {
      toast({
        title: "Erro",
        description: "Já existe um usuário com este email.",
        variant: "destructive",
      });
      return false;
    }

    const newUser = await addUsers(data);

    if (newUser) {
      await load();
      // setUsers((prev) => [newUser, ...prev]);
      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      return true;
    } else {
      return false;
    }
  };

  const removeUser = async (id: string) => {
    const res = await deleteUser(Number(id));
    if (res) {
      await load();
      // setUsers((prev) => [newUser, ...prev]);
      toast({ title: "Removido", description: "Usuário removido." });
      return true;
    } else {
      toast({
        title: "Sucesso",
        description: "Não foi possivel deletar Usuário!",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u,
      ),
    );

    setTimeout(async () => {

      const user = users.find(u => u.id === id);
      const playLoad = {
        id: user.id,
        status: user.status
      }
      const res = await updateUserStatus(playLoad);
      if (res) {
        await load();
        toast({ title: "Atualizado", description: "Status atualizado." });
        return true;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possivel atualizar o status do Usuário!",
          variant: "destructive",
        });
        return false;
      }
    }, 200);
  };

  return { users, addUser, removeUser, toggleStatus };
}
