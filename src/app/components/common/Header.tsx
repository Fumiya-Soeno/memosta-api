"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-gray-800 text-white text-lg">
      <Link href="/" className="text-white no-underline">
        Character's War
      </Link>
      <nav className="flex space-x-4">
        <a href="#" className="text-white no-underline hover:underline">
          Home
        </a>
        <a href="#" className="text-white no-underline hover:underline">
          Logout
        </a>
      </nav>
    </header>
  );
}
