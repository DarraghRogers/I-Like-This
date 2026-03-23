import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { saveCommunity } from "../src/storage/items";

export default function AddCommunityScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name for this community.");
      return;
    }

    await saveCommunity({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      description: description.trim(),
      itemIds: [],
      createdAt: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Community Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Best Coffee Shops"
        placeholderTextColor="#bbb"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.descInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="What is this community about?"
        placeholderTextColor="#bbb"
        multiline
        numberOfLines={3}
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Create Community</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  descInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
