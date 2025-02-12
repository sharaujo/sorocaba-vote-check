
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const LocationCheck = () => {
  const [isInSorocaba, setIsInSorocaba] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Coordenadas aproximadas de Sorocaba
        const sorocabaLat = -23.4961;
        const sorocabaLong = -47.4561;
        
        // Calcula a distância usando a fórmula de Haversine
        const distance = getDistanceFromLatLonInKm(
          position.coords.latitude,
          position.coords.longitude,
          sorocabaLat,
          sorocabaLong
        );

        // Considera dentro de Sorocaba se estiver em um raio de 20km
        setIsInSorocaba(distance <= 20);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Erro de localização",
          description: "Por favor, permita o acesso à sua localização para usar o app.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    checkLocation();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gray-100 p-3 rounded-lg flex items-center justify-center">
        <span className="text-gray-600">Verificando localização...</span>
      </div>
    );
  }

  if (isInSorocaba === null) {
    return null;
  }

  return (
    <div
      className={`w-full p-3 rounded-lg flex items-center justify-between ${
        isInSorocaba ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <div className="flex items-center gap-2">
        {isInSorocaba ? (
          <CheckCircle className="text-green-600 h-5 w-5" />
        ) : (
          <AlertCircle className="text-red-600 h-5 w-5" />
        )}
        <span
          className={`font-medium ${
            isInSorocaba ? "text-green-600" : "text-red-600"
          }`}
        >
          {isInSorocaba
            ? "Você está em Sorocaba!"
            : "Você precisa estar em Sorocaba para votar"}
        </span>
      </div>
    </div>
  );
};

// Função auxiliar para calcular distância entre coordenadas
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
