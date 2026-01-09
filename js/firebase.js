import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCx3hx9kuenBtdN1KBJJnPwc2H9BjH2SZI",
  authDomain: "my-account-book-b4635.firebaseapp.com",
  projectId: "my-account-book-b4635",
  storageBucket: "my-account-book-b4635.firebasestorage.app",
  messagingSenderId: "1044755389880",
  appId: "1:1044755389880:web:50dfe83f8ad363988b834d"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
