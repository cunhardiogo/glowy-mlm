import type { GraduacaoNome } from '../types/user.js';
import type { BonusTipo } from '../types/bonus.js';

// Percentuais por nível — exatamente como no Manual
export const PERCENT_PRIMEIRO_PEDIDO: Record<number, number> = {
  1: 20, 2: 12, 3: 7, 4: 5, 5: 3, 6: 2, 7: 1,
};

// Upgrade usa os mesmos percentuais que Primeiro Pedido
export const PERCENT_UPGRADE: Record<number, number> = { ...PERCENT_PRIMEIRO_PEDIDO };

export const PERCENT_PRODUTIVIDADE_STANDARD: Record<number, number> = {
  1: 5, 2: 6, 3: 7, 4: 8, 5: 7,
};

export const PERCENT_PRODUTIVIDADE_PREMIUM: Record<number, number> = {
  1: 5, 2: 6, 3: 7, 4: 8, 5: 7, 6: 6, 7: 5, 8: 3, 9: 2, 10: 1,
};

export function percentProdutividade(kit: 'STANDARD' | 'PREMIUM'): Record<number, number> {
  return kit === 'PREMIUM' ? PERCENT_PRODUTIVIDADE_PREMIUM : PERCENT_PRODUTIVIDADE_STANDARD;
}

// Profundidade máxima por Status
export const NIVEL_MAX_PRIMEIRO_PEDIDO = { STANDARD: 3, PREMIUM: 7 } as const;
export const NIVEL_MAX_PRODUTIVIDADE = { STANDARD: 5, PREMIUM: 10 } as const;

// APM mínimo por graduação
export const APM_POR_GRADUACAO: Record<GraduacaoNome, number> = {
  NENHUMA: 0,
  BRONZE: 50,
  PRATA: 50,
  OURO: 100,
  SAFIRA: 100,
  ESMERALDA: 100,
  DIAMANTE: 150,
  DUPLO_DIAMANTE: 150,
  TRIPLO_DIAMANTE: 150,
  IMPERIAL: 200,
  EMBAIXADOR: 200,
  EMBAIXADOR_GLOBAL: 200,
};

// Percentual de equiparação por graduação
export const EQUIPARACAO_PCT: Record<GraduacaoNome, number> = {
  NENHUMA: 0,
  BRONZE: 3,
  PRATA: 6,
  OURO: 10,
  SAFIRA: 15,
  ESMERALDA: 15,
  DIAMANTE: 15,
  DUPLO_DIAMANTE: 15,
  TRIPLO_DIAMANTE: 15,
  IMPERIAL: 15,
  EMBAIXADOR: 15,
  EMBAIXADOR_GLOBAL: 15,
};

// Kits e valores
export const KIT_VALOR_CENTAVOS = { STANDARD: 36000, PREMIUM: 72000 } as const;
export const KIT_UPGRADE_MIN_CENTAVOS = 36000;
export const RECOMPRA_DESCONTO_PCT = 40;
export const PRIMEIRO_PEDIDO_DESCONTO_PCT = 10;
export const RECOMPRA_PB_DIVISOR = 3; // R$3 = 1 PB

// Tetos globais de distribuição
export const TETO_GLOBAL_BONUS = {
  PRIMEIRO_PEDIDO: 0.5,
  UPGRADE: 0.5,
  PRODUTIVIDADE: 0.5,
  EQUIPARACAO: 0.15,
} as const;

// Prazo em meses para PREMIUM atingir PRATA para habilitar níveis extras
export const PREMIUM_PRAZO_PRATA_MESES = 3;

export function percentuaisPorTipo(tipo: BonusTipo, kit: 'STANDARD' | 'PREMIUM'): Record<number, number> {
  switch (tipo) {
    case 'PRIMEIRO_PEDIDO': return PERCENT_PRIMEIRO_PEDIDO;
    case 'UPGRADE': return PERCENT_UPGRADE;
    case 'PRODUTIVIDADE': return percentProdutividade(kit);
    default: return {};
  }
}
