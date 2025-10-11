import { Food, getAllFoods } from "@/services/mockFoodService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
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

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

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

  function renderFoodItem({ item }: { item: Food }) {
    // Encontra a menor unidade para exibição
    const smallestUnit = item.units.reduce((prev, curr) => 
      prev.grams < curr.grams ? prev : curr
    );

    const carbsInUnit = (smallestUnit.grams * item.baseCarbs) / 100;

    return (
      <TouchableOpacity
        style={styles.foodItem}
        onPress={() => handleEditFood(item)}
      >
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodDetails}>
            {carbsInUnit.toFixed(1)}g carbs / {smallestUnit.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alimentos cadastrados</Text>
      
      <TextInput
        style={styles.search}
        placeholder="Buscar alimento..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredFoods}
        keyExtractor={item => item.id}
        renderItem={renderFoodItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
  search: {
    height: 40,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 16,
    paddingBottom: 16,
  },
});
