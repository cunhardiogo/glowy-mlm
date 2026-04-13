CREATE TABLE IF NOT EXISTS bonus_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_ref DATE NOT NULL REFERENCES ciclos(ref_mes) ON DELETE RESTRICT,
  beneficiario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  origem_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  tipo bonus_tipo NOT NULL,
  nivel INT,
  percentual NUMERIC(6,3) NOT NULL,
  base_centavos BIGINT NOT NULL,
  valor_centavos BIGINT NOT NULL,
  status lancamento_status NOT NULL DEFAULT 'PROVISIONADO',
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bonus_idempotencia
  ON bonus_lancamentos (ciclo_ref, tipo, beneficiario_id, origem_user_id, nivel, pedido_id)
  WHERE pedido_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bonus_ciclo_benef ON bonus_lancamentos(ciclo_ref, beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_bonus_tipo ON bonus_lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_bonus_status ON bonus_lancamentos(status);
