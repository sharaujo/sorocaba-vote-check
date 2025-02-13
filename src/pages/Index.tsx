
import { LocationCheck } from "@/components/LocationCheck";
import { VoteCard } from "@/components/VoteCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }

      return data;
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
                upvotes={topic.upvotes || 0}
                downvotes={topic.downvotes || 0}
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
