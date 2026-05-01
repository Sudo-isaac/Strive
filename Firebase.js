import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzK9Ke_4sz7eNLhhyNU3wvcq081talXCk",
  authDomain: "strive-2064d.firebaseapp.com",
  projectId: "strive-2064d",
  storageBucket: "strive-2064d.firebasestorage.app",
  messagingSenderId: "330294337971",
  appId: "1:330294337971:web:9dd532f012c2ec1c852bc6",
  measurementId: "G-J9Q0P2Y176"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
