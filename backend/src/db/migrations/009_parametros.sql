CREATE TABLE IF NOT EXISTS param_graduacoes (
  graduacao graduacao PRIMARY KEY,
  pg_requerido BIGINT NOT NULL,
  apm_requerido INT NOT NULL,
  vml_percentual NUMERIC(5,2) NOT NULL,
  equiparacao_pct NUMERIC(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS param_bonus_niveis (
  tipo bonus_tipo NOT NULL,
  nivel INT NOT NULL,
  percentual NUMERIC(6,3) NOT NULL,
  PRIMARY KEY (tipo, nivel)
);

INSERT INTO param_graduacoes (graduacao, pg_requerido, apm_requerido, vml_percentual, equiparacao_pct) VALUES
  ('NENHUMA',           0,       0,   100, 0),
  ('BRONZE',            2000,    50,  100, 3),
  ('PRATA',             6000,    50,  60,  6),
  ('OURO',              12000,   100, 60,  10),
  ('SAFIRA',            24000,   100, 50,  15),
  ('ESMERALDA',         50000,   100, 45,  15),
  ('DIAMANTE',          100000,  150, 40,  15),
  ('DUPLO_DIAMANTE',    200000,  150, 35,  15),
  ('TRIPLO_DIAMANTE',   400000,  150, 30,  15),
  ('IMPERIAL',          1000000, 200, 25,  15),
  ('EMBAIXADOR',        2000000, 200, 20,  15),
  ('EMBAIXADOR_GLOBAL', 5000000, 200, 15,  15)
ON CONFLICT (graduacao) DO NOTHING;

INSERT INTO param_bonus_niveis (tipo, nivel, percentual) VALUES
  ('PRIMEIRO_PEDIDO', 1, 20),
  ('PRIMEIRO_PEDIDO', 2, 12),
  ('PRIMEIRO_PEDIDO', 3, 7),
  ('PRIMEIRO_PEDIDO', 4, 5),
  ('PRIMEIRO_PEDIDO', 5, 3),
  ('PRIMEIRO_PEDIDO', 6, 2),
  ('PRIMEIRO_PEDIDO', 7, 1),
  ('UPGRADE', 1, 20),
  ('UPGRADE', 2, 12),
  ('UPGRADE', 3, 7),
  ('UPGRADE', 4, 5),
  ('UPGRADE', 5, 3),
  ('UPGRADE', 6, 2),
  ('UPGRADE', 7, 1),
  ('PRODUTIVIDADE', 1, 5),
  ('PRODUTIVIDADE', 2, 6),
  ('PRODUTIVIDADE', 3, 7),
  ('PRODUTIVIDADE', 4, 8),
  ('PRODUTIVIDADE', 5, 7),
  ('PRODUTIVIDADE', 6, 6),
  ('PRODUTIVIDADE', 7, 5),
  ('PRODUTIVIDADE', 8, 3),
  ('PRODUTIVIDADE', 9, 2),
  ('PRODUTIVIDADE', 10, 1)
ON CONFLICT (tipo, nivel) DO NOTHING;
