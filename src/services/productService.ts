import type { Product } from '../types';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

export interface OpenFoodFactsResponse {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    generic_name?: string;
    ingredients_text?: string;
    allergens?: string;
    nutriments?: {
      energy_kcal_100g?: number;
      protein_100g?: number;
      fat_100g?: number;
      carbohydrates_100g?: number;
    };
    stores?: string;
  };
  status: number;
}

export const searchProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);
    
    if (!response.ok) {
      console.error('Product not found:', response.status);
      return null;
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status === 0 || !data.product) {
      console.error('Product not found in database');
      return null;
    }

    const product: Product = {
      barcode,
      name: data.product.product_name || 'Unknown Product',
      brand: data.product.brands || 'Unknown Brand',
      imageUrl: data.product.image_url,
      description: data.product.generic_name,
      ingredients: data.product.ingredients_text,
      allergens: data.product.allergens,
      retailers: data.product.stores ? data.product.stores.split(',').map(s => s.trim()) : [],
      openFoodFactsId: data.code,
      nutritionFacts: {
        calories: data.product.nutriments?.energy_kcal_100g,
        protein: data.product.nutriments?.protein_100g,
        fat: data.product.nutriments?.fat_100g,
        carbs: data.product.nutriments?.carbohydrates_100g,
      },
      createdBy: '', // Will be set by the component
      createdAt: new Date(),
    };

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};
