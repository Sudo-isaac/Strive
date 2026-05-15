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
    // 1. Create auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    console.log("✅ Auth account created:", uid);

    // 2. Upload photo to Storage
    const storageRef = ref(storage, "users/" + uid + "/photo");
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    console.log("✅ Photo uploaded:", photoURL);

    // 3. Save full user document to Firestore
    const userDoc = {
      uid,
      name,
      email,
      dob,
      photoURL,
      age: calculateAge(dob),
      createdAt: new Date().toISOString(),
      passType: "bike-park"
    };

    await setDoc(doc(db, "users", uid), userDoc);
    console.log("✅ Firestore document saved:", userDoc);

    showDashboard(uid);
  } catch (e) {
    console.error("Signup error:", e);
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
    console.log("✅ Logged in:", cred.user.uid);
    showDashboard(cred.user.uid);
  } catch (e) {
    console.error("Login error:", e);
    alert("Login failed: " + e.message);
  }
}

// ─── DASHBOARD ────────────────────────────────────────────
async function showDashboard(uid) {
  document.getElementById("authBox").style.display   = "none";
  document.getElementById("dashboard").style.display = "block";

  try {
    console.log("Loading dashboard for UID:", uid);
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      console.error("❌ No Firestore document for UID:", uid);
      document.getElementById("userName").innerText = "No data found";
      document.getElementById("userDob").innerText  = "Please sign up again";
      return;
    }

    const user = snap.data();
    console.log("✅ User data loaded:", user);

    document.getElementById("userName").innerText = user.name  || "Unknown";
    document.getElementById("userDob").innerText  =
      user.dob
        ? `DOB: ${user.dob} (Age: ${calculateAge(user.dob)})`
        : "DOB: Unknown";
    document.getElementById("userPhoto").src = user.photoURL || "";

    generateQR(uid);

  } catch (e) {
    console.error("Dashboard error:", e);
    alert("Failed to load your pass: " + e.message);
  }
}

// ─── AUTO LOGIN ───────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("🔄 Auto login detected:", user.uid);
    showDashboard(user.uid);
  }
});

// ─── TOGGLE SIGNUP / LOGIN ────────────────────────────────
function toggle() {
  const signupForm    = document.getElementById("signupForm");
  const loginForm     = document.getElementById("loginForm");
  const showingSignup = signupForm.style.display !== "none";
  signupForm.style.display = showingSignup ? "none"  : "block";
  loginForm.style.display  = showingSignup ? "block" : "none";
}

// ─── EVENT LISTENERS ──────────────────────────────────────
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("toggleBtn").addEventListener("click", toggle);
