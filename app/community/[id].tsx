import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  getCommunities,
  getItems,
  removeItemFromCommunity,
} from "../../src/storage/items";
import { ItemCard } from "../../src/components/ItemCard";
import { Item, Community } from "../../src/types";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const communities = await getCommunities();
        const found = communities.find((c) => c.id === id);
        setCommunity(found || null);

        if (found) {
          const allItems = await getItems();
          setItems(allItems.filter((i) => found.itemIds.includes(i.id)));
        }
      }
      load();
    }, [id])
  );

  const handleRemove = (item: Item) => {
    Alert.alert(
      "Remove from Community",
      `Remove "${item.name}" from this community?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (id) {
              await removeItemFromCommunity(item.id, id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
            }
          },
        },
      ]
    );
  };

  if (!community) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{community.name}</Text>
        {community.description !== "" && (
          <Text style={styles.description}>{community.description}</Text>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No items in this community yet. Add items from My List.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard item={item} onDelete={() => handleRemove(item)} />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/add-item")}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  description: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  loading: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
    fontSize: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    marginTop: -2,
  },
});
