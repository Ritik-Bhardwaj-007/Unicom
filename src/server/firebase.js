import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = "Add Your Configurations";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
