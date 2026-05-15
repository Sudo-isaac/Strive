import { auth, db, storage } from "./firebase.js";
import { calculateAge, generateQR } from "./utils.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ─── SIGNUP ───────────────────────────────────────────────
async function signup() {
  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const name     = document.getElementById("signupName").value.trim();
  const dob      = document.getElementById("signupDob").value;
  const file     = document.getElementById("signupPhoto").files[0];

  if (!email || !password || !name || !dob) return alert("Please fill in all fields.");
  if (!file) return alert("Please upload a profile photo.");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;

    const storageRef = ref(storage, "users/" + uid);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);

    await setDoc(doc(db, "users", uid), { name, dob, photoURL });
    showDashboard(uid);
  } catch (e) {
    alert("Signup failed: " + e.message);
  }
}

// ─── LOGIN ────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) return alert("Please enter your email and password.");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    showDashboard(cred.user.uid);
  } catch (e) {
    alert("Login failed: " + e.message);
  }
}

// ─── DASHBOARD ────────────────────────────────────────────
async function showDashboard(uid) {
  // Show dashboard, hide auth
  document.getElementById("authBox").style.display   = "none";
  document.getElementById("dashboard").style.display = "block";

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      alert("User data not found.");
      return;
    }

    const user = snap.data();

    document.getElementById("userName").innerText = user.name || "Unknown";
    document.getElementById("userDob").innerText  =
      user.dob
        ? `DOB: ${user.dob} (Age: ${calculateAge(user.dob)})`
        : "DOB: Unknown";
    document.getElementById("userPhoto").src = user.photoURL || "";

    // Generate QR code
    generateQR(uid);

  } catch (e) {
    console.error("Error loading dashboard:", e);
    alert("Failed to load your pass. Please try again.");
  }
}

// ─── AUTO LOGIN ───────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) showDashboard(user.uid);
});

// ─── TOGGLE SIGNUP / LOGIN ────────────────────────────────
function toggle() {
  const signupForm   = document.getElementById("signupForm");
  const loginForm    = document.getElementById("loginForm");
  const showingSignup = signupForm.style.display !== "none";
  signupForm.style.display = showingSignup ? "none"  : "block";
  loginForm.style.display  = showingSignup ? "block" : "none";
}

// ─── EVENT LISTENERS ──────────────────────────────────────
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("toggleBtn").addEventListener("click", toggle);
