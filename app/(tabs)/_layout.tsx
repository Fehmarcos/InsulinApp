import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6B7FD7",
        tabBarInactiveTintColor: "#B8B8D1",
        tabBarStyle: {
          height: 80,
          paddingBottom: 15,
          paddingTop: 5,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E8E8F5",
          elevation: 8,
          shadowColor: "#6B7FD7",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
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
        backgroundColor: focused ? '#6B7FD7' : '#E8E8F5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: focused ? 3 : 0,
        borderColor: focused ? '#B8B8D1' : 'transparent',
        shadowColor: '#6B7FD7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      <Ionicons
        name={focused ? "calculator" : "calculator-outline"}
        color={focused ? 'white' : '#6B7FD7'}
        size={32}
      />
    </View>
  );
}
