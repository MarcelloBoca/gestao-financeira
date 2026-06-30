import { formatCurrency } from "./finance-utils";

interface ExpensePdfPayload {
  month: number;
  year: number;
  title: string;
  responsible?: string | null;
  budget?: number | null;
  summaryLines?: string[];
  categoryLines?: string[];
  itemLines: string[];
}

function toWinAnsiHex(value: string) {
  const map: Record<string, number> = {
    "á": 225,
    "à": 224,
    "â": 226,
    "ã": 227,
    "ç": 231,
    "é": 233,
    "ê": 234,
    "í": 237,
    "ó": 243,
    "ô": 244,
    "õ": 245,
    "ú": 250,
    "Á": 193,
    "À": 192,
    "Â": 194,
    "Ã": 195,
    "Ç": 199,
    "É": 201,
    "Ê": 202,
    "Í": 205,
    "Ó": 211,
    "Ô": 212,
    "Õ": 213,
    "Ú": 218,
    "º": 186,
    "ª": 170,
    "°": 176,
    "£": 163,
    "«": 171,
    "»": 187,
    "—": 8212,
  };

  const bytes = Array.from(value).map((char) => {
    const mapped = map[char];
    if (mapped !== undefined) return mapped;
    return char.charCodeAt(0);
  });

  return Buffer.from(bytes).toString("hex").toUpperCase();
}

function appendText(content: string[], text: string, x: number, y: number, size = 10) {
  const hex = toWinAnsiHex(text);
  content.push(`BT /F1 ${size} Tf ${x} ${y} Td <${hex}> Tj ET`);
}

function appendBox(content: string[], x: number, y: number, width: number, height: number, fill = false) {
  content.push(`${x} ${y} ${width} ${height} re ${fill ? "f" : "S"}`);
}

function drawLine(content: string[], x1: number, y1: number, x2: number, y2: number) {
  content.push(`${x1} ${y1} m ${x2} ${y2} l S`);
}

function formatCurrencyValue(value: number) {
  return formatCurrency(value);
}

export function buildExpensePdfBuffer({ month, year, title, responsible, budget, summaryLines = [], categoryLines = [], itemLines }: ExpensePdfPayload) {
  const generatedAt = new Date().toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  const totalEstimatedLine = summaryLines.find((entry) => entry.startsWith("Total estimado:"));
  const totalEstimatedText = totalEstimatedLine ? totalEstimatedLine.replace("Total estimado:", "").trim() : "0,00 MT";
  const totalValue = Number(totalEstimatedText.replace(/[.\s\u00a0]/g, "").replace(",", ".")) || 0;
  const balance = budget != null ? budget - totalValue : null;
  const content: string[] = [];

  content.push("0.2 0.4 0.3 rg");
  drawLine(content, 30, 792, 780, 792);
  appendText(content, "GESTÃO FINANCEIRA", 45, 770, 17);
  appendText(content, "Relatório mensal organizado por categorias, com quantidades, preços, subtotais e controlo de confirmação.", 45, 748, 10);
  appendText(content, title.toUpperCase(), 220, 715, 16);

  content.push("0.85 0.95 0.90 rg");
  appendBox(content, 40, 665, 720, 35, true);
  content.push("0 0 0 rg");
  appendText(content, "MÊS", 55, 688, 9);
  appendText(content, "RESPONSÁVEL", 195, 688, 9);
  appendText(content, "ORÇAMENTO PREVISTO", 355, 688, 9);
  appendText(content, "TOTAL ESTIMADO", 525, 688, 9);
  appendText(content, "SALDO PREVISTO", 665, 688, 9);
  appendText(content, `${month}/${year}`, 55, 672, 10);
  appendText(content, responsible || "_______________", 195, 672, 10);
  appendText(content, budget != null ? formatCurrencyValue(budget) : "Não definido", 355, 672, 10);
  appendText(content, totalEstimatedText, 525, 672, 10);
  appendText(content, balance != null ? formatCurrencyValue(balance) : "Não definido", 665, 672, 10);

  content.push("0.85 0.95 0.90 rg");
  appendBox(content, 40, 620, 720, 20, true);
  content.push("0 0 0 rg");
  appendText(content, "Nº", 50, 626, 9);
  appendText(content, "ITEM / PRODUTO", 90, 626, 9);
  appendText(content, "UNIDADE", 270, 626, 9);
  appendText(content, "QTD.", 360, 626, 9);
  appendText(content, "PREÇO UNIT.", 430, 626, 9);
  appendText(content, "TOTAL", 520, 626, 9);
  appendText(content, "ESTADO", 590, 626, 9);
  appendText(content, "OK", 700, 626, 9);

  let currentY = 600;
  let rowIndex = 1;
  const rows = itemLines.map((line) => {
    const parts = line.split(" | ");
    return {
      category: parts[0] || "GERAL",
      item: parts[1] || "",
      unit: parts[2] || "",
      quantity: parts[3] || "",
      unitPrice: parts[4] || "",
      total: parts[5] || "",
      status: parts[6] || "",
      ok: parts[7] || "[ ]",
    };
  });

  const groups = new Map<string, typeof rows>();
  rows.forEach((row) => {
    const existing = groups.get(row.category) || [];
    existing.push(row);
    groups.set(row.category, existing);
  });

  groups.forEach((groupRows, categoryName) => {
    if (currentY < 90) {
      currentY = 600;
    }
    content.push("0.2 0.4 0.3 rg");
    appendText(content, categoryName.toUpperCase(), 45, currentY, 9);
    const subtotal = groupRows.reduce((sum, row) => sum + Number((row.total || "0").replace(/[.\s\u00a0]/g, "").replace(",", ".")), 0);
    appendText(content, `Subtotal: ${formatCurrencyValue(subtotal)}`, 500, currentY, 9);
    content.push("0 0 0 rg");
    currentY -= 16;

    groupRows.forEach((row) => {
      if (currentY < 90) {
        currentY = 600;
      }
      appendText(content, `${rowIndex}`, 50, currentY, 8);
      appendText(content, row.item, 90, currentY, 8);
      appendText(content, row.unit, 270, currentY, 8);
      appendText(content, row.quantity, 360, currentY, 8);
      appendText(content, row.unitPrice, 430, currentY, 8);
      appendText(content, row.total, 520, currentY, 8);
      appendText(content, row.status, 590, currentY, 8);
      appendText(content, row.ok, 700, currentY, 8);
      currentY -= 12;
      rowIndex += 1;
    });
  });

  content.push("0.55 0.55 0.55 rg");
  drawLine(content, 40, 70, 760, 70);
  appendText(content, "Relatório gerado automaticamente pela aplicação de Gestão Financeira", 45, 48, 8);
  appendText(content, `Gerado em: ${generatedAt}`, 520, 48, 8);

  const contentStream = content.join("\n");
  const stream = Buffer.from(contentStream, "utf8");
  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    `<< /Length 6 0 R >>\nstream\n${contentStream}\nendstream`,
    `${stream.length}`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  const xref = [`xref\n0 ${objects.length + 1}\n`, `0000000000 65535 f \n`];

  for (const offset of offsets) {
    xref.push(`${offset.toString().padStart(10, "0")} 00000 n \n`);
  }

  pdf += `${xref.join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

export function formatPdfCurrency(value: number) {
  return formatCurrency(value);
}
