// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrKXebI0XNmIcfdTRFsMOQfOBgrFVTIoU",
  authDomain: "studystack-16652.firebaseapp.com",
  projectId: "studystack-16652",
  storageBucket: "studystack-16652.firebasestorage.app",
  messagingSenderId: "816283107962",
  appId: "1:816283107962:web:6fb2eb30cd7f8e807e71c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);