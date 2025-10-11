import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface InsulinSettings {
  carbsPerInsulin: string;
  correctionFactor: string;
  insulinIncrement: string;
}

const SETTINGS_KEY = '@insulin_settings';

export default function Config() {
  const [carbsPerInsulin, setCarbsPerInsulin] = useState("");
  const [correctionFactor, setCorrectionFactor] = useState("");
  const [insulinIncrement, setInsulinIncrement] = useState("1");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settings) {
        const parsed: InsulinSettings = JSON.parse(settings);
        setCarbsPerInsulin(parsed.carbsPerInsulin);
        setCorrectionFactor(parsed.correctionFactor);
        setInsulinIncrement(parsed.insulinIncrement);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async function handleSave() {
    if (!carbsPerInsulin || !correctionFactor) {
      Alert.alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const settings: InsulinSettings = {
        carbsPerInsulin,
        correctionFactor,
        insulinIncrement
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      Alert.alert("Configurações salvas!", 
        `${carbsPerInsulin}g de carboidrato por 1U de insulina\n` +
        `Fator de correção: ${correctionFactor} mg/dL por 1U\n` +
        `Incremento de insulina: ${insulinIncrement}U`
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as configurações");
      console.error('Erro ao salvar configurações:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <Text style={styles.sectionTitle}>Cálculo de Insulina</Text>
      
      <Text style={styles.sectionSubtitle}>Proporção de Carboidratos por Insulina</Text>
      <Text style={styles.description}>Configure quantos gramas de carboidrato são cobertas por 1 unidade de insulina</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.carbsInput}
          placeholder="Ex: 15"
          value={carbsPerInsulin}
          onChangeText={setCarbsPerInsulin}
          keyboardType="numeric"
        />
        <Text style={styles.unitText}>g/U</Text>
      </View>

      <Text style={styles.sectionSubtitle}>Fator de Correção</Text>
      <Text style={styles.description}>Configure quantos mg/dL de glicemia são reduzidos por 1 unidade de insulina</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.carbsInput}
          placeholder="Ex: 40"
          value={correctionFactor}
          onChangeText={setCorrectionFactor}
          keyboardType="numeric"
        />
        <Text style={styles.unitText}>mg/dL</Text>
      </View>

      <Text style={styles.sectionSubtitle}>Incremento de Insulina</Text>
      <Text style={styles.description}>Escolha como a insulina será calculada</Text>
      <View style={styles.incrementButtons}>
        <Pressable
          onPress={() => setInsulinIncrement("0.5")}
          style={[
            styles.incrementButton,
            insulinIncrement === "0.5" && styles.incrementButtonSelected
          ]}
        >
          <Text style={[
            styles.incrementButtonText,
            insulinIncrement === "0.5" && styles.incrementButtonTextSelected
          ]}>
            Meio em meio unidade (0.5U)
          </Text>
        </Pressable>
        <View style={styles.buttonSpacer} />
        <Pressable
          onPress={() => setInsulinIncrement("1")}
          style={[
            styles.incrementButton,
            insulinIncrement === "1" && styles.incrementButtonSelected
          ]}
        >
          <Text style={[
            styles.incrementButtonText,
            insulinIncrement === "1" && styles.incrementButtonTextSelected
          ]}>
            Uma em uma unidade (1.0U)
          </Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Salvar" onPress={handleSave} color="lightgray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
    padding: 24,
    paddingTop: 40,
  },
  incrementButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  incrementButtonSelected: {
    borderColor: '#000',
    borderWidth: 2,
  },
  incrementButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  incrementButtonTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  sectionTitle: {
    width: '90%',
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 16,
    color: '#000',
  },
  input: {
    height: 50,
    width: '90%',
    borderRadius: 10,
    backgroundColor: 'lightgray',
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
  },
  inputLabel: {
    width: '90%',
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  sectionSubtitle: {
    width: '90%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
  },
  description: {
    width: '90%',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  inputContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  carbsInput: {
    height: 50,
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'lightgray',
    paddingHorizontal: 12,
    fontSize: 18,
    marginRight: 8,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 18,
    marginRight: 8,
    color: '#666',
    width: 40,
  },
  incrementButtons: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 8,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 24,
  },
});
