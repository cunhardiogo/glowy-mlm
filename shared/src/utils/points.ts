import { RECOMPRA_PB_DIVISOR } from '../constants/bonusTables.js';

// Pontos de Graduação: 1 PG por R$1 (1 PG por 100 centavos)
export function calcularPG(valorCentavos: number): number {
  return Math.floor(valorCentavos / 100);
}

// Pontos Bonificáveis: 1 PB por R$3 (somente recompras)
export function calcularPB(valorCentavos: number): number {
  return Math.floor(valorCentavos / (RECOMPRA_PB_DIVISOR * 100));
}

// Valor em centavos de PB (1 PB = R$3 = 300 centavos) — base para bônus de produtividade
export function pbParaCentavos(pb: number): number {
  return pb * RECOMPRA_PB_DIVISOR * 100;
}

// Formatar mês de ciclo
export function cicloRefAtual(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function cicloRefDe(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function mesesEntre(inicio: Date, fim: Date): number {
  return (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
}
