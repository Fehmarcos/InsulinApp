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
                        // Permite edição livre, inclusive texto vazio e decimais
                        if (text === '') {
                          handleUpdateQuantity(index, 0);
                        } else {
                          // Substitui vírgula por ponto para aceitar ambos os formatos
                          const normalizedText = text.replace(',', '.');
                          const num = parseFloat(normalizedText);
                          if (!isNaN(num)) {
                            handleUpdateQuantity(index, num);
                          }
                        }
                      }}
                      onBlur={() => {
                        // Ao perder o foco, garante que seja pelo menos 0.1
                        if (item.quantity <= 0) {
                          handleUpdateQuantity(index, 1);
                        }
                      }}
                      keyboardType="decimal-pad"
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
    backgroundColor: "#F5F6FA",
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
    backgroundColor: "#6B7FD7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8E8F5",
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  foodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3142",
  },
  carbsValue: {
    fontSize: 14,
    color: "#8B8FA8",
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 22,
    color: "#FF9AA2",
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
    color: "#8B8FA8",
    marginBottom: 4,
    fontWeight: "500",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  unitButton: {
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8F5",
  },
  unitButtonSelected: {
    backgroundColor: "#6B7FD7",
    borderColor: "#6B7FD7",
  },
  unitButtonText: {
    fontSize: 12,
    color: "#2D3142",
    fontWeight: "500",
  },
  unitButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  quantityInputSmall: {
    borderWidth: 1,
    borderColor: "#E8E8F5",
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "white",
    color: "#2D3142",
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: "#F5F6FA",
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
    borderBottomColor: "#E8E8F5",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3142",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#8B8FA8",
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
    borderTopColor: "#E8E8F5",
    backgroundColor: "#FFFFFF",
  },
  doneButton: {
    backgroundColor: "#6B7FD7",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  subContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 20,
    width: "96%",
    borderWidth: 1,
    borderColor: "#E8E8F5",
    borderRadius: 20,
    shadowColor: "#6B7FD7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },
  h1: {
    alignSelf: "flex-start",
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3142",
    marginBottom: 12,
  },
  linha: {
    width: "100%",
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderColor: "#E8E8F5",
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    backgroundColor: "#F5F6FA",
  },
  max1: {
    borderRadius: 12,
    backgroundColor: "#6B7FD7",
    color: "white",
    padding: 8,
    paddingHorizontal: 12,
    fontWeight: "700",
  },
  max2: {
    borderRadius: 12,
    backgroundColor: "#E8E8F5",
    color: "#2D3142",
    padding: 8,
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  imput: {
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E8E8F5",
    padding: 8,
    paddingHorizontal: 12,
    width: "30%",
    color: "#2D3142",
  },
});
