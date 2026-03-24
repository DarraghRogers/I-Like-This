import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product, Group, GroupMember, GroupPost } from '../types';

// Helper to remove undefined fields (Firestore doesn't accept undefined)
const sanitizeProduct = (product: Product) => {
  const sanitized: any = {};
  Object.entries(product).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'nutritionFacts' && value) {
        sanitized[key] = Object.fromEntries(
          Object.entries(value).filter(([_, v]) => v !== undefined)
        );
      } else if (Array.isArray(value)) {
        sanitized[key] = value.filter(v => v !== undefined);
      } else {
        sanitized[key] = value;
      }
    }
  });
  return sanitized;
};

// Products
export const saveProduct = async (product: Product): Promise<string> => {
  try {
    const sanitized = sanitizeProduct(product);
    const docRef = await addDoc(collection(db, 'products'), {
      ...sanitized,
      createdAt: Timestamp.fromDate(product.createdAt),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const q = query(collection(db, 'products'), where('barcode', '==', barcode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Product;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

// Likes
export const likeProduct = async (userId: string, productId: string): Promise<void> => {
  try {
    const likeId = `${userId}_${productId}`;
    const docRef = doc(db, 'likes', likeId);
    await setDoc(docRef, {
      userId,
      productId,
      likedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error liking product:', error);
    throw error;
  }
};

export const unlikeProduct = async (userId: string, productId: string): Promise<void> => {
  try {
    const likeId = `${userId}_${productId}`;
    await deleteDoc(doc(db, 'likes', likeId));
  } catch (error) {
    console.error('Error unliking product:', error);
    throw error;
  }
};

export const isProductLikedByUser = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const docSnap = await getDocs(query(collection(db, 'likes'), where('userId', '==', userId), where('productId', '==', productId)));
    return !docSnap.empty;
  } catch (error) {
    console.error('Error checking if product is liked:', error);
    return false;
  }
};

export const getUserLikedProducts = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'likes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().productId);
  } catch (error) {
    console.error('Error getting user liked products:', error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Product;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
};

export const getUserLikedProductsWithDetails = async (userId: string): Promise<Product[]> => {
  try {
    const productIds = await getUserLikedProducts(userId);
    const products = await Promise.all(
      productIds.map(id => getProductById(id))
    );
    return products.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error('Error getting user liked products with details:', error);
    return [];
  }
};
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export const saveReview = async (
  productId: string,
  userId: string,
  userName: string,
  userPhotoUrl: string | undefined,
  rating: number,
  comment: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      productId,
      userId,
      userName,
      userPhotoUrl,
      rating,
      comment,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        userPhotoUrl: data.userPhotoUrl,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    return [];
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Discover

export const getRecentProducts = async (count: number = 12): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate() || new Date(),
    } as Product));
  } catch (error) {
    console.error('Error getting recent products:', error);
    return [];
  }
};

export interface ProductWithStats extends Product {
  likeCount: number;
  avgRating: number;
  reviewCount: number;
}

export const getProductsWithStats = async (): Promise<ProductWithStats[]> => {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    const likesSnap = await getDocs(collection(db, 'likes'));
    const reviewsSnap = await getDocs(collection(db, 'reviews'));

    const likeCounts = new Map<string, number>();
    likesSnap.docs.forEach(d => {
      const pid = d.data().productId;
      likeCounts.set(pid, (likeCounts.get(pid) || 0) + 1);
    });

    const ratingData = new Map<string, { total: number; count: number }>();
    reviewsSnap.docs.forEach(d => {
      const pid = d.data().productId;
      const rating = d.data().rating || 0;
      const existing = ratingData.get(pid) || { total: 0, count: 0 };
      ratingData.set(pid, { total: existing.total + rating, count: existing.count + 1 });
    });

    return productsSnap.docs.map(d => {
      const data = d.data();
      const rating = ratingData.get(d.id);
      return {
        ...data,
        id: d.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        likeCount: likeCounts.get(d.id) || 0,
        avgRating: rating ? Math.round((rating.total / rating.count) * 10) / 10 : 0,
        reviewCount: rating?.count || 0,
      } as ProductWithStats;
    });
  } catch (error) {
    console.error('Error getting products with stats:', error);
    return [];
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const term = searchTerm.toLowerCase();
    return snapshot.docs
      .map(d => ({
        ...d.data(),
        id: d.id,
        createdAt: d.data().createdAt?.toDate() || new Date(),
      } as Product))
      .filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.barcode.includes(term)
      );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Groups

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createGroup = async (
  name: string,
  description: string,
  userId: string,
  userName: string,
  userPhoto?: string
): Promise<Group> => {
  try {
    let inviteCode = generateInviteCode();

    const existing = await getDocs(
      query(collection(db, 'groups'), where('inviteCode', '==', inviteCode))
    );
    if (!existing.empty) {
      inviteCode = generateInviteCode();
    }

    const groupData = {
      name,
      description,
      createdBy: userId,
      createdByName: userName,
      createdByPhoto: userPhoto || null,
      members: [userId],
      inviteCode,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    return {
      ...groupData,
      id: docRef.id,
      createdByPhoto: userPhoto,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Group;
    });
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'groups', groupId));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Group;
  } catch (error) {
    console.error('Error getting group:', error);
    return null;
  }
};

export const joinGroupByInviteCode = async (
  inviteCode: string,
  userId: string
): Promise<Group> => {
  const q = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode.toUpperCase().trim())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('No group found with that invite code');
  }

  const groupDoc = snapshot.docs[0];
  const data = groupDoc.data();
  const members: string[] = data.members || [];

  if (members.includes(userId)) {
    throw new Error('You are already a member of this group');
  }

  const updatedMembers = [...members, userId];
  await setDoc(groupDoc.ref, { members: updatedMembers }, { merge: true });

  return {
    ...data,
    id: groupDoc.id,
    members: updatedMembers,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Group;
};

export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) throw new Error('Group not found');

    const data = groupDoc.data();
    const members: string[] = data.members || [];
    const updatedMembers = members.filter(m => m !== userId);

    if (updatedMembers.length === 0) {
      await deleteDoc(doc(db, 'groups', groupId));
    } else {
      await setDoc(doc(db, 'groups', groupId), { members: updatedMembers }, { merge: true });
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    await deleteAllGroupPosts(groupId);
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const getGroupMembers = async (memberIds: string[]): Promise<GroupMember[]> => {
  try {
    const members = await Promise.all(
      memberIds.map(async (uid) => {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (!docSnap.exists()) {
          return { uid, displayName: 'Unknown User', email: '' };
        }
        const data = docSnap.data();
        return {
          uid,
          displayName: data.displayName || 'User',
          photoURL: data.photoURL,
          email: data.email || '',
        } as GroupMember;
      })
    );
    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

// Group Posts

export interface GroupPostWithProduct extends GroupPost {
  product: Product;
}

export const shareProductToGroup = async (
  groupId: string,
  productId: string,
  userId: string,
  userName: string,
  userPhoto?: string,
  comment?: string
): Promise<GroupPost> => {
  try {
    const existing = await getDocs(
      query(
        collection(db, 'groupPosts'),
        where('groupId', '==', groupId),
        where('productId', '==', productId),
        where('postedBy', '==', userId)
      )
    );
    if (!existing.empty) {
      throw new Error('You have already shared this product in this group');
    }

    const postData = {
      groupId,
      productId,
      postedBy: userId,
      postedByName: userName,
      postedByPhoto: userPhoto || null,
      comment: comment || null,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'groupPosts'), postData);
    return {
      ...postData,
      id: docRef.id,
      postedByPhoto: userPhoto,
      comment: comment,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error sharing product to group:', error);
    throw error;
  }
};

export const getGroupPosts = async (groupId: string): Promise<GroupPostWithProduct[]> => {
  try {
    const q = query(
      collection(db, 'groupPosts'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const posts: GroupPostWithProduct[] = [];
    for (const d of snapshot.docs) {
      const data = d.data();
      const product = await getProductById(data.productId);
      if (product) {
        posts.push({
          id: d.id,
          groupId: data.groupId,
          productId: data.productId,
          postedBy: data.postedBy,
          postedByName: data.postedByName,
          postedByPhoto: data.postedByPhoto || undefined,
          comment: data.comment || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          product,
        });
      }
    }
    return posts;
  } catch (error) {
    console.error('Error getting group posts:', error);
    return [];
  }
};

export const removeGroupPost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'groupPosts', postId));
  } catch (error) {
    console.error('Error removing group post:', error);
    throw error;
  }
};

export const deleteAllGroupPosts = async (groupId: string): Promise<void> => {
  try {
    const q = query(collection(db, 'groupPosts'), where('groupId', '==', groupId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
  } catch (error) {
    console.error('Error deleting group posts:', error);
  }
};
