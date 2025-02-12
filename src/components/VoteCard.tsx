import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: number;
  text: string;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
}

interface VoteCardProps {
  title: string;
  description: string;
  tiktokUrl?: string;
  upvotes: number;
  downvotes: number;
  id: string; // Adicionado ID único para cada tópico
}

export const VoteCard = ({
  title,
  description,
  tiktokUrl,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  id,
}: VoteCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Carregar voto do usuário do localStorage
  const [userVote, setUserVote] = useState<"up" | "down" | null>(() => {
    const savedVote = localStorage.getItem(`vote_${id}`);
    return savedVote as "up" | "down" | null;
  });

  const handleVote = (type: "up" | "down") => {
    // Verifica se já votou neste tópico
    const savedVote = localStorage.getItem(`vote_${id}`);
    
    if (savedVote === type) {
      // Remove o voto
      localStorage.removeItem(`vote_${id}`);
      setUserVote(null);
      if (type === "up") {
        setUpvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev - 1);
      }
      toast({
        title: "Voto removido",
        description: "Seu voto foi removido com sucesso.",
      });
    } else if (!savedVote) {
      // Adiciona novo voto
      localStorage.setItem(`vote_${id}`, type);
      setUserVote(type);
      if (type === "up") {
        setUpvotes((prev) => prev + 1);
      } else {
        setDownvotes((prev) => prev + 1);
      }
      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso.",
      });
    } else {
      // Usuário já votou neste tópico
      toast({
        title: "Não é possível votar novamente",
        description: "Você já votou neste tópico. Remova seu voto anterior primeiro.",
        variant: "destructive",
      });
    }
  };

  const handleCommentVote = (commentId: number, type: "up" | "down") => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          if (comment.userVote === type) {
            // Remove o voto
            const updatedUpvotes =
              type === "up"
                ? comment.upvotes - 1
                : comment.upvotes;
            const updatedDownvotes =
              type === "down"
                ? comment.downvotes - 1
                : comment.downvotes;
            return {
              ...comment,
              upvotes: updatedUpvotes,
              downvotes: updatedDownvotes,
              userVote: null,
            };
          } else {
            // Se já votou no outro botão, ajusta os contadores
            let updatedUpvotes = comment.upvotes;
            let updatedDownvotes = comment.downvotes;

            if (comment.userVote === "up") {
              updatedUpvotes--;
            } else if (comment.userVote === "down") {
              updatedDownvotes--;
            }

            if (type === "up") {
              updatedUpvotes++;
            } else {
              updatedDownvotes++;
            }

            return {
              ...comment,
              upvotes: updatedUpvotes,
              downvotes: updatedDownvotes,
              userVote: type,
            };
          }
        }
        return comment;
      })
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        text: newComment,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      };
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={userVote === "up" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("up")}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{upvotes}</span>
          </Button>

          <Button
            variant={userVote === "down" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("down")}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{downvotes}</span>
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
            className="flex items-center gap-2"
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
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded p-3 space-y-2"
              >
                <p className="text-gray-700">{comment.text}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={comment.userVote === "up" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCommentVote(comment.id, "up")}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{comment.upvotes}</span>
                  </Button>
                  <Button
                    variant={comment.userVote === "down" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCommentVote(comment.id, "down")}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>{comment.downvotes}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
