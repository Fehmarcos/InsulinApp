import { Unit, addFood, getFoodById, updateFood } from "@/services/mockFoodService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormUnit extends Omit<Unit, 'id'> {
  id: string;
}

export default function FoodForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [name, setName] = useState("");
  const [baseCarbs, setBaseCarbs] = useState("");
  const [portionSize, setPortionSize] = useState("100");
  const [carbsInPortion, setCarbsInPortion] = useState("");
  const [units, setUnits] = useState<FormUnit[]>([
    { id: '1', name: '', grams: 0 }
  ]);

  useEffect(() => {
    if (params.id) {
      loadFood(params.id as string);
    } else if (params.copyFrom) {
      // Carrega dados do alimento original para copiar
      loadFood(params.copyFrom as string, true);
    } else if (params.name || params.baseCarbs) {
      // Preenche com dados dos parâmetros (para cópia)
      if (params.name) setName(params.name as string);
      if (params.baseCarbs) setBaseCarbs(params.baseCarbs as string);
    }
  }, [params.id, params.copyFrom]);

  async function loadFood(id: string, isCopy = false) {
    try {
      const food = await getFoodById(id);
      if (food) {
        // Se for cópia, adiciona " (cópia)" ao nome e não preenche o ID
        setName(isCopy ? `${food.name} (cópia)` : food.name);
        setBaseCarbs(food.baseCarbs.toString());
        // Calcula de volta para a porção de 100g
        setPortionSize("100");
        setCarbsInPortion(food.baseCarbs.toString());
        setUnits(food.units.map(u => ({
          ...u,
          id: u.id.toString()
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar alimento:', error);
      Alert.alert('Erro', 'Não foi possível carregar o alimento');
    }
  }

  async function handleSave() {
    if (!name || !portionSize || !carbsInPortion) {
      Alert.alert("Preencha os dados básicos do alimento!");
      return;
    }
    if (!units.every(unit => unit.name && unit.grams)) {
      Alert.alert("Preencha todas as unidades corretamente!");
      return;
    }
    
    const parsedPortionSize = Number(portionSize);
    const parsedCarbsInPortion = Number(carbsInPortion);
    
    if (isNaN(parsedPortionSize) || isNaN(parsedCarbsInPortion)) {
      Alert.alert('Preencha os campos de carboidratos com números válidos!');
      return;
    }
    
    if (parsedPortionSize <= 0) {
      Alert.alert('O tamanho da porção deve ser maior que zero!');
      return;
    }
    
    // Calcula o percentual de carboidratos por 100g
    const parsedBase = (parsedCarbsInPortion / parsedPortionSize) * 100;

    try {
      // Prepare units for DB calls
      const unitsForInsert = units.map(u => ({
        name: u.name,
        grams: Number(u.grams)
      }));

      if (params.id) {
        // updateFood expects (id, name, baseCarbs, units)
        await updateFood(params.id as string, name, parsedBase, units.map(u => ({
          id: u.id,
          name: u.name,
          grams: Number(u.grams)
        })));
      } else {
        // addFood expects (name, baseCarbs, units)
        await addFood(name, parsedBase, unitsForInsert);
      }

      Alert.alert(
        "Sucesso!",
        params.id ? "Alimento atualizado!" : "Alimento cadastrado!",
        [{ text: "OK", onPress: () => router.push("/food") }]
      );
    } catch (error) {
      console.error('Erro ao salvar alimento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o alimento');
    }
  }

  function addUnit() {
    setUnits([
      ...units,
      { id: Date.now().toString(), name: '', grams: 0 }
    ]);
  }

  function removeUnit(id: string) {
    if (units.length > 1) {
      setUnits(units.filter(unit => unit.id !== id));
    }
  }

  function updateUnit(id: string, field: keyof FormUnit, value: string) {
    setUnits(units.map(unit =>
      unit.id === id
        ? { ...unit, [field]: field === 'grams' ? Number(value) : value }
        : unit
    ));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {params.id ? 'Editar Alimento' : 'Novo Alimento'}
      </Text>

      <Text style={styles.sectionTitle}>Informações Básicas</Text>
      
      <Text style={styles.fieldLabel}>Nome do alimento</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Arroz branco, Batata doce..."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.fieldLabel}>Informação Nutricional</Text>
      <Text style={styles.fieldDescription}>
        Informe a quantidade de carboidratos em uma porção específica
      </Text>
      
      <View style={styles.carbInputRow}>
        <View style={styles.carbInputWrapper}>
          <Text style={styles.carbInputLabel}>Em</Text>
          <TextInput
            style={styles.carbInput}
            placeholder="100"
            value={portionSize}
            onChangeText={setPortionSize}
            keyboardType="decimal-pad"
          />
          <Text style={styles.carbInputLabel}>g/ml</Text>
        </View>
        
        <View style={styles.carbInputWrapper}>
          <Text style={styles.carbInputLabel}>tem</Text>
          <TextInput
            style={styles.carbInput}
            placeholder="28.5"
            value={carbsInPortion}
            onChangeText={setCarbsInPortion}
            keyboardType="decimal-pad"
          />
          <Text style={styles.carbInputLabel}>g de carb</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Unidades de Medida</Text>
      <Text style={styles.fieldDescription}>
        Defina as unidades de medida para este alimento (colher, xícara, unidade, etc.)
      </Text>
      
      <FlatList
        data={units}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.unitHeaderContainer}>
            <Text style={[styles.unitHeaderText, styles.nameHeaderText]}>Nome</Text>
            <Text style={[styles.unitHeaderText, styles.gramsHeaderText]}>Peso (g)</Text>
            <View style={styles.headerSpacer} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.unitContainer}>
            <TextInput
              style={[styles.unitInput, styles.nameInput]}
              placeholder="Nome da unidade"
              value={item.name}
              onChangeText={(value) => updateUnit(item.id, 'name', value)}
            />
            <TextInput
              style={[styles.unitInput, styles.gramsInput]}
              placeholder="Gramas"
              value={item.grams.toString()}
              onChangeText={(value) => updateUnit(item.id, 'grams', value)}
              keyboardType="numeric"
            />
            {units.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeUnit(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF9AA2" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={addUnit}
          >
            <Ionicons name="add-circle" size={32} color="#6B7FD7" />
          </TouchableOpacity>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.push("/food")}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F6FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2D3142',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#2D3142',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3142',
    marginBottom: 4,
    marginTop: 8,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#8B8FA8',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  unitHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8F5',
  },
  unitHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8FA8',
    textTransform: 'uppercase',
  },
  nameHeaderText: {
    flex: 2,
    marginRight: 8,
  },
  gramsHeaderText: {
    flex: 1,
    marginRight: 8,
  },
  headerSpacer: {
    width: 40,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F5',
    paddingHorizontal: 12,
    marginBottom: 8,
    color: '#2D3142',
    fontSize: 16,
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F5',
    paddingHorizontal: 12,
    color: '#2D3142',
    fontSize: 16,
  },
  nameInput: {
    flex: 2,
    marginRight: 8,
  },
  gramsInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    alignItems: 'center',
    padding: 16,
  },
  buttonContainer: {
    gap: 8,
    marginTop: 16,
  },
  carbInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  carbInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F5',
    paddingHorizontal: 12,
    height: 56,
  },
  carbInputLabel: {
    fontSize: 14,
    color: '#8B8FA8',
    marginHorizontal: 4,
  },
  carbInput: {
    flex: 1,
    fontSize: 18,
    color: '#2D3142',
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#6B7FD7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6B7FD7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B8FA8',
    fontSize: 18,
    fontWeight: '600',
  },
});
