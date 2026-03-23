import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Item } from "../types";

interface Props {
  item: Item;
  onPress?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ item, onPress, onDelete }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {item.barcode ? "Barcode" : "No image"}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {item.barcode && (
          <Text style={styles.barcode} numberOfLines={1}>
            Barcode: {item.barcode}
          </Text>
        )}
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {onDelete && (
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>X</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  placeholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 11,
    color: "#999",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  barcode: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 4,
  },
  deleteBtn: {
    justifyContent: "center",
    paddingLeft: 12,
  },
  deleteText: {
    fontSize: 18,
    color: "#ff4444",
    fontWeight: "bold",
  },
});
