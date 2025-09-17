// /firebase.js (unified, pilih project berdasar path)
const CFG_NAFS_GEN = {
  apiKey: "xx",
  authDomain: "nafs-gen.firebaseapp.com",
  projectId: "nafs-gen",
  storageBucket: "nafs-gen.appspot.com",
  messagingSenderId: "514651223524",
  appId: "1:514651223524:web:367229fb2c5ece794583f1",
  measurementId: "G-0948R8WGQG",
};
const CFG_NAFS_APP = {
  apiKey: "xxx",
  authDomain: "nafsappstudio.firebaseapp.com",
  projectId: "nafsappstudio",
  storageBucket: "nafsappstudio.firebasestorage.app",
  messagingSenderId: "3195732092",
  appId: "1:3195732092:web:65dd39633572221a7d49f9",
  measurementId: "G-H304CL19EF",
};

const isGuruRpm = location.pathname.startsWith('/guru/rpm');
const firebaseConfig = isGuruRpm ? CFG_NAFS_APP : CFG_NAFS_GEN;

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }                 from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }            from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app  = (getApps().length ? getApps()[0] : initializeApp(firebaseConfig));
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Helper supaya bisa ambil ID token dari mana pun
export async function getIdToken() {
  const u = auth.currentUser;
  return u ? await u.getIdToken() : null;
}
export default app;
