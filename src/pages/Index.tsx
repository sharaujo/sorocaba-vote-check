
import { LocationCheck } from "@/components/LocationCheck";
import { VoteCard } from "@/components/VoteCard";

const Index = () => {
  // Dados de exemplo - serão substituídos por dados reais do backend
  const sampleChanges = [
    {
      id: "1",
      title: "Reforma da Praça Central",
      description: "O prefeito afirma ter finalizado a reforma da praça central com novos bancos e iluminação.",
      upvotes: 150,
      downvotes: 30,
      tiktokUrl: "https://www.tiktok.com/@rodrigomangaoficial",
    },
    {
      id: "2",
      title: "Novo Sistema de Ônibus",
      description: "Implementação de um novo sistema de monitoramento em tempo real para ônibus municipais.",
      upvotes: 200,
      downvotes: 45,
      tiktokUrl: "https://www.tiktok.com/@rodrigomangaoficial",
    },
  ];

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
          {sampleChanges.map((change) => (
            <VoteCard
              key={change.id}
              id={change.id}
              title={change.title}
              description={change.description}
              upvotes={change.upvotes}
              downvotes={change.downvotes}
              tiktokUrl={change.tiktokUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
