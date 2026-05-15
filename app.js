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

  if (!email || !password || !name || !dob) {
    alert("Please fill in all fields.");
    return;
  }
  if (!file) {
    alert("Please upload a profile photo.");
    return;
  }

  try {
    // STEP 1 — Create Firebase Auth account
    console.log("⏳ Step 1: Creating auth account...");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    console.log("✅ Step 1 done — UID:", uid);

    // STEP 2 — Upload photo to Firebase Storage
    console.log("⏳ Step 2: Uploading photo...");
    const storageRef = ref(storage, `users/${uid}/photo`);
    const snapshot   = await uploadBytes(storageRef, file);
    const photoURL   = await getDownloadURL(snapshot.ref);
    console.log("✅ Step 2 done — photoURL:", photoURL);

    // STEP 3 — Save user data to Firestore
    console.log("⏳ Step 3: Saving to Firestore...");
    const userDoc = {
      uid,
      name,
      email,
      dob,
      photoURL,
      age:       calculateAge(dob),
      createdAt: new Date().toISOString(),
      passType:  "bike-park"
    };
    await setDoc(doc(db, "users", uid), userDoc);
    console.log("✅ Step 3 done — Firestore saved:", userDoc);

    // STEP 4 — Show dashboard
    showDashboard(uid);

  } catch (e) {
    console.error("❌ Signup error:", e.code, e.message);
    alert("Signup failed:\n" + e.message);
  }
}

// ─── LOGIN ────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    console.log("⏳ Logging in...");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Logged in:", cred.user.uid);
    showDashboard(cred.user.uid);
  } catch (e) {
    console.error("❌ Login error:", e.code, e.message);
    alert("Login failed:\n" + e.message);
  }
}

// ─── DASHBOARD ────────────────────────────────────────────
async function showDashboard(uid) {
  document.getElementById("authBox").style.display   = "none";
  document.getElementById("dashboard").style.display = "block";

  try {
    console.log("⏳ Loading Firestore doc for UID:", uid);
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      console.error("❌ No Firestore doc found for UID:", uid);
      document.getElementById("userName").innerText = "⚠️ No data found";
      document.getElementById("userDob").innerText  = "Please sign up again";
      document.getElementById("userPhoto").style.display = "none";
      document.getElementById("qr").style.display        = "none";
      return;
    }

    const user = snap.data();
    console.log("✅ User data:", user);

    // Populate pass
    document.getElementById("userName").innerText =
      user.name || "Unknown";

    document.getElementById("userDob").innerText =
      user.dob
        ? `DOB: ${user.dob}  •  Age: ${calculateAge(user.dob)}`
        : "DOB: Unknown";

    // Profile photo
    if (user.photoURL) {
      const photoEl = document.getElementById("userPhoto");
      photoEl.src             = user.photoURL;
      photoEl.style.display   = "block";
      console.log("✅ Photo set:", user.photoURL);
    }

    // QR code
    generateQR(uid);

  } catch (e) {
    console.error("❌ Dashboard error:", e.code, e.message);
    alert("Failed to load pass:\n" + e.message);
  }
}

// ─── AUTO LOGIN ───────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("🔄 Already logged in:", user.uid);
    showDashboard(user.uid);
  }
});

// ─── TOGGLE ───────────────────────────────────────────────
function toggle() {
  const signupForm    = document.getElementById("signupForm");
  const loginForm     = document.getElementById("loginForm");
  const showingSignup = signupForm.style.display !== "none";
  signupForm.style.display = showingSignup ? "none"  : "block";
  loginForm.style.display  = showingSignup ? "block" : "none";
}

// ─── EVENTS ───────────────────────────────────────────────
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("toggleBtn").addEventListener("click", toggle);
