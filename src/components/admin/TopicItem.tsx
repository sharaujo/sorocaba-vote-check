
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import { CommentsList } from "./CommentsList";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  title: string;
  description: string;
  tiktok_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  text: string;
  user_name: string;
  created_at: string;
  topic_id: string;
}

interface TopicItemProps {
  topic: Topic;
  onDelete: (id: string) => void;
}

export const TopicItem = ({ topic, onDelete }: TopicItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {showComments ? "Ocultar" : "Ver"} Comentários
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(topic.id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>

      {showComments && (
        <CommentsList
          comments={comments}
          onCommentDeleted={(commentId) => {
            setComments(comments.filter((c) => c.id !== commentId));
          }}
        />
      )}
    </div>
  );
};
