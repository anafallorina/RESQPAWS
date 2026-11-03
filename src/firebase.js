
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaSnwcR7whq42LBFOIVU00MpTuex5e0KM",
  authDomain: "resqpaws-56d44.firebaseapp.com",
  projectId: "resqpaws-56d44",
  storageBucket: "resqpaws-56d44.firebasestorage.app",
  messagingSenderId: "658922638045",
  appId: "1:658922638045:web:2f4d7482f3033c7a172934",
  measurementId: "G-L6VS6HMR3M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
