
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfamFPdwerB7DYAV-ApkJ_vcxw7DTwAU8",
  authDomain: "docreserva-booking.firebaseapp.com",
  projectId: "docreserva-booking",
  storageBucket: "docreserva-booking.firebasestorage.app",
  messagingSenderId: "186431569165",
  appId: "1:186431569165:web:f13a8a8ffb9f0712728444",
  measurementId: "G-MQQ7V7VSVE"
};


export const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth