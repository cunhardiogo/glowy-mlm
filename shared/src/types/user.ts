export type UserTipo = 'EI' | 'CLIENTE_PREFERENCIAL' | 'ADMIN';
export type KitTipo = 'STANDARD' | 'PREMIUM';
export type GraduacaoNome =
  | 'NENHUMA'
  | 'BRONZE'
  | 'PRATA'
  | 'OURO'
  | 'SAFIRA'
  | 'ESMERALDA'
  | 'DIAMANTE'
  | 'DUPLO_DIAMANTE'
  | 'TRIPLO_DIAMANTE'
  | 'IMPERIAL'
  | 'EMBAIXADOR'
  | 'EMBAIXADOR_GLOBAL';

export interface User {
  id: string;
  auth_id: string | null;
  tipo: UserTipo;
  username: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  patrocinador_id: string | null;
  path: string;
  profundidade: number;
  kit_atual: KitTipo | null;
  graduacao_reconhecimento: GraduacaoNome;
  graduacao_ciclo_atual: GraduacaoNome;
  ativo_ciclo_atual: boolean;
  status_ativo: boolean;
  pix_chave: string | null;
  pix_tipo: string | null;
  contrato_aceito_em: string | null;
  contrato_ip: string | null;
  contrato_user_agent: string | null;
  contrato_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPublico {
  id: string;
  username: string;
  nome: string;
  graduacao_reconhecimento: GraduacaoNome;
  kit_atual: KitTipo | null;
}
