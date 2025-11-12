import { initDatabase } from "@/database/database";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await initDatabase();
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Erro ao inicializar o banco de dados');
    }
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6B7FD7" />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="foodForm" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8B8FA8",
  },
  errorText: {
    fontSize: 16,
    color: "#FF9AA2",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
