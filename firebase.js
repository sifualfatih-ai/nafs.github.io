// /firebase.js (unified, conditional by path)
// This module chooses Firebase project by current path:
// - /guru/rpm/*  -> NafsAppStudio (teachers tools)
// - others       -> nafs-gen (premium studio)

const CFG_NAFS_GEN = {
  apiKey: "AIzaSyDRroJEkBTlADbB7C504ltyy3pG6kpMK04",
  authDomain: "nafs-gen.firebaseapp.com",
  projectId: "nafs-gen",
  storageBucket: "nafs-gen.appspot.com",
  messagingSenderId: "514651223524",
  appId: "1:514651223524:web:367229fb2c5ece794583f1",
  measurementId: "G-0948R8WGQG"
};

// TODO: paste real public config for NafsAppStudio below
const CFG_NAFS_APP = (window.__FIREBASE_NAFS_APP__ /* optional override */) || {
  apiKey: "PASTE_NAFSAPP_apiKey",
  authDomain: "PASTE_NAFSAPP_authDomain",
  projectId: "NafsAppStudio",
  storageBucket: "PASTE_NAFSAPP_bucket",
  messagingSenderId: "PASTE_NAFSAPP_sender",
  appId: "PASTE_NAFSAPP_appId",
};

const isGuruRpm = location.pathname.startsWith('/guru/rpm');

const firebaseConfig = isGuruRpm ? CFG_NAFS_APP : CFG_NAFS_GEN;

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = (getApps().length ? getApps()[0] : initializeApp(firebaseConfig));
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
