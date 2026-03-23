import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-item"
          options={{
            title: "Add Item",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: "Camera",
            presentation: "fullScreenModal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="scanner"
          options={{
            title: "Scan Barcode",
            presentation: "fullScreenModal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-community"
          options={{
            title: "New Community",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="community/[id]"
          options={{
            title: "Community",
          }}
        />
      </Stack>
    </>
  );
}
