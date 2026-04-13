CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL,
  storage_path TEXT NOT NULL,
  mime TEXT,
  status doc_status NOT NULL DEFAULT 'PENDENTE',
  revisor_id UUID REFERENCES users(id),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documentos_user ON documentos(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status);
