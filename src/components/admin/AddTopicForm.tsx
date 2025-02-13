
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddTopicFormProps {
  onTopicAdded: (newTopic: any) => void;
}

export const AddTopicForm = ({ onTopicAdded }: AddTopicFormProps) => {
  const [newTopic, setNewTopic] = useState({ title: "", description: "", tiktok_url: "" });

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

      onTopicAdded(data);
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

  return (
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
  );
};
