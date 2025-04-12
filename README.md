# React Chat App 💬

![App Screenshot](/chat-app.png)

A real-time chat application built with React and Firebase as a learning project to understand core React concepts like state management, hooks, and component architecture. Features authentication, messaging, and media sharing to demonstrate practical implementation of these concepts.

## Live Preview
https://react-chat-app-0vk7.onrender.com

## ✨ Features
- 🔐 Google Firebase Authentication
- 💬 Realtime Database for instant messaging
- 📁 Firebase Storage for file uploads
- 🎨 Responsive UI with custom themes
- 👤 User profile management

## 🛠️ Technology Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

## 🔥 Firebase Setup (Spark Plan)

This project uses Firebase's free Spark plan with:
- Authentication (Google)
- Realtime Database
- Cloud Storage

### Configuration
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication, Realtime Database and Storage
3. Copy your config from Firebase console to `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🚀 Installation

1. Clone the repository
```bash
git clone https://github.com/sahilsonvane/react-chat-app.git
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase configuration
```bash
cp .env.example .env
# Fill in your Firebase credentials
```

4. Run the development server
```bash
npm run dev
```


## 🤝 Contributing
Pull requests are welcome!

## 📜 License
MIT
