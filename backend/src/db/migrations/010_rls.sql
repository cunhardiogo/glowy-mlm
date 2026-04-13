CREATE OR REPLACE FUNCTION auth_user_id() RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_path() RETURNS LTREE AS $$
  SELECT path FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND tipo = 'ADMIN');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_ei() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND tipo = 'EI');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_movimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteira ENABLE ROW LEVEL SECURITY;
ALTER TABLE saques ENABLE ROW LEVEL SECURITY;
ALTER TABLE remessas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE param_graduacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE param_bonus_niveis ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT USING (
  id = auth_user_id() OR path <@ auth_user_path() OR auth_is_admin()
);
DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth_user_id()) WITH CHECK (id = auth_user_id());

-- documentos
DROP POLICY IF EXISTS documentos_select ON documentos;
CREATE POLICY documentos_select ON documentos FOR SELECT USING (user_id = auth_user_id() OR auth_is_admin());
DROP POLICY IF EXISTS documentos_insert ON documentos;
CREATE POLICY documentos_insert ON documentos FOR INSERT WITH CHECK (user_id = auth_user_id() OR auth_is_admin());
DROP POLICY IF EXISTS documentos_update ON documentos;
CREATE POLICY documentos_update ON documentos FOR UPDATE USING (user_id = auth_user_id() OR auth_is_admin());

-- pedidos
DROP POLICY IF EXISTS pedidos_select ON pedidos;
CREATE POLICY pedidos_select ON pedidos FOR SELECT USING (
  user_id = auth_user_id()
  OR EXISTS (SELECT 1 FROM users u WHERE u.id = pedidos.user_id AND u.path <@ auth_user_path())
  OR auth_is_admin()
);
DROP POLICY IF EXISTS pedidos_insert ON pedidos;
CREATE POLICY pedidos_insert ON pedidos FOR INSERT WITH CHECK (user_id = auth_user_id());

-- pontos_movimento
DROP POLICY IF EXISTS pontos_select ON pontos_movimento;
CREATE POLICY pontos_select ON pontos_movimento FOR SELECT USING (
  user_id = auth_user_id()
  OR EXISTS (SELECT 1 FROM users u WHERE u.id = pontos_movimento.user_id AND u.path <@ auth_user_path())
  OR auth_is_admin()
);

-- qualificacoes
DROP POLICY IF EXISTS qualif_select ON qualificacoes;
CREATE POLICY qualif_select ON qualificacoes FOR SELECT USING (
  user_id = auth_user_id()
  OR EXISTS (SELECT 1 FROM users u WHERE u.id = qualificacoes.user_id AND u.path <@ auth_user_path())
  OR auth_is_admin()
);

-- bonus_lancamentos
DROP POLICY IF EXISTS bonus_select ON bonus_lancamentos;
CREATE POLICY bonus_select ON bonus_lancamentos FOR SELECT USING (
  beneficiario_id = auth_user_id() OR auth_is_admin()
);

-- carteira
DROP POLICY IF EXISTS carteira_select ON carteira;
CREATE POLICY carteira_select ON carteira FOR SELECT USING (user_id = auth_user_id() OR auth_is_admin());
DROP POLICY IF EXISTS carteira_update ON carteira;
CREATE POLICY carteira_update ON carteira FOR UPDATE USING (user_id = auth_user_id() OR auth_is_admin());

-- saques
DROP POLICY IF EXISTS saques_select ON saques;
CREATE POLICY saques_select ON saques FOR SELECT USING (user_id = auth_user_id() OR auth_is_admin());
DROP POLICY IF EXISTS saques_insert ON saques;
CREATE POLICY saques_insert ON saques FOR INSERT WITH CHECK (user_id = auth_user_id());
DROP POLICY IF EXISTS saques_update ON saques;
CREATE POLICY saques_update ON saques FOR UPDATE USING (auth_is_admin());

-- ciclos
DROP POLICY IF EXISTS ciclos_select ON ciclos;
CREATE POLICY ciclos_select ON ciclos FOR SELECT USING (auth.role() = 'authenticated');

-- remessas_pagamento
DROP POLICY IF EXISTS remessas_select ON remessas_pagamento;
CREATE POLICY remessas_select ON remessas_pagamento FOR SELECT USING (auth_is_admin());

-- parametros
DROP POLICY IF EXISTS pg_select ON param_graduacoes;
CREATE POLICY pg_select ON param_graduacoes FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS pg_update ON param_graduacoes;
CREATE POLICY pg_update ON param_graduacoes FOR UPDATE USING (auth_is_admin());
DROP POLICY IF EXISTS pg_insert ON param_graduacoes;
CREATE POLICY pg_insert ON param_graduacoes FOR INSERT WITH CHECK (auth_is_admin());
DROP POLICY IF EXISTS pg_delete ON param_graduacoes;
CREATE POLICY pg_delete ON param_graduacoes FOR DELETE USING (auth_is_admin());

DROP POLICY IF EXISTS pbn_select ON param_bonus_niveis;
CREATE POLICY pbn_select ON param_bonus_niveis FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS pbn_update ON param_bonus_niveis;
CREATE POLICY pbn_update ON param_bonus_niveis FOR UPDATE USING (auth_is_admin());
DROP POLICY IF EXISTS pbn_insert ON param_bonus_niveis;
CREATE POLICY pbn_insert ON param_bonus_niveis FOR INSERT WITH CHECK (auth_is_admin());
DROP POLICY IF EXISTS pbn_delete ON param_bonus_niveis;
CREATE POLICY pbn_delete ON param_bonus_niveis FOR DELETE USING (auth_is_admin());
