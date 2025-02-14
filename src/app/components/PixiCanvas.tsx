"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

export function PixiCanvas({
  width = 400,
  height = 600,
  backgroundColor = 0xffffff,
}: PixiCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const textRef = useRef<PIXI.Text | null>(null);
  const animationStartedRef = useRef(false);

  useEffect(() => {
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor,
    });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // コンポーネントのマウント時に「あ」を作成してステージに追加（Start前から表示）
    const text = new PIXI.Text("あ", {
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });
    text.anchor.set(0.5);
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    app.stage.addChild(text);
    textRef.current = text;

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  const handleStart = () => {
    const andleFix = 30;

    const app = appRef.current;
    const text = textRef.current;
    if (!app || !text) return;
    if (animationStartedRef.current) return; // 複数回tickerが追加されるのを防止
    animationStartedRef.current = true;

    // 左前方30°方向の速度（1フレームにつき4px移動の場合）
    const angle = ((30 + andleFix) * Math.PI) / 180; // 30°をラジアンに変換
    const vx = -4 * Math.sin(angle); // 約 -2px
    const vy = -4 * Math.cos(angle); // 約 -3.464px

    app.ticker.add(() => {
      // 現在の位置に速度を加算
      text.x += vx;
      text.y += vy;

      // 画面端に到達したら反対側から再出現する処理（ラッピング）
      if (text.x < 0) {
        text.x = app.screen.width;
      } else if (text.x > app.screen.width) {
        text.x = 0;
      }
      if (text.y < 0) {
        text.y = app.screen.height;
      } else if (text.y > app.screen.height) {
        text.y = 0;
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={pixiContainerRef} className="mb-4" />
      <button
        onClick={handleStart}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start
      </button>
    </div>
  );
}
