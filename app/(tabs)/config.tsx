import { getInsulinSettings, saveInsulinSettings } from "@/services/settingsService";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Config() {
  const [carbsPerInsulin, setCarbsPerInsulin] = useState("");
  const [correctionFactor, setCorrectionFactor] = useState("");
  const [insulinIncrement, setInsulinIncrement] = useState("1");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getInsulinSettings();
      setCarbsPerInsulin(settings.carbsPerInsulin.toString());
      setCorrectionFactor(settings.correctionFactor.toString());
      setInsulinIncrement(settings.insulinIncrement.toString());
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
      await saveInsulinSettings({
        carbsPerInsulin: Number(carbsPerInsulin),
        correctionFactor: Number(correctionFactor),
        insulinIncrement: Number(insulinIncrement)
      });

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

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 24,
    paddingTop: 40,
  },
  incrementButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8F5',
  },
  incrementButtonSelected: {
    borderColor: '#6B7FD7',
    backgroundColor: '#F0F2FF',
  },
  incrementButtonText: {
    color: '#8B8FA8',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  incrementButtonTextSelected: {
    color: '#6B7FD7',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: '#2D3142',
  },
  sectionTitle: {
    width: '90%',
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 16,
    color: '#2D3142',
  },
  input: {
    height: 50,
    width: '90%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8F5',
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    color: '#2D3142',
  },
  inputLabel: {
    width: '90%',
    fontSize: 16,
    marginBottom: 8,
    color: '#2D3142',
  },
  sectionSubtitle: {
    width: '90%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3142',
    marginTop: 24,
  },
  description: {
    width: '90%',
    fontSize: 14,
    color: '#8B8FA8',
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8F5',
    paddingHorizontal: 12,
    fontSize: 18,
    marginRight: 8,
    textAlign: 'center',
    color: '#2D3142',
  },
  unitText: {
    fontSize: 18,
    marginRight: 8,
    color: '#8B8FA8',
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
  saveButton: {
    width: '90%',
    height: 56,
    backgroundColor: '#6B7FD7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
});
