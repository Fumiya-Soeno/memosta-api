"use client";

import { useState, useEffect } from "react";

import { Card, RankingItem } from "../../lib/high_and_low/type";
import { generateDeck } from "../../lib/high_and_low/functions/generateDeck";
import { calculateProbabilities } from "../../lib/high_and_low/functions/calculateProbabilities";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [deck, setDeck] = useState<Card[]>(generateDeck());
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [previousCard, setPreviousCard] = useState<Card | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [draw, setDraw] = useState<boolean>(false);
  const [totalProbability, setTotalProbability] = useState<number>(1); // 初期値は1（100%）
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [winRateRanking, setWinRateRanking] = useState<RankingItem[]>([]); // 追加
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用の状態管理

  // ランキングを取得する関数
  const fetchRanking = async () => {
    try {
      const response = await fetch("/api/high_and_low/get_ranking"); // ランキング取得APIにリクエストを送る
      const data = await response.json();
      if (data.success) {
        setRanking(data.ranking);
        setWinRateRanking(data.winRateRanking); // 追加
      }
    } catch (error) {
      console.error("Failed to fetch ranking", error);
    }
  };

  const { highProb, lowProb } = calculateProbabilities(
    deck,
    currentCard?.value || 0
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
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  // ゲームを開始して最初のカードを引く
  const startGame = () => {
    // ニックネームが入力されていない場合エラーを表示
    if (!username.trim()) {
      setError("ニックネームは必須です");
      return;
    }

    // エラーを消してゲームを開始
    setError(null);

    const newDeck = generateDeck(); // 新しいデッキを生成
    const shuffledDeck = [...newDeck].sort(() => Math.random() - 0.5); // デッキをシャッフル
    setDeck(shuffledDeck);
    const initialCard = shuffledDeck.pop() || null;
    setCurrentCard(initialCard);
    setNextCard(null);
    setPreviousCard(null);
    setStreak(0);
    setGameOver(false);
    setDraw(false);
    setTotalProbability(1); // ゲーム開始時に確率をリセット
  };

  // カードを引くロジック
  const drawCard = (choice: "HIGH" | "LOW") => {
    if (deck.length === 0 || gameOver) return;

    const newCard = deck.pop() || null;
    setNextCard(newCard);

    setPreviousCard(currentCard);

    if (newCard && currentCard && newCard.value === currentCard.value) {
      setDraw(true);
    } else if (
      newCard &&
      currentCard &&
      ((choice === "HIGH" && newCard.value > currentCard.value) ||
        (choice === "LOW" && newCard.value < currentCard.value))
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

    fetch("/api/high_and_low/post_ranking", {
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
    <main className="flex flex-col items-center justify-between p-12">
      <h1 className="text-4xl mb-4 font-bold">HIGH & LOW</h1>
      <div className="mb-4 grid text-center">
        {!currentCard && (
          <div className="col-span-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="mb-4 px-4 py-2 border border-gray-300 rounded text-black"
                placeholder="ニックネーム（必須）"
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
            </div>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={startGame}
            >
              Play
            </button>
          </div>
        )}

        {currentCard && (
          <>
            <div className="col-span-4 text-center">
              <p>{streak}連勝</p>
              <p>連勝率: {(totalProbability * 100).toFixed(2)}%</p>{" "}
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
                      HIGH
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={() => drawCard("LOW")}
                    >
                      LOW
                    </button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <p className="px-4 py-2 text-white rounded">{highProb}%</p>
                    <p className="px-4 py-2 text-white rounded">{lowProb}%</p>
                  </div>
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
      <div className="mb-4 grid text-center">
        <div className="col-span-4">
          <h2 className="text-2xl font-semibold mb-4">
            連勝数ランキング TOP {ranking.length}
          </h2>
          <ul className="list-disc">
            {ranking.length > 0 ? (
              ranking.map((item, index) => {
                const date = new Date(item.date);

                return (
                  <li key={index} className="mb-2 text-xs list-none">
                    {index + 1}位 {item.username} - {item.streak}連勝 (連勝率:{" "}
                    {item.win_rate}%)
                    <br />
                    {date.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {date.toLocaleTimeString("ja-JP", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </li>
                );
              })
            ) : (
              <p>取得中...</p>
            )}
          </ul>
        </div>

        <div className="col-span-4 mt-4">
          <h2 className="text-2xl font-semibold mb-4">
            連勝率ランキング TOP {winRateRanking.length}
          </h2>
          <ul className="list-disc">
            {winRateRanking.length > 0 ? (
              winRateRanking.map((item, index) => {
                const date = new Date(item.date);

                return (
                  <li key={index} className="mb-2 text-xs list-none">
                    {index + 1}位 {item.username} - 連勝率: {item.win_rate}% (
                    {item.streak}連勝)
                    <br />
                    {date.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {date.toLocaleTimeString("ja-JP", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </li>
                );
              })
            ) : (
              <p>取得中...</p>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
