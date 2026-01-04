// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAIBXEMnjTHgCjkq_1Bv8eDX9MQK9K9IA",
  authDomain: "rhayze-verifcation.firebaseapp.com",
  projectId: "rhayze-verifcation",
  storageBucket: "rhayze-verifcation.firebasestorage.app",
  messagingSenderId: "489321408574",
  appId: "1:489321408574:web:7e010cf7381efb0d0c096f",
  measurementId: "G-9ZYPMFM9FR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);