# Barcode Scanner Feature

The barcode scanner is now fully integrated into "I Like This!"

## How It Works

1. **Go to Scanner Tab** → Click the "📱 Scanner" tab on the home page
2. **Start Scanning** → Click "Start Scanning" button to enable camera
3. **Point at Barcode** → Align a product barcode within the green frame
4. **Auto-Detection** → The app automatically detects and scans the barcode
5. **Product Details** → View product info from Open Food Facts API
6. **Like It** → Click the "❤️ Like" button to save to your profile

## Features

✅ **Real-time barcode detection** using ZXing.js library
✅ **Auto-lookup** from Open Food Facts API (free, open-source product database)
✅ **Product details** including:
  - Product name, brand, image
  - Nutrition facts (calories, protein, fat, carbs)
  - Ingredients list
  - Allergen warnings
  - Where to buy

✅ **Like/Unlike** products and save to Firestore
✅ **Camera permissions** - App requests camera access on first scan
✅ **Error handling** - Graceful error messages if product not found

## Open Food Facts API

This app uses the **free and open-source** Open Food Facts API to get product information. No API key needed!

- Database: https://world.openfoodfacts.org/
- API Docs: https://world.openfoodfacts.org/api/

The API has over 1 million products and supports various formats (EAN, UPC, QR codes).

## Files Added

- `src/components/BarcodeScanner.tsx` - Camera scanner component
- `src/components/ProductDetails.tsx` - Product details modal
- `src/services/productService.ts` - Open Food Facts API integration
- `src/services/firestoreService.ts` - Save/load products from database
- `src/types/index.ts` - TypeScript types for products, likes, reviews
- `src/styles/BarcodeScanner.css` - Scanner UI styles
- `src/styles/ProductDetails.css` - Product details modal styles

## What's Saved to Firestore

When you scan a product:
1. **Products Collection** - Product details are saved (name, brand, image, nutrition)
2. **Likes Collection** - Your "like" is recorded (user ID + product ID)
3. **Your Profile** - Shows which products you've liked

## Browser Compatibility

✅ Chrome/Edge (desktop & mobile)
✅ Firefox
✅ Safari (iOS 14+)
✅ Android browsers

Note: HTTPS required for camera access (or localhost for testing)

## Next Features

- 📊 **Feed** - See liked items from friends
- 💬 **Reviews** - Write and read reviews from community
- 👥 **Groups** - Share favorites with friend groups
- 🏪 **Retailers** - Show nearby stores selling the product

## Testing

Try scanning some common products:
- Food items (barcodes on packages)
- Drinks (cans, bottles)
- Any UPC/EAN barcode

Some barcodes might not be in Open Food Facts database (newer products or local brands). The app will handle this gracefully!

Happy scanning! 👍
