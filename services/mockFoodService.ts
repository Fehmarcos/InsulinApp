// Re-export dos tipos e funções do foodService do banco de dados SQLite
// Este arquivo mantém a compatibilidade com o código existente
export {
    addFood, deleteFood, getAllFoods,
    getFoodById, searchFoods, updateFood
} from '../database/foodService';
export type { Food, Unit } from '../database/foodService';
