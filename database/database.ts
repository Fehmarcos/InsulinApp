import * as SQLite from 'expo-sqlite';

const DB_NAME = 'insulin_app.db';

let db: SQLite.SQLiteDatabase | null = null;

// Inicializa o banco de dados
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Cria tabela de alimentos
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        base_carbs REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria tabela de unidades de medida
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        grams REAL NOT NULL,
        FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE
      );
    `);

    // Cria tabela de configurações (key-value)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria índices para melhor performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_units_food_id ON units(food_id);
      CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
    `);

    console.log('Database initialized successfully');
    
    // Insere dados de exemplo se o banco estiver vazio
    await seedInitialData();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Insere dados iniciais se o banco estiver vazio
async function seedInitialData(): Promise<void> {
  if (!db) return;

  try {
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM foods');
    
    if (result && result.count === 0) {
      console.log('Seeding initial data...');
      
      // Alimento 1: Arroz Branco
      const rice = await db.runAsync(
        'INSERT INTO foods (name, base_carbs) VALUES (?, ?)',
        ['Arroz Branco', 28.2]
      );
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [rice.lastInsertRowId, 'Colher de Sopa', 25]);
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [rice.lastInsertRowId, 'Xícara', 200]);

      // Alimento 2: Pão Francês
      const bread = await db.runAsync(
        'INSERT INTO foods (name, base_carbs) VALUES (?, ?)',
        ['Pão Francês', 59]
      );
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [bread.lastInsertRowId, 'Unidade', 50]);
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [bread.lastInsertRowId, 'Metade', 25]);

      // Alimento 3: Banana Prata
      const banana = await db.runAsync(
        'INSERT INTO foods (name, base_carbs) VALUES (?, ?)',
        ['Banana Prata', 22]
      );
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [banana.lastInsertRowId, 'Unidade Média', 100]);
      await db.runAsync('INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)', [banana.lastInsertRowId, 'Unidade Pequena', 70]);

      // Configurações padrão
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', ['carbsPerInsulin', '15']);
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', ['correctionFactor', '40']);
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', ['insulinIncrement', '1']);

      console.log('Initial data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

// Retorna a instância do banco de dados
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Fecha o banco de dados
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
