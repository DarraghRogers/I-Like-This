# I Like This! 👍

A community-driven application for sharing and discovering products you love. Users can scan barcodes, view product details, read reviews, and connect with friends through groups and communities.

## Features

- ✅ **Single Sign-On (SSO)** - Login with Google or GitHub
- ✅ **Barcode Scanning** - Scan product barcodes using your device camera
- ✅ **Product Discovery** - Browse detailed product information from Open Food Facts
- ✅ **Community Reviews** - Read and write reviews on products
- ✅ **Groups & Communities** - Create and join groups with friends
- ✅ **Like Tracking** - Keep track of items you love

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Authentication:** Firebase Auth with Google & GitHub SSO
- **Product Data:** Open Food Facts API
- **Barcode Scanning:** ZXing.js
- **State Management:** Zustand
- **Routing:** React Router v6

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.tsx
├── config/             # Configuration files
│   ├── firebase.ts     # Firebase initialization
│   └── auth.ts         # Authentication logic
├── pages/              # Page components
│   ├── LoginPage.tsx
│   └── HomePage.tsx
├── stores/             # Zustand state management
│   └── authStore.ts
├── styles/             # CSS stylesheets
│   ├── LoginPage.css
│   └── HomePage.css
├── App.tsx             # Main app component
├── App.css
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project with authentication enabled

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Google and GitHub authentication
   - Copy your Firebase config and create a `.env.local` file:
     ```
     VITE_FIREBASE_API_KEY=YOUR_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID=YOUR_APP_ID
     ```

3. **Update Firebase config:**
   - Edit `src/config/firebase.ts` to use environment variables or paste your config directly

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env.local` file in the root directory with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firestore Database Structure

### Collections

**users/**
- `uid` (document ID)
- `email`: string
- `displayName`: string
- `photoURL`: string (optional)
- `createdAt`: timestamp
- `bio`: string (optional)
- `groups`: array of group IDs

**products/**
- `barcode`: string (unique identifier)
- `name`: string
- `brand`: string
- `description`: string
- `imageUrl`: string
- `retailer`: array of strings
- `createdBy`: uid
- `createdAt`: timestamp

**reviews/**
- `productId`: reference
- `userId`: reference
- `rating`: number (1-5)
- `comment`: string
- `createdAt`: timestamp

**likes/**
- `userId`: uid
- `productId`: reference
- `likedAt`: timestamp

**groups/**
- `groupId` (document ID)
- `name`: string
- `description`: string
- `createdBy`: uid
- `members`: array of uids
- `createdAt`: timestamp

## Next Steps

1. **Barcode Scanner Component** - Implement camera-based barcode scanning
2. **Product Details Page** - Display product info from Open Food Facts API
3. **Review System** - Build review submission and display
4. **Group Management** - Create/join groups with friends
5. **Shopping Locations** - Integrate retail location data
6. **Mobile Optimization** - Improve mobile UI/UX

## Cost Estimation

- **Firebase Hosting:** Free (generous free tier)
- **Firestore:** ~$1/month (for small user base)
- **Cloud Storage:** Free (minimal media storage)
- **Total:** ~$0-5/month for up to 20 users

## Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Running Locally

### Starting the Development Server

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Create `.env.local` file** with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Navigate to `http://localhost:5173`
   - The app will auto-reload when you make changes (HMR)

### Additional Dev Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint the code
npm run lint
```

## Deploying to Production

### Prerequisites

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase (opens browser):
   ```bash
   firebase login
   ```

### Step-by-Step Deployment

1. **Initialize Firebase Hosting** (only first time):
   ```bash
   firebase init hosting
   ```
   When prompted:
   - Select your project: `i-like-this-32a33`
   - Public directory: `dist`
   - Single-page app: `y` (yes)
   - Automatic builds: `n` (no)

2. **Build the project**:
   ```bash
   npm run build
   ```
   This creates an optimized `dist` folder

3. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```
   This uploads your app to Firebase Hosting

4. **View your live app**:
   - URL: `https://i-like-this-32a33.web.app`
   - Also available at: `https://i-like-this-32a33.firebaseapp.com`

### After Deployment

1. **Update Authorized Domains** in Firebase Console:
   - Go to **Authentication** → **Settings**
   - Scroll to **Authorized domains**
   - Verify your Firebase hosting URL is listed

2. **Verify in production**:
   - Test Google/GitHub login
   - Test barcode scanner
   - Check that data saves to Firestore

### Deployment Checklist

- [ ] `.env.local` file is created with Firebase credentials
- [ ] `npm run build` completes without errors
- [ ] Firebase CLI is installed and logged in
- [ ] `firebase deploy` succeeds
- [ ] Can access live URL in browser
- [ ] SSO login works in production
- [ ] Barcode scanner works (camera permission)
- [ ] Data persists in Firestore

### Deploying Updates

After making changes:
```bash
npm run build
firebase deploy
```

That's it! Firebase will update your production app within seconds.

## Contributing

This is a personal project for friends. For suggestions or issues, please contact the project owner.

## License

MIT

## Support

For Firebase setup help: [Firebase Documentation](https://firebase.google.com/docs)
For Open Food Facts API: [API Documentation](https://world.openfoodfacts.org/api)
For development issues: Check the browser console (F12) for error messages
