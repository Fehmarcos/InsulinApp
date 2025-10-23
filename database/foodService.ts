import { getDatabase } from './database';

export interface Unit {
  id: string;
  name: string;
  grams: number;
}

export interface Food {
  id: string;
  name: string;
  baseCarbs: number;
  units: Unit[];
}

// Busca todos os alimentos com suas unidades
export async function getAllFoods(): Promise<Food[]> {
  const db = getDatabase();
  
  try {
    const foods = await db.getAllAsync<{ id: number; name: string; base_carbs: number }>(
      'SELECT id, name, base_carbs FROM foods ORDER BY name'
    );

    const foodsWithUnits: Food[] = [];

    for (const food of foods) {
      const units = await db.getAllAsync<{ id: number; name: string; grams: number }>(
        'SELECT id, name, grams FROM units WHERE food_id = ? ORDER BY grams',
        [food.id]
      );

      foodsWithUnits.push({
        id: food.id.toString(),
        name: food.name,
        baseCarbs: food.base_carbs,
        units: units.map(u => ({
          id: u.id.toString(),
          name: u.name,
          grams: u.grams
        }))
      });
    }

    return foodsWithUnits;
  } catch (error) {
    console.error('Error getting all foods:', error);
    throw error;
  }
}

// Busca um alimento específico por ID
export async function getFoodById(id: string): Promise<Food | null> {
  const db = getDatabase();
  
  try {
    const food = await db.getFirstAsync<{ id: number; name: string; base_carbs: number }>(
      'SELECT id, name, base_carbs FROM foods WHERE id = ?',
      [parseInt(id)]
    );

    if (!food) return null;

    const units = await db.getAllAsync<{ id: number; name: string; grams: number }>(
      'SELECT id, name, grams FROM units WHERE food_id = ? ORDER BY grams',
      [food.id]
    );

    return {
      id: food.id.toString(),
      name: food.name,
      baseCarbs: food.base_carbs,
      units: units.map(u => ({
        id: u.id.toString(),
        name: u.name,
        grams: u.grams
      }))
    };
  } catch (error) {
    console.error('Error getting food by id:', error);
    throw error;
  }
}

// Adiciona um novo alimento
export async function addFood(name: string, baseCarbs: number, units: Omit<Unit, 'id'>[]): Promise<Food> {
  const db = getDatabase();
  
  try {
    const result = await db.runAsync(
      'INSERT INTO foods (name, base_carbs) VALUES (?, ?)',
      [name, baseCarbs]
    );

    const foodId = result.lastInsertRowId;

    // Adiciona as unidades
    const insertedUnits: Unit[] = [];
    for (const unit of units) {
      const unitResult = await db.runAsync(
        'INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)',
        [foodId, unit.name, unit.grams]
      );

      insertedUnits.push({
        id: unitResult.lastInsertRowId.toString(),
        name: unit.name,
        grams: unit.grams
      });
    }

    return {
      id: foodId.toString(),
      name,
      baseCarbs,
      units: insertedUnits
    };
  } catch (error) {
    console.error('Error adding food:', error);
    throw error;
  }
}

// Atualiza um alimento existente
export async function updateFood(id: string, name: string, baseCarbs: number, units: Unit[]): Promise<Food> {
  const db = getDatabase();
  
  try {
    const foodId = parseInt(id);

    // Atualiza o alimento
    await db.runAsync(
      'UPDATE foods SET name = ?, base_carbs = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, baseCarbs, foodId]
    );

    // Remove unidades antigas
    await db.runAsync('DELETE FROM units WHERE food_id = ?', [foodId]);

    // Adiciona novas unidades
    const insertedUnits: Unit[] = [];
    for (const unit of units) {
      const unitResult = await db.runAsync(
        'INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)',
        [foodId, unit.name, unit.grams]
      );

      insertedUnits.push({
        id: unitResult.lastInsertRowId.toString(),
        name: unit.name,
        grams: unit.grams
      });
    }

    return {
      id,
      name,
      baseCarbs,
      units: insertedUnits
    };
  } catch (error) {
    console.error('Error updating food:', error);
    throw error;
  }
}

// Remove um alimento
export async function deleteFood(id: string): Promise<void> {
  const db = getDatabase();
  
  try {
    await db.runAsync('DELETE FROM foods WHERE id = ?', [parseInt(id)]);
    // As unidades são removidas automaticamente devido ao ON DELETE CASCADE
  } catch (error) {
    console.error('Error deleting food:', error);
    throw error;
  }
}

// Busca alimentos por nome
export async function searchFoods(query: string): Promise<Food[]> {
  const db = getDatabase();
  
  try {
    const foods = await db.getAllAsync<{ id: number; name: string; base_carbs: number }>(
      'SELECT id, name, base_carbs FROM foods WHERE name LIKE ? ORDER BY name',
      [`%${query}%`]
    );

    const foodsWithUnits: Food[] = [];

    for (const food of foods) {
      const units = await db.getAllAsync<{ id: number; name: string; grams: number }>(
        'SELECT id, name, grams FROM units WHERE food_id = ? ORDER BY grams',
        [food.id]
      );

      foodsWithUnits.push({
        id: food.id.toString(),
        name: food.name,
        baseCarbs: food.base_carbs,
        units: units.map(u => ({
          id: u.id.toString(),
          name: u.name,
          grams: u.grams
        }))
      });
    }

    return foodsWithUnits;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
}
