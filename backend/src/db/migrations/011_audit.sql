CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT,
  entidade_id UUID,
  payload JSONB,
  ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

CREATE OR REPLACE FUNCTION fn_audit_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_user UUID;
  v_entidade_id UUID;
  v_payload JSONB;
BEGIN
  BEGIN
    v_user := auth_user_id();
  EXCEPTION WHEN OTHERS THEN
    v_user := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_entidade_id := (row_to_json(OLD)->>'id')::UUID;
    v_payload := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_entidade_id := (row_to_json(NEW)->>'id')::UUID;
    v_payload := jsonb_build_object('new', to_jsonb(NEW));
  ELSE
    v_entidade_id := (row_to_json(NEW)->>'id')::UUID;
    v_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  END IF;

  INSERT INTO audit_log (user_id, acao, entidade, entidade_id, payload)
  VALUES (v_user, TG_OP, TG_TABLE_NAME, v_entidade_id, v_payload);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_pedidos ON pedidos;
CREATE TRIGGER trg_audit_pedidos
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_bonus ON bonus_lancamentos;
CREATE TRIGGER trg_audit_bonus
  AFTER INSERT ON bonus_lancamentos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_saques ON saques;
CREATE TRIGGER trg_audit_saques
  AFTER INSERT OR UPDATE ON saques
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_ciclos ON ciclos;
CREATE TRIGGER trg_audit_ciclos
  AFTER UPDATE ON ciclos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
