import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBYoU5h5wLeurUN89Qw7maJJAmcBbt9eMM",
  authDomain: "test-project-16837.firebaseapp.com",
  projectId: "test-project-16837",
  storageBucket: "test-project-16837.appspot.com",
  messagingSenderId: "971228299888",
  appId: "1:971228299888:web:e6f939f2f937e49c9beab5",
  measurementId: "G-1V8E4VQNFV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;

export const db = getDatabase(app);
