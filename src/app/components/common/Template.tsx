"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface TemplateProps {
  children: React.ReactNode; // 動的に挿入されるコンテンツ
}

export function Template({ children }: TemplateProps) {
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
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
