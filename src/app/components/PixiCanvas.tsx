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

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  const handleStart = () => {
    const app = appRef.current;
    if (!app) return;

    const circle = new PIXI.Graphics();
    circle.beginFill(0x000000);
    circle.drawCircle(0, 0, 10);
    circle.endFill();

    circle.x = app.screen.width / 2;
    circle.y = app.screen.height / 2;

    app.stage.addChild(circle);
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
