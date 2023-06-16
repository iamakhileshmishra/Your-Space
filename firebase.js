import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
