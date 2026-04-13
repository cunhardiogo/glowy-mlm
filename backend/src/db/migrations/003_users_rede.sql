CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  tipo user_tipo NOT NULL,
  username CITEXT UNIQUE NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL CHECK (cpf ~ '^[0-9]{11}$'),
  nome TEXT NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  telefone VARCHAR(20),
  nascimento DATE,
  endereco JSONB,
  pix_chave TEXT,
  pix_tipo VARCHAR(10),
  status_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  patrocinador_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  path LTREE,
  profundidade INT NOT NULL DEFAULT 0,
  kit_atual kit_tipo,
  graduacao_reconhecimento graduacao NOT NULL DEFAULT 'NENHUMA',
  contrato_aceito_em TIMESTAMPTZ,
  contrato_ip INET,
  contrato_user_agent TEXT,
  contrato_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_patrocinador ON users(patrocinador_id);
CREATE INDEX IF NOT EXISTS idx_users_path_gist ON users USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_users_path_btree ON users USING BTREE(path);
CREATE INDEX IF NOT EXISTS idx_users_profundidade ON users(profundidade);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

CREATE OR REPLACE FUNCTION fn_users_set_path() RETURNS TRIGGER AS $$
DECLARE
  parent_path LTREE;
  label TEXT;
BEGIN
  label := replace(NEW.id::text, '-', '');
  IF NEW.patrocinador_id IS NULL THEN
    NEW.path := label::ltree;
    NEW.profundidade := 0;
  ELSE
    SELECT path INTO parent_path FROM users WHERE id = NEW.patrocinador_id;
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Patrocinador % não possui path definido', NEW.patrocinador_id;
    END IF;
    NEW.path := parent_path || label::ltree;
    NEW.profundidade := nlevel(parent_path);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_path ON users;
CREATE TRIGGER trg_users_set_path
  BEFORE INSERT OR UPDATE OF patrocinador_id ON users
  FOR EACH ROW EXECUTE FUNCTION fn_users_set_path();

CREATE OR REPLACE FUNCTION fn_users_cascade_path() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.path IS DISTINCT FROM OLD.path THEN
    UPDATE users
      SET path = NEW.path || subpath(path, nlevel(OLD.path)),
          profundidade = nlevel(NEW.path || subpath(path, nlevel(OLD.path))) - 1
      WHERE path <@ OLD.path AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_cascade_path ON users;
CREATE TRIGGER trg_users_cascade_path
  AFTER UPDATE OF path ON users
  FOR EACH ROW EXECUTE FUNCTION fn_users_cascade_path();

CREATE OR REPLACE FUNCTION fn_users_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_users_updated_at();
