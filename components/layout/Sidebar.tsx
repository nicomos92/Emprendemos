import Link from "next/link";
import { NAV_LINKS } from "@/components/layout/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-neutral-100 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-semibold text-neutral-700">EmprendeMos</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
