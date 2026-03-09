import UserForm from "@/components/UserForm";
import UserTable from "@/components/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { Users, Shield } from "lucide-react";

const Access = () => {
  const { users, addUser, removeUser, toggleStatus } = useUsers();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gerenciamento de Acesso</h1>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie o acesso dos usuários ao sistema
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            {users.length} {users.length === 1 ? "usuário" : "usuários"}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8 sm:px-6">
        {/* Form Card */}
        <section className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Novo Usuário</h2>
          <UserForm onSubmit={addUser} />
        </section>

        {/* Users Table */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Usuários Cadastrados</h2>
          <UserTable
            users={users}
            onRemove={removeUser}
            onToggleStatus={toggleStatus}
          />
        </section>
      </main>
    </div>
  );
};

export default Access;
