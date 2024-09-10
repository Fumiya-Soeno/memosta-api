// 確率を計算するヘルパー関数
import { Card } from "../type";

export const calculateProbabilities = (
  deck: Card[],
  currentCardValue: number
) => {
  if (!currentCardValue) return { highProb: 0, lowProb: 0 };

  const remainingHighCards = deck.filter(
    (card) => card.value > currentCardValue
  ).length;
  const remainingLowCards = deck.filter(
    (card) => card.value < currentCardValue
  ).length;
  const totalRemainingCards = deck.length;

  const highProb =
    totalRemainingCards > 0
      ? (remainingHighCards / totalRemainingCards) * 100
      : 0;
  const lowProb =
    totalRemainingCards > 0
      ? (remainingLowCards / totalRemainingCards) * 100
      : 0;

  return {
    highProb: parseFloat(highProb.toFixed(1)),
    lowProb: parseFloat(lowProb.toFixed(1)),
  };
};
