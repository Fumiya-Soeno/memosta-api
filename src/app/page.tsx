"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// カードデッキを生成するヘルパー関数
const generateDeck = () => {
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

  let deck = [];
  suits.forEach((suit) => {
    values.forEach((card) => {
      deck.push({ suit, ...card });
    });
  });
  return deck;
};

// 確率を計算するヘルパー関数
const calculateProbabilities = (deck, currentCardValue) => {
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

  return { highProb: highProb.toFixed(2), lowProb: lowProb.toFixed(2) };
};

export default function Home() {
  // 初期値にUUIDを使ったユーザー名を生成
  const initialUsername = uuidv4();
  const [username, setUsername] = useState(initialUsername);
  const [deck, setDeck] = useState(generateDeck());
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [previousCard, setPreviousCard] = useState(null);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [draw, setDraw] = useState(false);
  const [totalProbability, setTotalProbability] = useState(1); // 初期値は1（100%）
  const [ranking, setRanking] = useState([]);

  // ランキングを取得する関数
  const fetchRanking = async () => {
    try {
      const response = await fetch("/api/high_and_low/get_ranking"); // ランキング取得APIにリクエストを送る
      const data = await response.json();
      if (data.success) {
        setRanking(data.ranking);
      }
    } catch (error) {
      console.error("Failed to fetch ranking", error);
    }
  };

  const { highProb, lowProb } = calculateProbabilities(
    deck,
    currentCard?.value
  );

  // ローカルストレージからユーザー名を取得
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchRanking();
  }, []);

  // ユーザー名を変更し、ローカルストレージに保存
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  // ゲームを開始して最初のカードを引く
  const startGame = () => {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffledDeck);
    const initialCard = shuffledDeck.pop();
    setCurrentCard(initialCard);
    setNextCard(null);
    setPreviousCard(null);
    setStreak(0);
    setGameOver(false);
    setDraw(false);
    setTotalProbability(1); // ゲーム開始時に確率をリセット
  };

  // カードを引くロジック
  const drawCard = (choice) => {
    if (deck.length === 0 || gameOver) return;

    const newCard = deck.pop();
    setNextCard(newCard);

    setPreviousCard(currentCard);

    if (newCard.value === currentCard.value) {
      setDraw(true);
    } else if (
      (choice === "HIGH" && newCard.value > currentCard.value) ||
      (choice === "LOW" && newCard.value < currentCard.value)
    ) {
      setStreak(streak + 1);
      setDraw(false);

      // 確率を計算して掛け合わせる
      const prob = choice === "HIGH" ? highProb / 100 : lowProb / 100;
      setTotalProbability((prev) => prev * prob); // 連勝率を累積する
    } else {
      setGameOver(true);
      setDraw(false);
      postGameOverData(); // ゲームオーバー時にAPIにデータ送信
    }

    setCurrentCard(newCard);
    setDeck(deck);
  };

  // ゲームオーバー時にAPIにデータをPOST
  const postGameOverData = () => {
    const data = {
      username: username,
      streak: streak,
      winRate: (totalProbability * 100).toFixed(2),
      date: new Date().toISOString(),
    };

    fetch("api/high_and_low/post_ranking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Data successfully posted:", result);
      })
      .catch((error) => {
        console.error("Error posting data:", error);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <div className="relative flex place-items-center">
          <h1 className="text-4xl mb-4 font-bold">HIGH & LOW</h1>
        </div>
      </div>

      <div className="mb-4 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {!currentCard && (
          <div className="col-span-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="mb-4 px-4 py-2 border border-gray-300 rounded text-black"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <button
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                onClick={startGame}
              >
                <h2 className={`mb-3 text-2xl font-semibold`}>Play</h2>
              </button>
            </div>
          </div>
        )}

        {currentCard && (
          <>
            <div className="col-span-4 text-center">
              <p>{streak}連勝</p>
              <p>連勝率: {(totalProbability * 100).toFixed(2)}%</p>{" "}
              {/* 連勝率を表示 */}
              {gameOver && (
                <div className="mt-4">
                  <h2 className="text-2xl text-red-500 mb-4">Game Over</h2>
                  <h2 className="text-2xl">
                    {previousCard?.suit}
                    {previousCard?.label}
                    {" → "}
                    {currentCard.suit}
                    {currentCard.label}
                    {draw && (
                      <h2 className="text-2xl text-yellow-500 mb-4">DRAW</h2>
                    )}
                  </h2>
                </div>
              )}
              {!gameOver && (
                <div className="mt-2">
                  <div>
                    <h2 className="text-2xl">
                      {previousCard?.suit}
                      {previousCard?.label}
                      {previousCard && " → "}
                      {currentCard.suit}
                      {currentCard.label}
                    </h2>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={() => drawCard("HIGH")}
                    >
                      {" "}
                      HIGH{" "}
                    </button>{" "}
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={() => drawCard("LOW")}
                    >
                      {" "}
                      LOW{" "}
                    </button>{" "}
                  </div>{" "}
                  <div className="mt-4">
                    {" "}
                    <p>HIGHの確率: {highProb}%</p> <p>LOWの確率: {lowProb}%</p>{" "}
                  </div>{" "}
                </div>
              )}
              {gameOver && (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded mt-4"
                  onClick={startGame}
                >
                  Retry
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <div className="mb-4 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="col-span-4">
          <h2 className="text-2xl font-semibold mb-4">
            連勝数ランキング TOP {ranking.length}
          </h2>
          <ul className="list-disc">
            {ranking.length > 0 ? (
              ranking.map((item, index) => (
                <li key={index} className="mb-2 text-xs list-none">
                  {index + 1}位 {item.username} - {item.streak}連勝 (連勝率:{" "}
                  {item.win_rate}%)
                  <br />
                  {new Date(item.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {new Date(item.date).toLocaleTimeString("ja-JP", {
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </li>
              ))
            ) : (
              <p>ランキング取得中...</p>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
