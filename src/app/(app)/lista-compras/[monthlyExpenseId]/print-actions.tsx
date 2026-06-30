"use client";

import Link from "next/link";

export function PrintActions({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mb-4 flex flex-wrap gap-2">
      <Link href={backHref} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
        Voltar
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Imprimir / Guardar como PDF
      </button>
    </div>
  );
}
