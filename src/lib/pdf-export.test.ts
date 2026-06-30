import { describe, expect, it } from "vitest";
import { buildExpensePdfBuffer } from "./pdf-export";

describe("buildExpensePdfBuffer", () => {
  it("creates a PDF buffer with the expected professional shopping-list report", () => {
    const buffer = buildExpensePdfBuffer({
      month: 6,
      year: 2026,
      title: "LISTA DE COMPRAS MENSAL",
      responsible: "Maria",
      budget: null,
      summaryLines: ["Total estimado: 1.500,00 MT"],
      categoryLines: ["ALIMENTAÇÃO: 1.500,00 MT"],
      itemLines: ["ALIMENTAÇÃO | Arroz | unid. | 1 | 1.500,00 MT | 1.500,00 MT | Confirmar | [ ]"],
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.toString("latin1")).toContain("%PDF");
    expect(buffer.toString("latin1")).toContain("LISTA DE COMPRAS MENSAL");
    expect(buffer.toString("latin1")).toContain("MÊS");
    expect(buffer.toString("latin1")).toContain("RESPONSÁVEL");
    expect(buffer.toString("latin1")).toContain("ALIMENTAÇÃO");
    expect(buffer.toString("latin1")).toContain("1.500,00 MT");
  });
});
