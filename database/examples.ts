import { 
  getAllFoods, 
  getFoodById, 
  addFood, 
  updateFood, 
  deleteFood,
  searchFoods 
} from '@/database/foodService';

import {
  getInsulinSettings,
  saveInsulinSettings
} from '@/services/settingsService';

// ===== EXEMPLOS DE USO DO FOOD SERVICE =====

// 1. Buscar todos os alimentos
async function exemploGetAllFoods() {
  try {
    const foods = await getAllFoods();
    console.log('Alimentos encontrados:', foods.length);
    
    foods.forEach(food => {
      console.log(`${food.name}: ${food.baseCarbs}g/100g`);
      food.units.forEach(unit => {
        console.log(`  - ${unit.name}: ${unit.grams}g`);
      });
    });
  } catch (error) {
    console.error('Erro ao buscar alimentos:', error);
  }
}

// 2. Buscar alimento específico
async function exemploGetFoodById(id: string) {
  try {
    const food = await getFoodById(id);
    
    if (food) {
      console.log('Alimento encontrado:', food.name);
      console.log('Carboidratos:', food.baseCarbs, 'g/100g');
      console.log('Unidades disponíveis:', food.units.length);
    } else {
      console.log('Alimento não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar alimento:', error);
  }
}

// 3. Adicionar novo alimento
async function exemploAddFood() {
  try {
    const newFood = await addFood(
      'Macarrão',
      25.5, // carboidratos por 100g
      [
        { name: 'Colher de Sopa', grams: 20 },
        { name: 'Prato Raso', grams: 150 },
        { name: 'Prato Fundo', grams: 250 }
      ]
    );
    
    console.log('Alimento adicionado com sucesso!');
    console.log('ID:', newFood.id);
    console.log('Nome:', newFood.name);
  } catch (error) {
    console.error('Erro ao adicionar alimento:', error);
  }
}

// 4. Atualizar alimento existente
async function exemploUpdateFood(id: string) {
  try {
    const updatedFood = await updateFood(
      id,
      'Arroz Integral', // novo nome
      24.0, // novos carboidratos
      [
        { id: '1', name: 'Colher de Sopa', grams: 25 },
        { id: '2', name: 'Xícara', grams: 200 },
        { id: '999', name: 'Concha', grams: 100 } // nova unidade
      ]
    );
    
    console.log('Alimento atualizado:', updatedFood.name);
  } catch (error) {
    console.error('Erro ao atualizar alimento:', error);
  }
}

// 5. Deletar alimento
async function exemploDeleteFood(id: string) {
  try {
    await deleteFood(id);
    console.log('Alimento removido com sucesso!');
  } catch (error) {
    console.error('Erro ao remover alimento:', error);
  }
}

// 6. Buscar alimentos por nome
async function exemploSearchFoods(query: string) {
  try {
    const results = await searchFoods(query);
    console.log(`Encontrados ${results.length} alimentos para "${query}"`);
    
    results.forEach(food => {
      console.log(`- ${food.name}`);
    });
  } catch (error) {
    console.error('Erro ao buscar alimentos:', error);
  }
}

// ===== EXEMPLOS DE USO DO SETTINGS SERVICE =====

// 1. Carregar configurações
async function exemploGetSettings() {
  try {
    const settings = await getInsulinSettings();
    
    console.log('Configurações atuais:');
    console.log(`- Carboidratos por insulina: ${settings.carbsPerInsulin}g/U`);
    console.log(`- Fator de correção: ${settings.correctionFactor} mg/dL/U`);
    console.log(`- Incremento de insulina: ${settings.insulinIncrement}U`);
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
}

// 2. Salvar configurações
async function exemploSaveSettings() {
  try {
    await saveInsulinSettings({
      carbsPerInsulin: 12,
      correctionFactor: 50,
      insulinIncrement: 0.5
    });
    
    console.log('Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

// ===== EXEMPLO DE USO COMPLETO EM UM COMPONENTE =====

export function ExemploComponente() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [settings, setSettings] = useState<InsulinSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Carrega alimentos e configurações em paralelo
      const [foodData, settingsData] = await Promise.all([
        getAllFoods(),
        getInsulinSettings()
      ]);

      setFoods(foodData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async function handleAddNewFood() {
    try {
      const newFood = await addFood(
        'Novo Alimento',
        30,
        [{ name: 'Porção', grams: 100 }]
      );

      // Atualiza lista local
      setFoods(prev => [...prev, newFood]);

      Alert.alert('Sucesso', 'Alimento adicionado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o alimento');
    }
  }

  async function handleDeleteFood(id: string) {
    try {
      await deleteFood(id);

      // Remove da lista local
      setFoods(prev => prev.filter(f => f.id !== id));

      Alert.alert('Sucesso', 'Alimento removido!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o alimento');
    }
  }

  async function handleUpdateSettings(newSettings: InsulinSettings) {
    try {
      await saveInsulinSettings(newSettings);
      setSettings(newSettings);

      Alert.alert('Sucesso', 'Configurações atualizadas!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  }

  return (
    <View>
      {/* Renderizar UI */}
    </View>
  );
}

// ===== EXEMPLO DE TRANSAÇÃO (Para implementação futura) =====

// Quando precisar fazer múltiplas operações que devem ser atômicas
async function exemploTransacao() {
  const db = getDatabase();
  
  try {
    // Inicia transação
    await db.execAsync('BEGIN TRANSACTION');

    // Múltiplas operações
    const food = await db.runAsync(
      'INSERT INTO foods (name, base_carbs) VALUES (?, ?)',
      ['Alimento 1', 20]
    );

    await db.runAsync(
      'INSERT INTO units (food_id, name, grams) VALUES (?, ?, ?)',
      [food.lastInsertRowId, 'Unidade', 100]
    );

    // Confirma transação
    await db.execAsync('COMMIT');
    console.log('Transação completada com sucesso!');
  } catch (error) {
    // Reverte em caso de erro
    await db.execAsync('ROLLBACK');
    console.error('Erro na transação:', error);
    throw error;
  }
}
