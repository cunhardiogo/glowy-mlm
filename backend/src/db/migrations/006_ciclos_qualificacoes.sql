CREATE TABLE IF NOT EXISTS ciclos (
  ref_mes DATE PRIMARY KEY,
  status ciclo_status NOT NULL DEFAULT 'ABERTO',
  aberto_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  fechado_em TIMESTAMPTZ,
  total_bonus_centavos BIGINT NOT NULL DEFAULT 0,
  log JSONB
);

CREATE TABLE IF NOT EXISTS qualificacoes (
  ciclo_ref DATE NOT NULL REFERENCES ciclos(ref_mes) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL,
  apm_requerido INT NOT NULL,
  pb_pessoal INT NOT NULL DEFAULT 0,
  pb_grupo_total BIGINT NOT NULL DEFAULT 0,
  pb_grupo_qualificado BIGINT NOT NULL DEFAULT 0,
  maior_linha_pb BIGINT NOT NULL DEFAULT 0,
  graduacao graduacao NOT NULL DEFAULT 'NENHUMA',
  vml_percentual NUMERIC(5,2),
  detalhes JSONB,
  PRIMARY KEY (ciclo_ref, user_id)
);

CREATE INDEX IF NOT EXISTS idx_qualificacoes_ciclo_grad ON qualificacoes(ciclo_ref, graduacao);
CREATE INDEX IF NOT EXISTS idx_qualificacoes_user ON qualificacoes(user_id);
