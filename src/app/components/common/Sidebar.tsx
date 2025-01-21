"use client";

import { SidebarLink } from "./SidebarLink";

export function Sidebar() {
  return (
    <aside className="w-52 bg-gray-100 h-full p-4 shadow-md">
      <nav>
        <ul className="list-none p-0">
          <SidebarLink href="/login" text="ログイン" />
          <SidebarLink href="#" text="新規登録" />
          <SidebarLink href="#" text="ユニット登録" />
          <SidebarLink href="#" text="ユニット管理" />
          <SidebarLink href="#" text="ログアウト" />
        </ul>
      </nav>
    </aside>
  );
}
