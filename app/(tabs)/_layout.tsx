import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { paddingBottom: 4, height: 56 },
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My List",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>{"<3"}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>{"@@"}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
