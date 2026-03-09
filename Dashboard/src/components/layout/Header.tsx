import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/services/logoutService";
import { useEffect, useState } from "react";
import { getNotifications } from "@/services/notificationServices";
import { timeSince } from "@/services/auxiliarFunctions";

export function Header() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user_mail = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    const userData = async () => {
      const response = await fetch(`${apiUrl}/auth/userData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user_mail }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.log("Erro ao pegar cursos!");
      }
      return setUser(data[0]);
    };

    userData();
    localStorage.setItem("role", user?.role);
  }, []);

  useEffect(() => {
    let isMounted = true; // evita atualizar estado se o componente for desmontado

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        if (res && isMounted) {
          setNotifications(res); // assume que res já é um array
        }
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* <SidebarTrigger /> */}

      <div className="flex flex-1 items-center gap-4">
        <form className="flex-1 max-w-md">
          <div className="relative">
            <div className="flex items-center bg-blue-100 h-9 p-4 rounded-xl">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar estudantes, cursos..."
                className="pl-2 w-full bg-[]"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-danger">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p>Sem notificações</p>
            ) : (
              <div className="overflow-y-scroll">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 p-3"
                  >
                    <strong>{n.subject}</strong>
                    <div>{n.message}</div>

                    <p className="text-xs text-muted-foreground">
                      {timeSince(n.created_at)}
                    </p>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.name || "Admin User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || "admin@centro.ao"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onClick={logout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
