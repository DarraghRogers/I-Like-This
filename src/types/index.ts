export interface Product {
  id?: string;
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  description?: string;
  ingredients?: string;
  allergens?: string;
  nutritionFacts?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  retailers?: string[];
  openFoodFactsId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Like {
  id?: string;
  userId: string;
  productId: string;
  likedAt: Date;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Group {
  id?: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdByPhoto?: string;
  members: string[];
  inviteCode: string;
  createdAt: Date;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
}

export interface GroupPost {
  id?: string;
  groupId: string;
  productId: string;
  postedBy: string;
  postedByName: string;
  postedByPhoto?: string;
  comment?: string;
  createdAt: Date;
}
