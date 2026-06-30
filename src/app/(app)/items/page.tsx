import { prisma } from "@/lib/prisma";
import { createItem, deleteItem } from "@/lib/actions";

async function getItems(categoryId?: string) {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.expenseItem.findMany({
    where: { userId: user.id, ...(categoryId ? { categoryId } : {}) },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const items = await getItems(params.category);
  const categories = await prisma.category.findMany({ where: { active: true } });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Itens e produtos</h2>
        <form action={createItem} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input name="name" placeholder="Nome do item" className="rounded-xl border border-slate-300 px-3 py-2" required />
          <select name="categoryId" className="rounded-xl border border-slate-300 px-3 py-2" defaultValue={params.category || ""}>
            <option value="">Escolha uma categoria</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <input name="unit" placeholder="Unidade" className="rounded-xl border border-slate-300 px-3 py-2" />
          <input name="defaultQuantity" type="number" step="0.01" defaultValue="1" className="rounded-xl border border-slate-300 px-3 py-2" />
          <input name="defaultPrice" type="number" step="0.01" defaultValue="0" className="rounded-xl border border-slate-300 px-3 py-2" />
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
            <input name="recurring" type="checkbox" />
            Recorrente
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
            <input name="active" type="checkbox" defaultChecked />
            Ativo
          </label>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Criar item</button>
        </form>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.category.name} · {item.unit || "Unidade livre"}</p>
                <p className="text-sm text-slate-500">Preço padrão: {item.defaultPrice.toFixed(2)} MT · Quantidade: {item.defaultQuantity}</p>
              </div>
              <form action={deleteItem.bind(null, item.id)}>
                <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600">Remover</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
