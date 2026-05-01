import { auth, db, storage } from "./firebase.js";
import { calculateAge, generateQR } from "./utils.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

// SIGNUP
window.signup = async () => {
  const email = signupEmail.value;
  const password = signupPassword.value;
  const name = signupName.value;
  const dob = signupDob.value;
  const file = signupPhoto.files[0];

  if (!file) return alert("Upload a photo");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    const storageRef = ref(storage, "users/" + user.uid);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);

    await setDoc(doc(db, "users", user.uid), {
      name,
      dob,
      photoURL
    });

    showDashboard(user.uid);

  } catch (e) {
    alert(e.message);
  }
};

// LOGIN
window.login = async () => {
  try {
    const cred = await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    showDashboard(cred.user.uid);
  } catch (e) {
    alert(e.message);
  }
};

// DASHBOARD
async function showDashboard(uid) {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  const snap = await getDoc(doc(db, "users", uid));
  const user = snap.data();

  document.getElementById("userName").innerText = user.name;
  document.getElementById("userDob").innerText = "DOB: " + user.dob;
  document.getElementById("userPhoto").src = user.photoURL;

  // QR (UID only 🔥)
  document.getElementById("qr").src = generateQR(uid);
}

// AUTO LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) showDashboard(user.uid);
});

// TOGGLE
window.toggle = () => {
  signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
};
