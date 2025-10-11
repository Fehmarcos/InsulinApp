import { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Food, getAllFoods } from "../../services/mockFoodService";

interface SelectedFood {
  food: Food;
  unitId: string;
  quantity: number;
}

interface InsulinSettings {
  carbsPerInsulin: string;
  correctionFactor: string;
  insulinIncrement: string;
}

const SETTINGS_KEY = '@insulin_settings';

export default function Calc() {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [currentGlucose, setCurrentGlucose] = useState<string>("");
  const [targetGlucose, setTargetGlucose] = useState<string>("");
  const [settings, setSettings] = useState<InsulinSettings>({
    carbsPerInsulin: "15",
    correctionFactor: "40",
    insulinIncrement: "1"
  });

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    calculateTotalCarbs();
  }, [selectedFoods]);

  const loadFoods = async () => {
    try {
      const foodData = await getAllFoods();
      setAvailableFoods(foodData);
    } catch (error) {
      console.error("Error loading foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCarbs = () => {
    const total = selectedFoods.reduce((sum, item) => {
      const unit = item.food.units.find(u => u.id === item.unitId);
      if (!unit) return sum;
      const carbsPerGram = item.food.baseCarbs / 100;
      return sum + (carbsPerGram * unit.grams * item.quantity);
    }, 0);
    setTotalCarbs(total);
  };

  const handleAddFood = () => {
    if (selectedFood && selectedUnitId && quantity) {
      const newFood: SelectedFood = {
        food: selectedFood,
        unitId: selectedUnitId,
        quantity: Number(quantity)
      };
      setSelectedFoods(prev => [...prev, newFood]);
      resetModal();
    }
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const resetModal = () => {
    setModalVisible(false);
    setSelectedFood(null);
    setSelectedUnitId("");
    setQuantity("");
  };
  return (
    <View style={styles.container}>
      {/*Glicemia*/}
      <View style={styles.subContainer}>
        <Text style={styles.h1}>Glicemia</Text>
        <View style={styles.linha}>
          <Text>Atual (mg/dL)</Text>
          <TextInput style={styles.imput} placeholder="Ex: 70" keyboardType="numeric"/>
        </View>
        <View style={styles.linha}>
          <Text>Alvo (mg/dL)</Text>
          <TextInput style={styles.imput} placeholder="Ex: 120" keyboardType="numeric"/>
        </View>
      </View>
      {/*Alimento*/}
      <View style={styles.subContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.h1}>Alimentos</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedFoods}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const unit = item.food.units.find(u => u.id === item.unitId);
            const carbsPerGram = item.food.baseCarbs / 100;
            const totalFoodCarbs = carbsPerGram * (unit?.grams || 0) * item.quantity;
            
            return (
              <View style={styles.foodItem}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{item.food.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFood(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.foodDetails}>
                  <Text>{item.quantity}x {unit?.name}</Text>
                  <Text style={styles.carbsValue}>{totalFoodCarbs.toFixed(1)}g carbs</Text>
                </View>
              </View>
            );
          }}
          style={styles.foodList}
          contentContainerStyle={styles.foodListContent}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={resetModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Alimento</Text>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Selecione o Alimento:</Text>
                <FlatList
                  data={availableFoods}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.foodOption,
                        selectedFood?.id === item.id && styles.foodOptionSelected
                      ]}
                      onPress={() => setSelectedFood(item)}
                    >
                      <Text style={styles.foodOptionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                />
              </View>

              {selectedFood && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Unidade de Medida:</Text>
                  <View style={styles.unitsContainer}>
                    {selectedFood.units.map((unit) => (
                      <TouchableOpacity
                        key={unit.id}
                        style={[
                          styles.unitOption,
                          selectedUnitId === unit.id && styles.unitOptionSelected
                        ]}
                        onPress={() => setSelectedUnitId(unit.id)}
                      >
                        <Text style={styles.unitOptionText}>{unit.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {selectedUnitId && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Quantidade:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="Ex: 2"
                  />
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={resetModal}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonConfirm,
                    (!selectedFood || !selectedUnitId || !quantity) && styles.modalButtonDisabled
                  ]}
                  onPress={handleAddFood}
                  disabled={!selectedFood || !selectedUnitId || !quantity}
                >
                  <Text style={styles.modalButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* Calculo */}
      <View style={styles.subContainer}>
        <Text style={styles.h1}>Calculo</Text>
        <View style={styles.linha}>
          <Text>Total de Carboidratos:</Text>
          <Text style={styles.max2}>{totalCarbs.toFixed(1)}g</Text>
        </View>
        <View style={styles.linha}>
          <Text>Insulina para Alimentos:</Text>
          <Text style={styles.max2}>{(totalCarbs / 15).toFixed(1)}U</Text>
        </View>
        <View style={styles.linha}>
          <Text>Insulina para Correção:</Text>
          <Text style={styles.max2}>0.00</Text>
        </View>
        <View style={styles.linha}>
          <Text>Insulina Total:</Text>
          <Text style={styles.max1}>{(totalCarbs / 15).toFixed(1)}U</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "offwhite",
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  foodList: {
    width: "100%",
    maxHeight: 200,
  },
  foodListContent: {
    paddingHorizontal: 5,
  },
  foodItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  foodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  carbsValue: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  foodOption: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  foodOptionSelected: {
    backgroundColor: "#007AFF",
  },
  foodOptionText: {
    fontSize: 14,
    color: "#000",
  },
  unitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  unitOptionSelected: {
    backgroundColor: "#007AFF",
  },
  unitOptionText: {
    fontSize: 14,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: "#FF3B30",
  },
  modalButtonConfirm: {
    backgroundColor: "#007AFF",
  },
  modalButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  subContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 20,
    width: "96%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "white",
  },
  h1: {
    alignSelf: "flex-start",
    fontSize: 20,
    marginBottom: 10,
  },
  linha: {
    width: "100%",
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 3,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
  },
  max1: {
    borderRadius: 10,
    backgroundColor: "black",
    color: "white",
    padding: 5,
  },
  max2: {
    borderRadius: 10,
    backgroundColor: "lightgray",
    padding: 5,
  },
  imput: {
    borderRadius: 10,
    backgroundColor: "lightgray",
    padding: 5,
    width: "30%",
  },
});
