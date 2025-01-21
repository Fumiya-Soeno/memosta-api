"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";

export default function Home() {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 400,
      height: 600,
      backgroundColor: 0xffffff,
    });

    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    return () => {
      app.destroy(true, true);
    };
  }, []);

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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <Sidebar />
          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <div ref={pixiContainerRef} />
            <button onClick={handleStart}>Start</button>
          </main>
        </div>
      </div>
    </div>
  );
}
