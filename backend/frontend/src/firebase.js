import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJkY2t-SlLi24kIhcO8D2d4CvbNh1ATJc",
  authDomain: "crystallineaura-e5249.firebaseapp.com",
  projectId: "crystallineaura-e5249",
  storageBucket: "crystallineaura-e5249.firebasestorage.app",
  messagingSenderId: "523700843883",
  appId: "1:523700843883:web:57babe48d12fe15983482e",
  measurementId: "G-K4LVZEP1KL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
