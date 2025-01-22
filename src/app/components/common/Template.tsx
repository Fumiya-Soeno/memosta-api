"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface TemplateProps {
  children: React.ReactNode; // 動的に挿入されるコンテンツ
}

export function Template({ children }: TemplateProps) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Sidebar />
          <main className="flex flex-1 flex-col items-center justify-center gap-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
