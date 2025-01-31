"use client";

import { useState, useEffect } from "react";
import { SidebarLink } from "./SidebarLink";

export function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理

  // ログイン状態の確認
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Cookie を送信するために必要
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.loggedIn); // loggedIn が true の場合ログイン中と判定
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("ログイン状態の確認中にエラーが発生しました", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (!isLoggedIn) {
    return null; // 非ログイン時は何も表示しない
  }

  return (
    <aside className="w-52 bg-gray-100 h-full p-4 shadow-md">
      <nav>
        <ul className="list-none p-0">
          <SidebarLink href="/unit" text="ユニット登録" />
          <SidebarLink href="#" text="ユニット管理" />
        </ul>
      </nav>
    </aside>
  );
}
