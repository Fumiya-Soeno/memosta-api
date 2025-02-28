"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { SidebarLink } from "./SidebarLink";
// ハンバーガーアイコン用に react-icons を利用（パッケージ未導入の場合はインストールしてください）
import { HiOutlineMenu } from "react-icons/hi";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    // relative を指定して、絶対配置のメニューを親要素内に収めます
    <header className="relative flex justify-between items-center px-8 py-4 bg-gray-800 text-white text-lg">
      <Link href="/" className="text-white no-underline">
        Character&apos;s War
      </Link>
      <nav className="flex items-center space-x-4">
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
      </nav>

      {/* スマホ用ハンバーガーメニュー */}
      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-gray-100 shadow-md z-50">
          <nav>
            <ul className="list-none p-4">
              <SidebarLink href="/unit/new" text="ユニット登録" />
              <SidebarLink href="/unit/show" text="ユニット管理" />
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
