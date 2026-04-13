export function centavosParaBRL(c: number): string {
  const v = (c / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R$ ${v}`;
}

export function brlParaCentavos(v: string): number {
  if (!v) return 0;
  const limpo = v
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(limpo);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}
