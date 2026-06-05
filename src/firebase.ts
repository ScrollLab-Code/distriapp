import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBjacnEianuv8TksSSX0AYBfzTZ1w6omto",
  authDomain: "distriapp-66008.firebaseapp.com",
  projectId: "distriapp-66008",
  storageBucket: "distriapp-66008.firebasestorage.app",
  messagingSenderId: "298421325622",
  appId: "1:298421325622:web:4058aa63028395b7fd2d97",
  measurementId: "G-CNECQJ17HV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };