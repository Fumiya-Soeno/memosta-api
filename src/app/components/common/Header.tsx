"use client";

import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-gray-800 text-white text-lg">
      <Link href="/" className="text-white no-underline">
        Character&apos;s War
      </Link>
      <nav className="flex space-x-4">
        <LogoutButton />
      </nav>
    </header>
  );
}
