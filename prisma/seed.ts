import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { name: 'Utilizador', email: 'user@example.com' },
  });

  const categories = [
    { name: 'Alimentação', description: 'Compras de casa e alimentos', active: true },
    { name: 'Transporte', description: 'Combustível, chapa e transporte', active: true },
    { name: 'Casa', description: 'Energia, água e internet', active: true },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: `${user.id}-${category.name}` },
      update: {},
      create: { id: `${user.id}-${category.name}`, userId: user.id, ...category },
    });
  }

  const foodCategory = await prisma.category.findFirst({ where: { userId: user.id, name: 'Alimentação' } });
  const transportCategory = await prisma.category.findFirst({ where: { userId: user.id, name: 'Transporte' } });
  const homeCategory = await prisma.category.findFirst({ where: { userId: user.id, name: 'Casa' } });

  const items = [
    { categoryId: foodCategory?.id, name: 'Arroz', unit: 'kg', defaultQuantity: 1, defaultPrice: 1500, recurring: true },
    { categoryId: foodCategory?.id, name: 'Óleo', unit: 'L', defaultQuantity: 1, defaultPrice: 650, recurring: true },
    { categoryId: foodCategory?.id, name: 'Frango', unit: 'un', defaultQuantity: 1, defaultPrice: 350, recurring: true },
    { categoryId: foodCategory?.id, name: 'Açúcar', unit: 'kg', defaultQuantity: 1, defaultPrice: 500, recurring: true },
    { categoryId: transportCategory?.id, name: 'Chapa', unit: 'viagens', defaultQuantity: 20, defaultPrice: 25, recurring: true },
    { categoryId: transportCategory?.id, name: 'Táxi', unit: 'viagens', defaultQuantity: 4, defaultPrice: 150, recurring: true },
    { categoryId: homeCategory?.id, name: 'Energia', unit: 'un', defaultQuantity: 1, defaultPrice: 1000, recurring: true },
    { categoryId: homeCategory?.id, name: 'Água', unit: 'un', defaultQuantity: 1, defaultPrice: 500, recurring: true },
    { categoryId: homeCategory?.id, name: 'Internet', unit: 'un', defaultQuantity: 1, defaultPrice: 2500, recurring: true },
  ];

  for (const item of items) {
    if (!item.categoryId) continue;
    await prisma.expenseItem.create({ data: { userId: user.id, categoryId: item.categoryId, name: item.name, unit: item.unit, defaultQuantity: item.defaultQuantity, defaultPrice: item.defaultPrice, recurring: item.recurring, active: true } });
  }
}

main().finally(() => prisma.$disconnect());
