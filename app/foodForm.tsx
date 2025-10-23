import { Unit, addFood, getFoodById, updateFood } from "@/services/mockFoodService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
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
    if (!name || !baseCarbs) {
      Alert.alert("Preencha os dados básicos do alimento!");
      return;
    }
    if (!units.every(unit => unit.name && unit.grams)) {
      Alert.alert("Preencha todas as unidades corretamente!");
      return;
    }
    const parsedBase = Number(baseCarbs);
    if (isNaN(parsedBase)) {
      Alert.alert('Preencha o campo de carboidratos com um número válido!');
      return;
    }

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

      <Text style={styles.fieldLabel}>Carboidratos por 100g</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 28.5"
        value={baseCarbs}
        onChangeText={setBaseCarbs}
        keyboardType="numeric"
      />

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
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={addUnit}
          >
            <Ionicons name="add-circle" size={32} color="#0288D1" />
          </TouchableOpacity>
        }
      />

      <View style={styles.buttonContainer}>
        <Button title="Salvar" onPress={handleSave} color="lightgray" />
        <Button
          title="Cancelar"
          onPress={() => router.push("/food")}
          color="lightgray"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  unitHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  unitHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
    width: 40, // Espaço para o botão de remover
  },
  input: {
    height: 40,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitInput: {
    height: 40,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 12,
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
});
