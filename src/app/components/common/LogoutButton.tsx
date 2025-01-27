"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        // ローカルストレージからトークン削除
        localStorage.removeItem("accessToken");

        // ログイン状態を false に設定
        setIsLoggedIn(false);

        // ログイン画面にリダイレクト
        router.push("/login");
      } else {
        console.error("ログアウトに失敗しました");
      }
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  if (!isLoggedIn) {
    return null; // 非ログイン時は何も表示しない
  }

  return (
    <button
      onClick={handleLogout}
      className="text-white no-underline hover:underline"
    >
      Logout
    </button>
  );
}
