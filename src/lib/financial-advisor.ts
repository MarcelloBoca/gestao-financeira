export type FinancialAdvice = {
  summary: string;
  alerts: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  criticalCategories: string[];
  criticalItems: string[];
};

type MonthlyLine = {
  categoryNameSnapshot: string;
  itemNameSnapshot: string;
  totalPrice: number;
  priceDifferencePercent?: number | null;
  status: string;
};

export function financialAdvisorService(lines: MonthlyLine[]): FinancialAdvice {
  const confirmedLines = lines.filter((line) => line.status === 'confirmed');
  const total = confirmedLines.reduce((sum, line) => sum + line.totalPrice, 0);
  const categoryTotals = confirmedLines.reduce<Record<string, number>>((acc, line) => {
    acc[line.categoryNameSnapshot] = (acc[line.categoryNameSnapshot] || 0) + line.totalPrice;
    return acc;
  }, {});

  const criticalCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const criticalItems = confirmedLines
    .sort((a, b) => b.totalPrice - a.totalPrice)
    .slice(0, 3)
    .map((line) => line.itemNameSnapshot);

  const alerts: string[] = [];
  const recommendations: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  if (total > 0) {
    alerts.push(`O total mensal de despesas atingiu ${total.toFixed(2)} MT.`);
  }

  Object.entries(categoryTotals).forEach(([name, value]) => {
    const share = total > 0 ? (value / total) * 100 : 0;
    if (share >= 30) {
      recommendations.push(`A categoria ${name} representa ${share.toFixed(0)}% do orçamento. Revê os gastos mais pesados antes de cortar em áreas menores.`);
      criticalCategories.push(name);
    }
  });

  confirmedLines.forEach((line) => {
    if ((line.priceDifferencePercent ?? 0) >= 20) {
      alerts.push(`O item ${line.itemNameSnapshot} subiu ${line.priceDifferencePercent?.toFixed(0)}% em relação ao mês anterior.`);
      recommendations.push(`Analisa ${line.itemNameSnapshot} com atenção, pois o aumento de preço pode ser um ponto de corte.`);
      criticalItems.push(line.itemNameSnapshot);
    }
    if ((line.priceDifferencePercent ?? 0) <= -10) {
      opportunities.push(`O item ${line.itemNameSnapshot} reduziu o preço. Pode ser uma oportunidade para aumentar a compra se for recorrente.`);
    }
  });

  if (criticalCategories.length > 0) {
    risks.push('Há categorias de alto impacto que merecem revisão imediata.');
  }

  if (criticalItems.length > 0) {
    risks.push('Existem itens com variação de preço acima do padrão.');
  }

  if (opportunities.length === 0) {
    opportunities.push('Revisa os itens recorrentes e identifica possibilidades de substituição por alternativas mais económicas.');
  }

  return {
    summary: 'O painel mostra os principais pontos de pressão do orçamento mensal e onde vale concentrar cortes.',
    alerts,
    recommendations,
    risks,
    opportunities,
    criticalCategories: [...new Set(criticalCategories)],
    criticalItems: [...new Set(criticalItems)],
  };
}
