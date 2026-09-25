"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Regex, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const apiUrl = import.meta.env.VITE_API_URL;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSession, setKeepSession] = React.useState(true);
  const { toast } = useToast();

  useEffect(() => {
    startInfo();
  }, []);

  const startInfo = () => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    setKeepSession(rememberMe);
  };

  // const remberContent = () => {

  // }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let verify = verifyFields();

    if (verify == true) {
      handleLogin();
    } else {
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      if (!email?.trim() || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Informe o email e a senha.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          keepSession,
        }),
      });

      let data = null;

      // 🔎 Tenta ler JSON com fallback seguro
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        }
      } catch (err) {
        console.warn("Resposta não é JSON válido");
      }

      // ❌ Erros HTTP (401, 500, etc)
      if (!response.ok) {
        toast({
          title: "Erro no login",
          description:
            data?.message ||
            `Erro ${response.status}: ${response.statusText || "Falha no servidor"}`,
          variant: "destructive",
        });
        return;
      }

      // 🔐 Garantir estrutura esperada
      if (!data?.token || !data?.user) {
        throw new Error("Resposta inválida do servidor");
      }

      // 💾 Armazenamento seguro
      const storage = keepSession ? localStorage : sessionStorage;

      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));
      storage.setItem("email", data.user.email || "");
      storage.setItem("rememberMe", String(keepSession));

      // ✅ Feedback ao usuário
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${data.user.name || "usuário"}!`,
      });

      // 🔄 Pequeno delay melhora UX (toast aparece antes de redirecionar)
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 800);
    } catch (error) {
      console.error("Erro inesperado no login:", error);

      toast({
        title: "Erro de conexão",
        description:
          error.message ||
          "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  const verifyFields = () => {
    if (!email) {
      toast({
        title: "Login: Falha!",
        description: "Campo de email está vázio!",
      });
      return false;
    }

    // Basic email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast({
        title: "Login: Falha!",
        description: "Email invalido!",
      });
      return false;
    } else if (password == null || password.length <= 0) {
      toast({
        title: "Login: Falha!",
        description: "Campo de password está vázio!",
      });

      return false;
    }
    return true;
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Bem-vindo ao <br />
          Edgest!
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          <b>Lidere a mudança na educação.</b>
          <br />
          Uma solução integrada que eleva a gestão, otimiza processos e promove
          experiências de ensino mais humanas e eficazes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative bg-blue-100 px-4 rounded-full">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 w-[90%] rounded-full border-border bg-[]"
          />
        </div>
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

        <div className="flex items-center space-x-3">
          <Checkbox
            id="terms1"
            checked={keepSession}
            onCheckedChange={(value) => setKeepSession(!!value)}
            className="
      h-5 w-5
      border border-gray-400
      rounded-sm
      bg-white
      flex items-center justify-center
      data-[state=checked]:bg-blue-600
      data-[state=checked]:border-blue-600
    "
          >
            <Check className="h-4 w-4 text-white" />
          </Checkbox>

          <label
            htmlFor="terms1"
            className="text-sm font-medium cursor-pointer text-gray-700"
          >
            Manter sessão ativa
          </label>
        </div>

        <Button
          type="submit"
          className="w-[90%] h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Entrar
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
        </div>
      </form>
    </div>
  );
};
