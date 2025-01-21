"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function Home() {
  // Pixiアプリを保持するための参照
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    // Pixiアプリケーションを作成
    const app = new PIXI.Application({
      width: 400,
      height: 600,
      backgroundColor: 0xffffff, // 白背景
    });

    // 生成したcanvasをDOMに追加
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // コンポーネントがアンマウントされたらアプリを破棄
    return () => {
      app.destroy(true, true);
    };
  }, []);

  // スタートボタンを押したときの処理
  const handleStart = () => {
    const app = appRef.current;
    if (!app) return;

    // 黒い円を描画
    const circle = new PIXI.Graphics();
    circle.beginFill(0x000000);
    circle.drawCircle(0, 0, 10);
    circle.endFill();

    // 画面中央に配置
    circle.x = app.screen.width / 2;
    circle.y = app.screen.height / 2;

    // ステージに追加
    app.stage.addChild(circle);
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "16px",
      }}
    >
      {/* PixiJSの描画先 */}
      <div ref={pixiContainerRef} />
      {/* スタートボタン */}
      <button onClick={handleStart}>Start</button>
    </main>
  );
}
