import AsyncStorage from "@react-native-async-storage/async-storage";
import { Item, Community } from "../types";

const ITEMS_KEY = "ilikethis_items";
const COMMUNITIES_KEY = "ilikethis_communities";

export async function getItems(): Promise<Item[]> {
  const data = await AsyncStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveItem(item: Item): Promise<void> {
  const items = await getItems();
  items.unshift(item);
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function deleteItem(id: string): Promise<void> {
  const items = await getItems();
  await AsyncStorage.setItem(
    ITEMS_KEY,
    JSON.stringify(items.filter((i) => i.id !== id))
  );
}

export async function getCommunities(): Promise<Community[]> {
  const data = await AsyncStorage.getItem(COMMUNITIES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveCommunity(community: Community): Promise<void> {
  const communities = await getCommunities();
  communities.unshift(community);
  await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(communities));
}

export async function addItemToCommunity(
  itemId: string,
  communityId: string
): Promise<void> {
  const communities = await getCommunities();
  const community = communities.find((c) => c.id === communityId);
  if (community && !community.itemIds.includes(itemId)) {
    community.itemIds.push(itemId);
    await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(communities));
  }
}

export async function removeItemFromCommunity(
  itemId: string,
  communityId: string
): Promise<void> {
  const communities = await getCommunities();
  const community = communities.find((c) => c.id === communityId);
  if (community) {
    community.itemIds = community.itemIds.filter((id) => id !== itemId);
    await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(communities));
  }
}

export async function deleteCommunity(id: string): Promise<void> {
  const communities = await getCommunities();
  await AsyncStorage.setItem(
    COMMUNITIES_KEY,
    JSON.stringify(communities.filter((c) => c.id !== id))
  );
}
