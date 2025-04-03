// Config and db with firestore database
// {
//   // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth"
// import {doc,getFirestore, setDoc} from "firebase/firestore"
// import {toast} from "react-toastify"

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBKr9iGG6PsTBciXwDacQphdoXIF549dEQ",
//   authDomain: "react-chat-app-80dff.firebaseapp.com",
//   projectId: "react-chat-app-80dff",
//   storageBucket: "react-chat-app-80dff.firebasestorage.app",
//   messagingSenderId: "914270535739",
//   appId: "1:914270535739:web:af4917f63f03136e0b9c1e"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app)
// const db = getFirestore(app)

// const signup = async (username, email, password)=>{
//   try {
//     const res = await createUserWithEmailAndPassword(auth,email,password)
//     const user = res.user;
//     await setDoc(doc(db,"users",user.uid),{
//       id:user.uid,
//       username: username.toLowerCase(),
//       email,
//       name:"",
//       awatar:"",
//       bio:"Hey, There i am using chat app",
//       lastSeen: Date.now()
//     })
//     await setDoc(doc(db,"chats",user.uid),{
//       chatData:[]
//     })
//   } catch (error) {
//     console.log(error)
//     toast.error(error.code.split('/')[1].split('-').join(" "))

//   }
// }

// const login = async(email, password)=>{
//   try {
//     await signInWithEmailAndPassword(auth, email,password)
//   } catch (error) {
//     console.error(error)
//     toast.error(error.code.split('/')[1].split('-').join(" "))
//   }
// }

// const logout = async ()=>{
//  try {
//    await signOut(auth)

//  } catch (error) {
//   console.error(error);

//   toast.error(error.code.split('/')[1].split('-').join(" "))

//  }
// }

// export {signup, login, logout, auth, db}
// }

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database"; // Realtime Database functions
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_API_KEY),
  authDomain: String(import.meta.env.VITE_AUTH_DOMAIN),
  databaseURL: String(import.meta.env.VITE_DATABASE_URL),
  projectId: String(import.meta.env.VITE_PROJECT_ID),
  storageBucket: String(import.meta.env.VITE_STORAGE_BUCKET),
  messagingSenderId: String(import.meta.env.VITE_MESSAGING_SENDER_ID),
  appId: String(import.meta.env.VITE_APP_ID),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Get Realtime Database instance

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Realtime Database: Use 'set' to create data at a specific path
    const userRef = ref(db, `users/${user.uid}`); // Path to user data
    await set(userRef, {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There i am using chat app",
      lastSeen: Date.now(),
    });

    // Create chat data (empty array)
    const chatRef = ref(db, `chats/${user.uid}`);
    await set(chatRef, {
      chatData: [],
    });
  } catch (error) {
    console.error(error);
    // toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return;
  }
  try {
    const userRef = ref(db, "users");
    const collection = await get(userRef);
    if (collection.exists()) {
      const allUsers = collection.val();
      const user = Object.values(allUsers).filter(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );
      
      if(user.length !== 0){
        await sendPasswordResetEmail(auth,email);
        toast.success("Reset Email Sent!")
      }else{
        toast.error("Email doesn't exists")
      }
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
    
  }
};
export { signup, login, logout, auth, db, resetPass };
