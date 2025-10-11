import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 70,
        },
        headerShown: false,
      }}
      initialRouteName="calc"
    >
      <Tabs.Screen
        name="food"
        options={{
          title: "Alimentos",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "fast-food" : "fast-food-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calc"
        options={{
          title: "Calcular",
          tabBarIcon: ({ focused, color }) => (
            <TabBarCircle focused={focused} />
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: "Configurações",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

import { View } from "react-native";
function TabBarCircle({ focused }: { focused: boolean }) {
  return (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: focused ? '#4FC3F7' : '#B3E5FC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: focused ? 3 : 0,
        borderColor: focused ? '#0288D1' : 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
      }}
    >
      <Ionicons
        name={focused ? "calculator" : "calculator-outline"}
        color={focused ? 'white' : '#0288D1'}
        size={32}
      />
    </View>
  );
}
