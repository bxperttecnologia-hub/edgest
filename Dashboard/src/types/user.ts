export type UserRole = "admin" | "staff" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: Date;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  staff: "Equipe",
  student: "Estudante",
};

export const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
};
