// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIRE_API,
  authDomain: process.env.REACT_APP_FIRE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIRE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIRE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIRE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIRE_APPID,
  measurementId: process.env.REACT_APP_FIRE_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
