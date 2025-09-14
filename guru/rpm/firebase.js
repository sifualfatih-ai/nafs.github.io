// ===== firebase.js =====
// Simpan di: /guru/rpm/firebase.js
// File ini berisi inisialisasi Firebase + ekspor auth & db

// 1) CONFIG Firebase (PUBLIC – aman ditaruh di client)
export const firebaseConfig = {
apiKey: "AIzaSyDRroJEkBTlADbB7C504ltyy3pG6kpMK04",
  authDomain: "nafs-gen.firebaseapp.com",
  projectId: "nafs-gen",
  storageBucket: "nafs-gen.firebasestorage.app",
  messagingSenderId: "514651223524",
  appId: "1:514651223524:web:367229fb2c5ece794583f1",
  measurementId: "G-0948R8WGQG"
};

// 2) Import SDK dari CDN (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 3) Inisialisasi & ekspor untuk dipakai di index.html
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
