import { Food } from "@/services/mockFoodService";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface FoodSearchProps {
  foods: Food[];
  onSelectFood: (food: Food) => void;
  onDeselectFood?: (foodId: string) => void;
  onDeleteFood?: (food: Food) => void;
  onCopyFood?: (food: Food) => void;
  selectedFoodIds?: string[];
}

export default function FoodSearch({ 
  foods, 
  onSelectFood, 
  onDeselectFood,
  onDeleteFood,
  onCopyFood,
  selectedFoodIds = [] 
}: FoodSearchProps) {
  const [search, setSearch] = useState("");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectFood = (food: Food) => {
    const isSelected = selectedFoodIds.includes(food.id);
    
    // Se já está selecionado e há callback de desselecionar, remove
    if (isSelected && onDeselectFood) {
      onDeselectFood(food.id);
      return;
    }
    
    // Se não está selecionado, adiciona
    if (!isSelected) {
      onSelectFood(food);
    }
  };

  const handleLongPress = (food: Food) => {
    setSelectedFood(food);
    setContextMenuVisible(true);
  };

  const handleDelete = () => {
    if (selectedFood && onDeleteFood) {
      setContextMenuVisible(false);
      onDeleteFood(selectedFood);
      setSelectedFood(null);
    }
  };

  const handleCopy = () => {
    if (selectedFood && onCopyFood) {
      setContextMenuVisible(false);
      onCopyFood(selectedFood);
      setSelectedFood(null);
    }
  };

  const handleCloseMenu = () => {
    setContextMenuVisible(false);
    setSelectedFood(null);
  };

  const renderFoodItem = ({ item }: { item: Food }) => {
    const isSelected = selectedFoodIds.includes(item.id);
    
    // Encontra a menor unidade para exibição
    const smallestUnit = item.units.reduce((prev, curr) => 
      prev.grams < curr.grams ? prev : curr
    );

    const carbsInUnit = (smallestUnit.grams * item.baseCarbs) / 100;

    return (
      <View
        style={{
          opacity: isSelected ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          style={[
            styles.foodItem,
            isSelected && styles.foodItemSelected
          ]}
          onPress={() => handleSelectFood(item)}
          onLongPress={() => handleLongPress(item)}
        >
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodDetails}>
              {carbsInUnit.toFixed(1)}g carbs / {smallestUnit.name}
            </Text>
            <Text style={styles.foodBaseCarbs}>
              {item.baseCarbs}g / 100g
            </Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Buscar alimento..."
        value={search}
        onChangeText={setSearch}
        autoFocus
      />

      <FlatList
        data={filteredFoods}
        keyExtractor={item => item.id}
        renderItem={renderFoodItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />

      <Modal
        visible={contextMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          <View style={styles.contextMenu}>
            <Text style={styles.contextMenuTitle}>
              {selectedFood?.name}
            </Text>
            
            {onCopyFood && (
              <TouchableOpacity 
                style={styles.contextMenuItem}
                onPress={handleCopy}
              >
                <Text style={styles.contextMenuText}>📋 Criar Cópia</Text>
              </TouchableOpacity>
            )}

            {onDeleteFood && (
              <TouchableOpacity 
                style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
                onPress={handleDelete}
              >
                <Text style={[styles.contextMenuText, styles.contextMenuTextDanger]}>
                  🗑️ Deletar
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.contextMenuCancel}
              onPress={handleCloseMenu}
            >
              <Text style={styles.contextMenuCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  search: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  foodItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  foodItemSelected: {
    backgroundColor: "#e8f4f8",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: "#666",
  },
  foodBaseCarbs: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  selectedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contextMenuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contextMenuItemDanger: {
    backgroundColor: '#fff5f5',
  },
  contextMenuText: {
    fontSize: 16,
    textAlign: 'center',
  },
  contextMenuTextDanger: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  contextMenuCancel: {
    padding: 16,
    marginTop: 8,
  },
  contextMenuCancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
