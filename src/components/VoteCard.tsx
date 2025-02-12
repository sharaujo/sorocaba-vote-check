
import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface VoteCardProps {
  title: string;
  description: string;
  tiktokUrl?: string;
  upvotes: number;
  downvotes: number;
}

export const VoteCard = ({
  title,
  description,
  tiktokUrl,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
}: VoteCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [showComments, setShowComments] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      // Remove o voto
      setUserVote(null);
      if (type === "up") {
        setUpvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev - 1);
      }
    } else {
      // Se já votou no outro botão, remove o voto anterior
      if (userVote) {
        if (userVote === "up") {
          setUpvotes((prev) => prev - 1);
        } else {
          setDownvotes((prev) => prev - 1);
        }
      }
      // Adiciona o novo voto
      setUserVote(type);
      if (type === "up") {
        setUpvotes((prev) => prev + 1);
      } else {
        setDownvotes((prev) => prev + 1);
      }
    }
  };

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
            <span>Comentários</span>
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
          <p className="text-gray-500 text-center">
            Área de comentários será implementada em seguida
          </p>
        </div>
      )}
    </div>
  );
};
