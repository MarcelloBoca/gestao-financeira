export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} MT`;
}

export function buildMonthLabel(month: number, year: number) {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${months[month - 1]} ${year}`;
}

export function calculateLineMetrics(quantity: number, unitPrice: number, previousUnitPrice?: number | null) {
  const totalPrice = quantity * unitPrice;
  let priceDifference = 0;
  let priceDifferencePercent = 0;

  if (previousUnitPrice && previousUnitPrice > 0) {
    priceDifference = unitPrice - previousUnitPrice;
    priceDifferencePercent = ((unitPrice - previousUnitPrice) / previousUnitPrice) * 100;
  }

  return { totalPrice, priceDifference, priceDifferencePercent };
}
