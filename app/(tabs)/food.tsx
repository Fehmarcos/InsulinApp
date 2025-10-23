import FoodSearch from "@/components/FoodSearch";
import { Food, deleteFood, getAllFoods } from "@/services/mockFoodService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods() {
    try {
      const foodList = await getAllFoods();
      setFoods(foodList);
    } catch (error) {
      console.error('Erro ao carregar alimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de alimentos');
    }
  }

  function handleEditFood(food: Food) {
    router.push({
      pathname: '/foodForm',
      params: {
        id: food.id,
        name: food.name,
        baseCarbs: food.baseCarbs.toString(),
      },
    });
  }

  async function handleDeleteFood(food: Food) {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente deletar "${food.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFood(food.id);
              await loadFoods(); // Recarrega a lista
              Alert.alert('Sucesso', 'Alimento deletado!');
            } catch (error) {
              console.error('Erro ao deletar alimento:', error);
              Alert.alert('Erro', 'Não foi possível deletar o alimento');
            }
          },
        },
      ]
    );
  }

  function handleCopyFood(food: Food) {
    // Navega para o formulário sem ID, mas com os dados preenchidos
    // O usuário pode editar antes de salvar
    router.push({
      pathname: '/foodForm',
      params: {
        name: `${food.name} (cópia)`,
        baseCarbs: food.baseCarbs.toString(),
        copyFrom: food.id, // Pode ser usado para copiar as unidades também
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alimentos cadastrados</Text>
      
      <FoodSearch 
        foods={foods}
        onSelectFood={handleEditFood}
        onDeleteFood={handleDeleteFood}
        onCopyFood={handleCopyFood}
      />

      <View style={styles.buttonContainer}>
        <Button 
          title="Adicionar Alimento" 
          onPress={() => router.push('/foodForm')}
          color="lightgray"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    paddingBottom: 16,
  },
});
