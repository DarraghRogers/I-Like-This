import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

async function getAllTokens(excludeUserId?: string): Promise<string[]> {
  const snapshot = await db.collection("fcmTokens").get();
  const tokens: string[] = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.token && data.userId !== excludeUserId) {
      tokens.push(data.token);
    }
  });
  return tokens;
}

async function getTokensForUsers(userIds: string[], excludeUserId?: string): Promise<string[]> {
  const snapshot = await db.collection("fcmTokens").get();
  const tokens: string[] = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.token && userIds.includes(data.userId) && data.userId !== excludeUserId) {
      tokens.push(data.token);
    }
  });
  return tokens;
}

async function sendToTokens(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (tokens.length === 0) return;

  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const response = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: data || {},
      webpush: {
        fcmOptions: { link: "/" },
      },
    });

    // Clean up invalid tokens
    response.responses.forEach((resp, idx) => {
      if (resp.error) {
        const code = resp.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          db.collection("fcmTokens")
            .where("token", "==", batch[idx])
            .get()
            .then((snap) => snap.docs.forEach((d) => d.ref.delete()));
        }
      }
    });
  }
}

// --- Triggers ---

// New product scanned and saved
export const onNewProduct = onDocumentCreated("products/{productId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const productName = data.name || "Unknown product";
  const createdBy = data.createdBy;

  const tokens = await getAllTokens(createdBy);
  await sendToTokens(
    tokens,
    "New Product Discovered!",
    `Someone just added "${productName}" — check it out!`,
    { type: "new_product", productId: event.params.productId }
  );
});

// New review posted
export const onNewReview = onDocumentCreated("reviews/{reviewId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const productId = data.productId;
  const reviewerName = data.userName || "Someone";
  const reviewerId = data.userId;
  const rating = data.rating || 0;

  // Get the product name
  const productDoc = await db.collection("products").doc(productId).get();
  const productName = productDoc.data()?.name || "a product";

  // Notify everyone who liked this product
  const likesSnap = await db.collection("likes").where("productId", "==", productId).get();
  const likerIds = likesSnap.docs.map((d) => d.data().userId).filter((id: string) => id !== reviewerId);

  // Also notify the product creator
  const createdBy = productDoc.data()?.createdBy;
  if (createdBy && createdBy !== reviewerId && !likerIds.includes(createdBy)) {
    likerIds.push(createdBy);
  }

  const tokens = await getTokensForUsers(likerIds, reviewerId);
  await sendToTokens(
    tokens,
    "New Review",
    `${reviewerName} rated "${productName}" ${"★".repeat(rating)}`,
    { type: "new_review", productId }
  );
});

// New like on a product
export const onNewLike = onDocumentCreated("likes/{likeId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const productId = data.productId;
  const likerId = data.userId;

  // Get the product and notify the creator
  const productDoc = await db.collection("products").doc(productId).get();
  const productData = productDoc.data();
  if (!productData) return;

  const productName = productData.name || "your product";
  const createdBy = productData.createdBy;

  if (!createdBy || createdBy === likerId) return;

  const tokens = await getTokensForUsers([createdBy], likerId);
  await sendToTokens(
    tokens,
    "Someone Likes Your Product!",
    `Your product "${productName}" just got a new like 👍`,
    { type: "new_like", productId }
  );
});

// New post shared to a group
export const onNewGroupPost = onDocumentCreated("groupPosts/{postId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const groupId = data.groupId;
  const posterId = data.postedBy;
  const posterName = data.postedByName || "Someone";

  // Get the group to find members
  const groupDoc = await db.collection("groups").doc(groupId).get();
  const groupData = groupDoc.data();
  if (!groupData) return;

  const groupName = groupData.name || "a group";
  const memberIds: string[] = groupData.members || [];

  // Get the product name
  const productDoc = await db.collection("products").doc(data.productId).get();
  const productName = productDoc.data()?.name || "a product";

  const tokens = await getTokensForUsers(memberIds, posterId);
  await sendToTokens(
    tokens,
    `New in ${groupName}`,
    `${posterName} shared "${productName}"`,
    { type: "new_group_post", groupId }
  );
});
