import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getCommunities, deleteCommunity } from "../../src/storage/items";
import { Community } from "../../src/types";

export default function CommunitiesScreen() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCommunities().then(setCommunities);
    }, [])
  );

  const handleDelete = (community: Community) => {
    Alert.alert(
      "Delete Community",
      `Remove "${community.name}" and all its items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCommunity(community.id);
            setCommunities((prev) =>
              prev.filter((c) => c.id !== community.id)
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {communities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No communities yet</Text>
          <Text style={styles.emptyText}>
            Create a community to group and share items with others.
          </Text>
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/community/${item.id}`)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.count}>
                  {item.itemIds.length} item{item.itemIds.length !== 1 && "s"}
                </Text>
              </View>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteText}>X</Text>
              </Pressable>
            </Pressable>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/add-community")}
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  count: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 6,
    fontWeight: "500",
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
