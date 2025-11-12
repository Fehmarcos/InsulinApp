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
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8F5",
    color: "#2D3142",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  foodItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8E8F5",
  },
  foodItemSelected: {
    backgroundColor: "#F0F2FF",
    borderColor: "#6B7FD7",
    borderWidth: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#2D3142",
  },
  foodDetails: {
    fontSize: 14,
    color: "#8B8FA8",
  },
  foodBaseCarbs: {
    fontSize: 12,
    color: "#B8B8D1",
    marginTop: 2,
  },
  selectedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#6B7FD7",
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
    backgroundColor: 'rgba(45, 49, 66, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    minWidth: 280,
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  contextMenuTitle: {
    fontSize: 17,
    fontWeight: '700',
    padding: 18,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F5',
    color: '#2D3142',
  },
  contextMenuItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F5',
  },
  contextMenuItemDanger: {
    backgroundColor: '#FFE8E8',
  },
  contextMenuText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2D3142',
    fontWeight: '500',
  },
  contextMenuTextDanger: {
    color: '#FF9AA2',
    fontWeight: '600',
  },
  contextMenuCancel: {
    padding: 18,
    marginTop: 8,
  },
  contextMenuCancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8B8FA8',
    fontWeight: '500',
  },
});
