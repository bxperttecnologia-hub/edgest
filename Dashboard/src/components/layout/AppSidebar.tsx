import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
  MenuIcon,
  Lock
} from "lucide-react";
import "../../assets/css/sidebar.css";
import { useState, useEffect } from "react";


export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState({});

  useEffect(() => {
    const user_mail = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    const userData = async () => {

      const response = await fetch(`${apiUrl}/auth/userData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: user_mail })
      })

      const data = await response.json().catch(() => null);
      if (!response.ok) { console.log("Erro ao pegar cursos!") };
      return setUser(data[0]);

    }

    userData();

  }, [])


  const menuItems = user?.role === "admin" ? [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Estudantes", url: "/students", icon: Users },
    { title: "Cursos", url: "/courses", icon: BookOpen },
    { title: "Turmas", url: "/classes", icon: GraduationCap },
    { title: "Pagamentos", url: "/payments", icon: CreditCard },
    { title: "Relatórios", url: "/reports", icon: BarChart3 },
    { title: "Documentos", url: "/documents", icon: FileText },
    { title: "Acessos", url: "/access", icon: Lock },
    { title: "Configurações", url: "/settings", icon: Settings },
  ] : [
    { title: "Estudantes", url: "/students", icon: Users },
    { title: "Cursos", url: "/courses", icon: BookOpen },
    { title: "Turmas", url: "/classes", icon: GraduationCap },
    { title: "Documentos", url: "/documents", icon: FileText },
  ];

  const toggleSidebar = () => setOpen((prev) => !prev);
  const sidebarWidth = open ? 250 : 70; // largura expandida ou colapsada

  return (
    <>
      {/* Sidebar fixa */}
      <aside
        id="sidebar"
        style={{
          width: `${sidebarWidth}px`,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflow: "hidden",
          transition: "width 0.3s ease",
          zIndex: 100,
        }}
      >
        {/* Tab Icons */}
        <div id="tab">
          <div id="space">
            <button
              onClick={toggleSidebar}
              className="btn bg-white hover:bg-gray-100 p-1 rounded-sm ml-2 mt-2"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
          <ul id="icons">
            {menuItems.map((item) => (
              <li
                key={item.url}
                className={`link ${location.pathname === item.url ? "active" : ""}`}
              >
                <NavLink to={item.url} className="icon">
                  <item.icon className="h-5 w-5" />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Expandido */}
        <div id="tab1" className={open ? "active" : ""}>
          <div id="space1">
            <div className="logo">
              <div className="flex items-center gap-2 h-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                {open && (
                  <div>
                    <h2 className="text-sm font-semibold text-sidebar-foreground">
                      Centro Formação
                    </h2>
                    <p className="text-xs text-sidebar-foreground/60">
                      Sistema de Gestão
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ul id="links">
            {menuItems.map((item) => (
              <li
                key={item.url}
                className={`link ${location.pathname === item.url ? "active" : ""}`}
              >
                <NavLink to={item.url} className="icon">
                  {open && item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Espaço vazio para o conteúdo principal */}
      <div
        style={{
          marginLeft: open ? "250px" : "0px", // open = estado do sidebar
          transition: "margin-left 0.3s ease",
        }}
      />


    </>
  );
}
