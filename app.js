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


// 🔐 SIGNUP
async function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const name = document.getElementById("signupName").value;
  const dob = document.getElementById("signupDob").value;
  const file = document.getElementById("signupPhoto").files[0];

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
}


// 🔑 LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    showDashboard(cred.user.uid);
  } catch (e) {
    alert(e.message);
  }
}


// 📊 DASHBOARD
async function showDashboard(uid) {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  const snap = await getDoc(doc(db, "users", uid));
  const user = snap.data();

  document.getElementById("userName").innerText = user.name;

  const age = calculateAge(user.dob);
  document.getElementById("userDob").innerText =
    `DOB: ${user.dob} (Age: ${age})`;

  document.getElementById("userPhoto").src = user.photoURL;

  // 🔥 FIXED QR GENERATION
  await generateQR(uid);
}


// 🔄 AUTO LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) showDashboard(user.uid);
});


// 🔁 TOGGLE LOGIN / SIGNUP
function toggle() {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  const signupVisible = signupForm.style.display !== "none";

  signupForm.style.display = signupVisible ? "none" : "block";
  loginForm.style.display = signupVisible ? "block" : "none";
}


// 🎯 EVENTS
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("toggleBtn").addEventListener("click", toggle);
