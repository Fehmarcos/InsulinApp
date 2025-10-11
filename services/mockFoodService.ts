export interface Food {
  id: string;
  name: string;
  baseCarbs: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  grams: number;
}

const mockFoods: Food[] = [
  {
    id: '1',
    name: 'Arroz Branco',
    baseCarbs: 28.2,
    units: [
      { id: '1', name: 'Colher de Sopa', grams: 25 },
      { id: '2', name: 'Xícara', grams: 200 },
    ]
  },
  {
    id: '2',
    name: 'Pão Francês',
    baseCarbs: 59,
    units: [
      { id: '3', name: 'Unidade', grams: 50 },
      { id: '4', name: 'Metade', grams: 25 },
    ]
  },
  {
    id: '3',
    name: 'Banana Prata',
    baseCarbs: 22,
    units: [
      { id: '5', name: 'Unidade Média', grams: 100 },
      { id: '6', name: 'Unidade Pequena', grams: 70 },
    ]
  }
];

export function getAllFoods(): Promise<Food[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockFoods]);
    }, 500); // Simula delay de rede
  });
}

export function getFoodById(id: string): Promise<Food | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const food = mockFoods.find(f => f.id === id);
      resolve(food ? { ...food, units: [...food.units] } : undefined);
    }, 500);
  });
}

export function addFood(food: Omit<Food, 'id'>): Promise<Food> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFood: Food = {
        ...food,
        id: (mockFoods.length + 1).toString()
      };
      mockFoods.push(newFood);
      resolve({ ...newFood });
    }, 500);
  });
}

export function updateFood(food: Food): Promise<Food> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFoods.findIndex(f => f.id === food.id);
      if (index === -1) {
        reject(new Error('Alimento não encontrado'));
        return;
      }
      mockFoods[index] = food;
      resolve({ ...food });
    }, 500);
  });
}

export function deleteFood(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFoods.findIndex(f => f.id === id);
      if (index === -1) {
        reject(new Error('Alimento não encontrado'));
        return;
      }
      mockFoods.splice(index, 1);
      resolve();
    }, 500);
  });
}