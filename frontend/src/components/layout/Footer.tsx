import Link from "next/link";
import { Home, Search, Bell } from "lucide-react";

const items = [
  { label: "Canvas", href: "/", icon: Home },
  { label: "Exploration", href: "/search", icon: Search },
  { label: "Inbox", href: "/notifications", icon: Bell },
];

export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t bg-background shadow-md">
      <nav aria-label="Footer navigation">
        <ul className="mx-auto flex h-14 max-w-md list-none items-stretch justify-around">
          {items.map(({ label, href, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex h-full flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}