import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { saveItem, getCommunities, addItemToCommunity } from "../src/storage/items";
import { Community } from "../src/types";

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    barcode?: string;
    photoUri?: string;
  }>();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [barcode, setBarcode] = useState(params.barcode || "");
  const [photoUri, setPhotoUri] = useState(params.photoUri || "");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  useEffect(() => {
    getCommunities().then(setCommunities);
  }, []);

  useEffect(() => {
    if (params.barcode) setBarcode(params.barcode);
    if (params.photoUri) setPhotoUri(params.photoUri);
  }, [params.barcode, params.photoUri]);

  const toggleCommunity = (id: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name for this item.");
      return;
    }

    const item = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      barcode: barcode || undefined,
      photoUri: photoUri || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await saveItem(item);

    for (const communityId of selectedCommunities) {
      await addItemToCommunity(item.id, communityId);
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <Pressable
            style={styles.removePhoto}
            onPress={() => setPhotoUri("")}
          >
            <Text style={styles.removePhotoText}>Remove photo</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.captureButtons}>
          <Pressable
            style={styles.captureBtn}
            onPress={() => router.push("/camera")}
          >
            <Text style={styles.captureBtnIcon}>cam</Text>
            <Text style={styles.captureBtnText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={styles.captureBtn}
            onPress={() => router.push("/scanner")}
          >
            <Text style={styles.captureBtnIcon}>|||</Text>
            <Text style={styles.captureBtnText}>Scan Barcode</Text>
          </Pressable>
        </View>
      )}

      {barcode !== "" && (
        <View style={styles.barcodeDisplay}>
          <Text style={styles.barcodeLabel}>Barcode</Text>
          <Text style={styles.barcodeValue}>{barcode}</Text>
        </View>
      )}

      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="What is this item?"
        placeholderTextColor="#bbb"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this item..."
        placeholderTextColor="#bbb"
        multiline
        numberOfLines={3}
      />

      {communities.length > 0 && (
        <>
          <Text style={styles.label}>Add to Communities</Text>
          <View style={styles.communityList}>
            {communities.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.communityChip,
                  selectedCommunities.includes(c.id) &&
                    styles.communityChipSelected,
                ]}
                onPress={() => toggleCommunity(c.id)}
              >
                <Text
                  style={[
                    styles.communityChipText,
                    selectedCommunities.includes(c.id) &&
                      styles.communityChipTextSelected,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Item</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  captureButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  captureBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  captureBtnIcon: {
    fontSize: 24,
    color: "#007AFF",
    marginBottom: 8,
    fontWeight: "bold",
  },
  captureBtnText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    marginTop: 8,
  },
  removePhotoText: {
    color: "#ff4444",
    fontSize: 14,
  },
  barcodeDisplay: {
    backgroundColor: "#e8f4fd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  barcodeLabel: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  barcodeValue: {
    fontSize: 16,
    color: "#333",
    marginTop: 2,
    fontFamily: "monospace",
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  communityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  communityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  communityChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  communityChipText: {
    fontSize: 14,
    color: "#555",
  },
  communityChipTextSelected: {
    color: "#fff",
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
