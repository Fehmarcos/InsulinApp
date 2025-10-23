import FoodSearch from "@/components/FoodSearch";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Food, getAllFoods } from "../../services/mockFoodService";
import {
  InsulinSettings,
  calculateCorrectionInsulin,
  calculateInsulinForCarbs,
  getInsulinSettings,
  roundInsulinToIncrement
} from "../../services/settingsService";

interface SelectedFood {
  food: Food;
  unitId: string;
  quantity: number;
}

export default function Calc() {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [currentGlucose, setCurrentGlucose] = useState<string>("");
  const [targetGlucose, setTargetGlucose] = useState<string>("");
  const [settings, setSettings] = useState<InsulinSettings>({
    carbsPerInsulin: 15,
    correctionFactor: 40,
    insulinIncrement: 1
  });

  useEffect(() => {
    loadFoods();
    loadSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
    calculateTotalCarbs();
  }, [selectedFoods]);

  const loadSettings = async () => {
    const loadedSettings = await getInsulinSettings();
    setSettings(loadedSettings);
  };

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

  const handleSelectFoodFromSearch = (food: Food) => {
    // Seleciona automaticamente a primeira unidade e quantidade 1
    const firstUnit = food.units[0];
    const newFood: SelectedFood = {
      food: food,
      unitId: firstUnit.id,
      quantity: 1
    };
    setSelectedFoods(prev => [...prev, newFood]);
    // Não fecha o modal - usuário pode adicionar múltiplos alimentos
  };

  const handleDeselectFood = (foodId: string) => {
    // Remove todos os itens com esse foodId
    setSelectedFoods(prev => prev.filter(item => item.food.id !== foodId));
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateUnit = (index: number, unitId: string) => {
    setSelectedFoods(prev => prev.map((item, i) => 
      i === index ? { ...item, unitId } : item
    ));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setSelectedFoods(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const resetModal = () => {
    setModalVisible(false);
  };
  return (
    <View style={styles.container}>
      {/*Glicemia*/}
      <View style={styles.subContainer}>
        <Text style={styles.h1}>Glicemia</Text>
        <View style={styles.linha}>
          <Text>Atual (mg/dL)</Text>
          <TextInput 
            style={styles.imput} 
            placeholder="Ex: 70" 
            keyboardType="numeric"
            value={currentGlucose}
            onChangeText={setCurrentGlucose}
          />
        </View>
        <View style={styles.linha}>
          <Text>Alvo (mg/dL)</Text>
          <TextInput 
            style={styles.imput} 
            placeholder="Ex: 120" 
            keyboardType="numeric"
            value={targetGlucose}
            onChangeText={setTargetGlucose}
          />
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
                <View style={styles.foodControlsRow}>
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Unidade:</Text>
                    <View style={styles.pickerContainer}>
                      {item.food.units.map((u) => (
                        <TouchableOpacity
                          key={u.id}
                          style={[
                            styles.unitButton,
                            item.unitId === u.id && styles.unitButtonSelected
                          ]}
                          onPress={() => handleUpdateUnit(index, u.id)}
                        >
                          <Text style={[
                            styles.unitButtonText,
                            item.unitId === u.id && styles.unitButtonTextSelected
                          ]}>
                            {u.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Qtd:</Text>
                    <TextInput
                      style={styles.quantityInputSmall}
                      value={item.quantity.toString()}
                      onChangeText={(text) => {
                        // Permite edição livre, inclusive texto vazio
                        if (text === '') {
                          handleUpdateQuantity(index, 0);
                        } else {
                          const num = Number(text);
                          if (!isNaN(num)) {
                            handleUpdateQuantity(index, num);
                          }
                        }
                      }}
                      onBlur={() => {
                        // Ao perder o foco, garante que seja pelo menos 1
                        if (item.quantity <= 0) {
                          handleUpdateQuantity(index, 1);
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.foodDetails}>
                  <Text style={styles.carbsValue}>{totalFoodCarbs.toFixed(1)}g carboidratos</Text>
                </View>
              </View>
            );
          }}
          style={styles.foodList}
          contentContainerStyle={styles.foodListContent}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={resetModal}
        >
          <View style={styles.modalFullScreen}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Alimento</Text>
              <TouchableOpacity onPress={resetModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <FoodSearch 
                foods={availableFoods}
                onSelectFood={handleSelectFoodFromSearch}
                onDeselectFood={handleDeselectFood}
                selectedFoodIds={selectedFoods.map(f => f.food.id)}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={resetModal}
              >
                <Text style={styles.doneButtonText}>Concluir</Text>
              </TouchableOpacity>
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
          <Text style={styles.max2}>
            {calculateInsulinForCarbs(totalCarbs, settings.carbsPerInsulin).toFixed(1)}U
          </Text>
        </View>
        <View style={styles.linha}>
          <Text>Insulina para Correção:</Text>
          <Text style={styles.max2}>
            {calculateCorrectionInsulin(
              Number(currentGlucose) || 0,
              Number(targetGlucose) || 0,
              settings.correctionFactor
            ).toFixed(1)}U
          </Text>
        </View>
        <View style={styles.linha}>
          <Text>Insulina Total:</Text>
          <Text style={styles.max1}>
            {roundInsulinToIncrement(
              calculateInsulinForCarbs(totalCarbs, settings.carbsPerInsulin) +
              calculateCorrectionInsulin(
                Number(currentGlucose) || 0,
                Number(targetGlucose) || 0,
                settings.correctionFactor
              ),
              settings.insulinIncrement
            ).toFixed(1)}U
          </Text>
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
  foodControlsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  unitButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  unitButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  unitButtonText: {
    fontSize: 12,
    color: "#333",
  },
  unitButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  quantityInputSmall: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "white",
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
    fontWeight: "300",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  doneButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
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
