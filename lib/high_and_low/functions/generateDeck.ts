// カードデッキを生成するヘルパー関数
import { Card } from "../type";

export const generateDeck = (): Card[] => {
  const suits = ["♠", "♣", "♦", "♥"];
  const values = [
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
    { value: 11, label: "J" },
    { value: 12, label: "Q" },
    { value: 13, label: "K" },
    { value: 14, label: "A" },
  ];

  let deck: Card[] = []; // 型を明示
  suits.forEach((suit) => {
    values.forEach((card) => {
      deck.push({ suit, ...card });
    });
  });
  return deck;
};
