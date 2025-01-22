"use client";

import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  text: string;
}

export function SidebarLink({ href, text }: SidebarLinkProps) {
  // 外部リンクかどうかを自動判別
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <li className="my-4">
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 no-underline hover:underline"
        >
          {text}
        </a>
      ) : (
        <Link
          href={href}
          className="text-gray-800 no-underline hover:underline"
        >
          {text}
        </Link>
      )}
    </li>
  );
}
