"use client";

import { useState, useEffect } from "react";
import { LogoutButton } from "./LogoutButton";
import { SidebarLink } from "./SidebarLink";
// ハンバーガーアイコン用に react-icons を利用（パッケージ未導入の場合はインストールしてください）
import { HiOutlineMenu } from "react-icons/hi";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ログイン状態を確認
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

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    // relative を指定して、絶対配置のメニューを親要素内に収めます
    <header className="relative flex justify-between items-center px-8 py-4 bg-gray-800 text-white text-lg">
      <a href="/" className="text-white no-underline">
        Character&apos;s War
        <span className="ml-2 text-xs text-gray-500">v2.2.02</span>
      </a>
      <nav className="flex items-center space-x-4">
        {isLoggedIn && (
          <>
            {/* デスクトップ：Logout ボタンを表示 */}
            <div className="hidden md:block">
              <LogoutButton />
            </div>
            {/* スマホ：ハンバーガーメニューアイコン */}
            <button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="メニュー"
            >
              <HiOutlineMenu size={24} />
            </button>
          </>
        )}
      </nav>

      {/* スマホ用ハンバーガーメニュー */}
      {menuOpen && isLoggedIn && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-gray-100 shadow-md z-50">
          <nav>
            <ul className="list-none p-4">
              <SidebarLink href="/unit/new" text="ユニット登録" />
              <SidebarLink href="/unit/show" text="ユニット管理" />
              <SidebarLink href="/character/search" text="キャラクター検索" />
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
