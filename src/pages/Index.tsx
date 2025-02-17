
import { LocationCheck } from "@/components/LocationCheck";
import { VoteCard } from "@/components/VoteCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      // Primeiro, buscar todos os tópicos
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
        throw topicsError;
      }

      // Para cada tópico, buscar seus votos e comentários
      const topicsWithData = await Promise.all(topicsData.map(async (topic) => {
        // Buscar votos
        const { data: votes } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('topic_id', topic.id);

        // Buscar contagem de comentários
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
        const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;

        return {
          ...topic,
          upvotes,
          downvotes,
          commentCount: commentCount || 0
        };
      }));

      return topicsWithData;
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">
          Verificador de Mudanças em Sorocaba
        </h1>
        
        <div className="mb-6">
          <LocationCheck />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando tópicos...</div>
          ) : topics && topics.length > 0 ? (
            topics.map((topic) => (
              <VoteCard
                key={topic.id}
                id={topic.id}
                title={topic.title}
                description={topic.description}
                upvotes={topic.upvotes}
                downvotes={topic.downvotes}
                tiktokUrl={topic.tiktok_url}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum tópico encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
