"use client";

interface SidebarLinkProps {
  href: string;
  text: string;
}

export function SidebarLink({ href, text }: SidebarLinkProps) {
  return (
    <li className="my-4">
      <a href={href} className="text-gray-800 no-underline">
        {text}
      </a>
    </li>
  );
}
