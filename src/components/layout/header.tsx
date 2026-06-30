import { CalendarDays } from "lucide-react";

export function Header({ selectedMonth }: { selectedMonth: string }) {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Mês atual</p>
        <h1 className="text-xl font-semibold text-slate-900">{selectedMonth}</h1>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        <CalendarDays className="h-4 w-4" />
        Gestão mensal ativa
      </div>
    </header>
  );
}
