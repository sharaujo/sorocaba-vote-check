
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Trash2, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_USER = "admin";
const ADMIN_PASS = "sorocaba2024";

type Topic = {
  id: string;
  title: string;
  description: string;
  tiktok_url: string | null;
  created_at: string;
};

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState({ title: "", description: "", tiktok_url: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTopics();
    }
  }, [isAuthenticated]);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast({
        title: "Erro ao carregar tópicos",
        description: "Não foi possível carregar os tópicos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
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

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handleAddTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("topics")
        .insert([newTopic])
        .select()
        .single();

      if (error) throw error;

      await supabase.from("admin_logs").insert([
        {
          action: "create",
          entity_type: "topic",
          entity_id: data.id,
          details: { topic: data },
        },
      ]);

      setTopics([data, ...topics]);
      setNewTopic({ title: "", description: "", tiktok_url: "" });
      toast({
        title: "Tópico adicionado",
        description: "O tópico foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding topic:", error);
      toast({
        title: "Erro ao adicionar tópico",
        description: "Não foi possível adicionar o tópico. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      const { error } = await supabase.from("topics").delete().eq("id", id);
      if (error) throw error;

      await supabase.from("admin_logs").insert([
        {
          action: "delete",
          entity_type: "topic",
          entity_id: id,
          details: { topic_id: id },
        },
      ]);

      setTopics(topics.filter((topic) => topic.id !== id));
      toast({
        title: "Tópico removido",
        description: "O tópico foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Erro ao remover tópico",
        description: "Não foi possível remover o tópico. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
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
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Tópico</h2>
          <div className="space-y-4">
            <Input
              placeholder="Título"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            />
            <Textarea
              placeholder="Descrição"
              value={newTopic.description}
              onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            />
            <Input
              placeholder="URL do TikTok (opcional)"
              value={newTopic.tiktok_url || ""}
              onChange={(e) => setNewTopic({ ...newTopic, tiktok_url: e.target.value })}
            />
            <Button onClick={handleAddTopic} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Tópico
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tópicos</h2>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando tópicos...</p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{topic.title}</h3>
                    <p className="text-gray-600 text-sm">{topic.description}</p>
                    {topic.tiktok_url && (
                      <a
                        href={topic.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Ver no TikTok
                      </a>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
