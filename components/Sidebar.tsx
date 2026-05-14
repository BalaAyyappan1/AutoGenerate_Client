"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Layers3 } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/lessons",
    label: "Lessons",
    icon: BookOpen,
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: Layers3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
        <div className="flex flex-col">
          <span className="text-xl font-semibold tracking-tight text-black dark:text-white">
            Asure
          </span>

          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            AI Generation
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
                }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}