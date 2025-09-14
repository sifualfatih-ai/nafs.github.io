<!-- simpan sebagai: /guru/rpm/firebase.js -->
<script type="module">
  // Modul ES tidak boleh ada tag script saat disimpan sebagai file .js
</script>

// ===== firebase.js =====
// File ini berisi inisialisasi Firebase + ekspor auth & db
// Tempatkan di /guru/rpm/firebase.js (sefolder dengan index.html)

// 1) CONFIG Firebase (PUBLIC – aman ditaruh di client)
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  // (opsional) storageBucket, messagingSenderId, appId
};

// 2) Import SDK dari CDN (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 3) Inisialisasi & ekspor untuk dipakai di index.html
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
