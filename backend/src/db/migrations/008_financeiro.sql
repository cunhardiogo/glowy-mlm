CREATE TABLE IF NOT EXISTS carteira (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  saldo_liberado_centavos BIGINT NOT NULL DEFAULT 0,
  saldo_provisionado_centavos BIGINT NOT NULL DEFAULT 0,
  total_recebido_centavos BIGINT NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS remessas_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_ref DATE,
  arquivo_url TEXT,
  total_centavos BIGINT,
  qtd_saques INT,
  gerado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  aprovado_por UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS saques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  valor_centavos BIGINT NOT NULL CHECK (valor_centavos > 0),
  taxa_centavos BIGINT NOT NULL DEFAULT 0,
  valor_liquido_centavos BIGINT GENERATED ALWAYS AS (valor_centavos - taxa_centavos) STORED,
  status saque_status NOT NULL DEFAULT 'SOLICITADO',
  pix_chave TEXT,
  pix_tipo VARCHAR(10),
  solicitado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  processado_em TIMESTAMPTZ,
  remessa_id UUID REFERENCES remessas_pagamento(id) ON DELETE SET NULL,
  observacao TEXT
);

CREATE INDEX IF NOT EXISTS idx_saques_user ON saques(user_id);
CREATE INDEX IF NOT EXISTS idx_saques_status ON saques(status);
CREATE INDEX IF NOT EXISTS idx_saques_remessa ON saques(remessa_id);
