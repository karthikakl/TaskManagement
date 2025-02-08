import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfSb513cBMpE3sR86HEo2YUJRRPNo1k60",
  authDomain: "olx-clone-80190.firebaseapp.com",
  projectId: "olx-clone-80190",
  storageBucket: "olx-clone-80190.appspot.com",
  messagingSenderId: "699369808914",
  appId: "1:699369808914:web:6a48c4799828090b7da4cb",
  measurementId: "G-0GHL9FR8GN"
};


const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
const db=getFirestore(app)
const storage=getStorage(app)

export {app,auth,db,storage}