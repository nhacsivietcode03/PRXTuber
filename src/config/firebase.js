import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay thế bằng cấu hình thực tế từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCLYgxvKLiAoF2Z8U5T5tpxecza9_8LF0M",
  authDomain: "prxtuber-14f76.firebaseapp.com",
  projectId: "prxtuber-14f76",
  storageBucket: "prxtuber-14f76.firebasestorage.app",
  messagingSenderId: "1062363191284",
  appId: "1:1062363191284:web:81c10434ccebcc9ec74ba1",
  measurementId: "G-JHHBXX7R63"
};

// Khởi tạo Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Auth (sử dụng AsyncStorage cho React Native)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Khởi tạo Firestore
const db = getFirestore(app);

export { app, auth, db };
