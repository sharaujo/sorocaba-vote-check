
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/admin/LoginForm";
import { AddTopicForm } from "@/components/admin/AddTopicForm";
import { TopicItem } from "@/components/admin/TopicItem";

type Topic = {
  id: string;
  title: string;
  description: string;
  tiktok_url: string | null;
  created_at: string;
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });
  const [topics, setTopics] = useState<Topic[]>([]);
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

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
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
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
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

        <AddTopicForm onTopicAdded={(newTopic) => setTopics([newTopic, ...topics])} />

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tópicos e Comentários</h2>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando tópicos...</p>
          ) : (
            <div className="space-y-6">
              {topics.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  onDelete={handleDeleteTopic}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
