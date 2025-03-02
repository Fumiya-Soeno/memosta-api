"use client";

import { useState, useEffect } from "react";
import { SidebarLink } from "./SidebarLink";

export function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.loggedIn);
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
    return null;
  }

  return (
    <aside className="hidden md:block w-52 bg-gray-100 h-full p-4 shadow-md">
      <nav>
        <ul className="list-none p-0">
          <SidebarLink href="/unit/new" text="ユニット登録" />
          <SidebarLink href="/unit/show" text="ユニット管理" />
          <SidebarLink href="/unit/search" text="ユニット検索" />
        </ul>
      </nav>
    </aside>
  );
}
