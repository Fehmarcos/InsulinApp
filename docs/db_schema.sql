-- Banco de dados atual - SQL

-- Tabela de alimentos (foods)
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  base_carbs REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de unidades (units) relacionadas com foods
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL,
  FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE
);

-- Tabela de settings (KV store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_units_food_id ON units(food_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);

-- Exemplo de migração: adicionar coluna updated_at em units (opcional)
-- ALTER TABLE units ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;