CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  tipo pedido_tipo NOT NULL,
  kit kit_tipo,
  valor_centavos BIGINT NOT NULL CHECK (valor_centavos >= 0),
  pontos_graduacao INT NOT NULL DEFAULT 0,
  pontos_bonificaveis INT NOT NULL DEFAULT 0,
  status pedido_status NOT NULL DEFAULT 'PENDENTE',
  pago_em TIMESTAMPTZ,
  ciclo_ref DATE,
  gateway_ref TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_user_ciclo ON pedidos(user_id, ciclo_ref);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos(tipo);

CREATE TABLE IF NOT EXISTS pontos_movimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  ciclo_ref DATE NOT NULL,
  pg INT NOT NULL DEFAULT 0,
  pb INT NOT NULL DEFAULT 0,
  origem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pontos_user_ciclo ON pontos_movimento(user_id, ciclo_ref);
CREATE INDEX IF NOT EXISTS idx_pontos_pedido ON pontos_movimento(pedido_id);

CREATE OR REPLACE FUNCTION fn_pedidos_on_pago() RETURNS TRIGGER AS $$
DECLARE
  v_pg INT := 0;
  v_pb INT := 0;
  v_ciclo DATE;
BEGIN
  IF NEW.status = 'PAGO' AND (OLD.status IS DISTINCT FROM 'PAGO') THEN
    v_ciclo := COALESCE(NEW.ciclo_ref, date_trunc('month', now())::date);
    IF NEW.ciclo_ref IS NULL THEN
      NEW.ciclo_ref := v_ciclo;
    END IF;
    IF NEW.pago_em IS NULL THEN
      NEW.pago_em := now();
    END IF;

    IF NEW.tipo IN ('KIT_INICIAL', 'UPGRADE') THEN
      v_pg := floor(NEW.valor_centavos / 100);
      v_pb := 0;
    ELSIF NEW.tipo = 'RECOMPRA' THEN
      v_pg := floor(NEW.valor_centavos / 100);
      v_pb := floor(NEW.valor_centavos / 300);
    END IF;

    UPDATE pedidos
      SET pontos_graduacao = v_pg,
          pontos_bonificaveis = v_pb,
          ciclo_ref = v_ciclo,
          pago_em = COALESCE(pago_em, now())
      WHERE id = NEW.id;

    INSERT INTO pontos_movimento (user_id, pedido_id, ciclo_ref, pg, pb, origem)
    VALUES (NEW.user_id, NEW.id, v_ciclo, v_pg, v_pb, NEW.tipo::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pedidos_on_pago ON pedidos;
CREATE TRIGGER trg_pedidos_on_pago
  AFTER UPDATE OF status ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_pedidos_on_pago();
