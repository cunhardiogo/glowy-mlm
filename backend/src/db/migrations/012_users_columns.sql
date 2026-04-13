-- Adiciona colunas de estado de ciclo na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS ativo_ciclo_atual BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduacao_ciclo_atual graduacao NOT NULL DEFAULT 'NENHUMA';

CREATE INDEX IF NOT EXISTS idx_users_ativo_ciclo ON users(ativo_ciclo_atual) WHERE ativo_ciclo_atual = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_grad_ciclo ON users(graduacao_ciclo_atual);
