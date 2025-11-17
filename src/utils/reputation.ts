/**
 * Sistema de Reputação UnAjuda
 * 
 * Pontuação:
 * - Resposta aceita: +15 pontos
 * - Voto positivo recebido: +5 pontos
 * - Pergunta bem avaliada (>5 votos): +10 pontos
 */

export interface ReputationStats {
  acceptedAnswers: number;
  helpfulVotes: number;
  wellRatedQuestions: number;
}

export const POINTS = {
  ACCEPTED_ANSWER: 15,
  HELPFUL_VOTE: 5,
  WELL_RATED_QUESTION: 10,
} as const;

export const calculateReputation = (stats: ReputationStats): number => {
  const acceptedPoints = stats.acceptedAnswers * POINTS.ACCEPTED_ANSWER;
  const votesPoints = stats.helpfulVotes * POINTS.HELPFUL_VOTE;
  const questionsPoints = stats.wellRatedQuestions * POINTS.WELL_RATED_QUESTION;
  
  return acceptedPoints + votesPoints + questionsPoints;
};

export const getReputationLevel = (points: number): string => {
  if (points >= 1000) return "Mestre";
  if (points >= 500) return "Expert";
  if (points >= 250) return "Avançado";
  if (points >= 100) return "Intermediário";
  if (points >= 50) return "Iniciante";
  return "Novato";
};

export const getReputationColor = (points: number): string => {
  if (points >= 1000) return "text-gold";
  if (points >= 500) return "text-primary";
  if (points >= 250) return "text-blue-500";
  if (points >= 100) return "text-green-500";
  return "text-muted-foreground";
};
