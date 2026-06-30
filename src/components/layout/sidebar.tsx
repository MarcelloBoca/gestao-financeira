import Link from "next/link";
import { LayoutDashboard, ListChecks, ShoppingBasket, CalendarDays, BarChart3, Sparkles, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categories", label: "Categorias", icon: ListChecks },
  { href: "/items", label: "Itens", icon: ShoppingBasket },
  { href: "/monthly-expenses", label: "Meses", icon: CalendarDays },
  { href: "/compare", label: "Comparar", icon: BarChart3 },
  { href: "/advisor", label: "Agente", icon: Sparkles },
  { href: "/settings", label: "Definições", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-slate-950 p-4 text-slate-100">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-[0.02em] text-slate-100">Gestão Financeira Familiar</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-slate-800">
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
