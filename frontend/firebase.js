// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
 authDomain: "rannaready-5c9b2.firebaseapp.com",
  projectId: "rannaready-5c9b2",
  storageBucket: "rannaready-5c9b2.firebasestorage.app",
  messagingSenderId: "541954535914",
  appId: "1:541954535914:web:12b5e6f3a064551dbf8293",
  measurementId: "G-3LJFTHFZF8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}