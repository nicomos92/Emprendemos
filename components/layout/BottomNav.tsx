import Link from "next/link";
import { NAV_LINKS } from "@/components/layout/nav-links";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-stretch justify-between">
        {NAV_LINKS.map((link) => (
          <li key={link.href} className="flex-1">
            <Link
              href={link.href}
              className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-neutral-600"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
