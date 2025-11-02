import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBECQksrlWkWOTP4jriMmA9thfcKgbHyuE",
  authDomain: "codrcrew.firebaseapp.com",
  databaseURL: "https://codrcrew.firebaseio.com",
  projectId: "codrcrew",
  storageBucket: "codrcrew.appspot.com",
  messagingSenderId: "517463115484",
  appId: "1:517463115484:web:93ce55f61c78b015371619",
  measurementId: "G-Z9TTWE5FSJ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
