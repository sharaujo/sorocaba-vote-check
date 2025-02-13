
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: () => void;
}

const ADMIN_USER = "admin";
const ADMIN_PASS = "sorocaba2024";

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("adminAuth", "true");
      onLogin();
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo.",
      });
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login Administrativo</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};
