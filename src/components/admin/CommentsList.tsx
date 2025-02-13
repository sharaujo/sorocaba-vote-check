
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  text: string;
  user_name: string;
  created_at: string;
  topic_id: string;
}

interface CommentsListProps {
  comments: Comment[];
  onCommentDeleted: (commentId: string) => void;
}

export const CommentsList = ({ comments, onCommentDeleted }: CommentsListProps) => {
  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      onCommentDeleted(commentId);
      toast({
        title: "Comentário removido",
        description: "O comentário foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erro ao remover comentário",
        description: "Não foi possível remover o comentário. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-200">
      <h4 className="font-medium mb-2">Comentários</h4>
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between bg-gray-50 p-3 rounded"
            >
              <div>
                <p className="text-sm font-medium">{comment.user_name}</p>
                <p className="text-sm text-gray-600">{comment.text}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remover
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Nenhum comentário ainda.</p>
      )}
    </div>
  );
};
