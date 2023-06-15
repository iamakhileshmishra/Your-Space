import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "your-space-b84f6.firebaseapp.com",
  projectId: "your-space-b84f6",
  storageBucket: "your-space-b84f6.appspot.com",
  messagingSenderId: process.env.MSG_SENDER,
  appId: process.env.APP_ID,
  measurementId: process.env.M_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
