# Firebase Setup Guide for "I Like This!"

This guide will help you set up Firebase for the "I Like This!" application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `i-like-this` (or your preferred name)
4. Continue through the setup steps
5. Enable Google Analytics (optional but recommended)
6. Click "Create project"

## Step 2: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Google** - Click enable, select a support email, save
   - **GitHub** - Click enable, follow the instructions to:
     - Create a GitHub OAuth App at https://github.com/settings/developers
     - Add Firebase redirect URI: `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`
     - Copy Client ID and Client Secret back to Firebase

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (for development only)
   - Warning: This allows anyone to read/write. Update security rules before production!
4. Select a location (closest to your users)
5. Click "Create"

## Step 4: Get Your Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the `</>` icon to add a web app
4. Register app with nickname `i-like-this`
5. Copy the Firebase config object

## Step 5: Add Config to Your App

1. Create a `.env.local` file in the root of your project
2. Add your Firebase config:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

3. Update `src/config/firebase.ts` to use these environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

## Step 6: Configure Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{uid} {
      allow read: if request.auth.uid == uid || request.auth != null;
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid;
    }

    // Products collection
    match /products/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }

    // Reviews collection
    match /reviews/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Likes collection
    match /likes/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Groups collection
    match /groups/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

3. Click "Publish"

## Step 7: Start Developing

```bash
npm run dev
```

Visit `http://localhost:5173` and test the login flow!

## Step 8: Deploy to Firebase Hosting (Optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Troubleshooting

### Login not working?
- Ensure OAuth providers are enabled in Firebase Console
- Check that redirect URIs match your app URL
- Clear browser cache and try again

### Firestore not saving data?
- Check browser console for errors
- Verify security rules allow the operation
- Check user authentication status

### CORS errors?
- Firebase is set up to allow requests from anywhere in test mode
- For production, configure specific domains in Firebase Console

## Next Steps

1. Set up environment variables
2. Run `npm run dev`
3. Test Google/GitHub login
4. Start building features!

Need help? Check [Firebase Documentation](https://firebase.google.com/docs)
