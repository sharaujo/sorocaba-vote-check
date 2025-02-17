
import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Comment {
  id: string;
  text: string;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
  created_at: string;
  user_name: string;
}

interface VoteCardProps {
  title: string;
  description: string;
  tiktokUrl?: string;
  upvotes: number;
  downvotes: number;
  id: string;
}

export const VoteCard = ({
  title,
  description,
  tiktokUrl,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  id,
}: VoteCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', crypto.randomUUID());
    }
  }, []);

  const { data: voteData, refetch: refetchVotes } = useQuery({
    queryKey: ['votes', id],
    queryFn: async () => {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('topic_id', id);

      if (error) throw error;

      const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;

      // Buscar voto do usuário atual
      const userId = localStorage.getItem('user_id');
      const { data: userVote } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('topic_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      return {
        upvotes,
        downvotes,
        userVote: userVote?.vote_type as "up" | "down" | null
      };
    },
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('topic_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    enabled: showComments,
  });

  const handleVote = async (type: "up" | "down") => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      if (voteData?.userVote === type) {
        // Remove o voto
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('topic_id', id)
          .eq('user_id', userId);

        if (error) throw error;

        toast({
          title: "Voto removido",
          description: "Seu voto foi removido com sucesso.",
        });
      } else {
        // Remove voto anterior se existir
        if (voteData?.userVote) {
          await supabase
            .from('votes')
            .delete()
            .eq('topic_id', id)
            .eq('user_id', userId);
        }

        // Adiciona novo voto
        const { error } = await supabase
          .from('votes')
          .insert([
            {
              topic_id: id,
              user_id: userId,
              vote_type: type,
            },
          ]);

        if (error) throw error;

        toast({
          title: "Voto registrado",
          description: "Seu voto foi registrado com sucesso.",
        });
      }

      // Atualiza os votos
      refetchVotes();
    } catch (error) {
      console.error('Error handling vote:', error);
      toast({
        title: "Erro ao processar voto",
        description: "Não foi possível processar seu voto. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            topic_id: id,
            text: newComment.trim(),
            user_name: 'Anônimo', // Por enquanto, todos os comentários são anônimos
          },
        ]);

      if (error) throw error;

      setNewComment("");
      refetchComments();
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={voteData?.userVote === "up" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("up")}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{voteData?.upvotes || 0}</span>
          </Button>

          <Button
            variant={voteData?.userVote === "down" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("down")}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{voteData?.downvotes || 0}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comentários ({comments.length})</span>
          </Button>
        </div>

        {tiktokUrl && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => window.open(tiktokUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Assista no TikTok
          </Button>
        )}
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          <div className="mb-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="mb-2"
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Comentar
            </Button>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{comment.user_name}</p>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
