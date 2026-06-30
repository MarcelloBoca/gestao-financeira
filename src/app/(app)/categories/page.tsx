import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "@/lib/actions";
import Link from "next/link";

async function getCategories() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Categorias</h2>
        <p className="mt-2 text-sm text-slate-600">Organize as despesas por família e ative ou desative categorias conforme necessário.</p>
        <form action={createCategory} className="mt-4 grid gap-3 md:grid-cols-3">
          <input name="name" placeholder="Nome" className="rounded-xl border border-slate-300 px-3 py-2" required />
          <input name="description" placeholder="Descrição" className="rounded-xl border border-slate-300 px-3 py-2" />
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
            <input name="active" type="checkbox" defaultChecked />
            Ativa
          </label>
          <button className="md:col-span-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Criar categoria</button>
        </form>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                <p className="text-sm text-slate-500">{category.description || "Sem descrição"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/items?category=${category.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Ver itens</Link>
                <form action={deleteCategory.bind(null, category.id)}>
                  <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600">Remover</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
