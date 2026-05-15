import { auth, db } from "./firebase.js";
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

// ─── STATUS HELPER ────────────────────────────────────────
function setStatus(msg, color = "orange") {
  let el = document.getElementById("statusMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "statusMsg";
    el.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0;
      background: ${color}; color: black;
      padding: 12px; font-size: 14px;
      font-weight: bold; text-align: center;
      z-index: 9999; white-space: pre-wrap;
    `;
    document.body.prepend(el);
  }
  el.style.background = color;
  el.innerText = msg;
}

// ─── CONVERT IMAGE TO BASE64 ──────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    // Resize image first to keep Firestore doc small
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        let w = img.width;
        let h = img.height;
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    setStatus("Step 1/3: Creating account...");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    setStatus("Step 1 ✅ Account created");

    setStatus("Step 2/3: Processing photo...");
    const photoBase64 = await fileToBase64(file);
    setStatus("Step 2 ✅ Photo ready");

    setStatus("Step 3/3: Saving your data...");
    const userDoc = {
      uid,
      name,
      email,
      dob,
      photoURL:  photoBase64,
      age:       calculateAge(dob),
      createdAt: new Date().toISOString(),
      passType:  "bike-park"
    };
    await setDoc(doc(db, "users", uid), userDoc);
    setStatus("✅ All saved! Loading pass...", "lightgreen");

    showDashboard(uid);

  } catch (e) {
    setStatus("❌ FAILED: " + e.message, "red");
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
    setStatus("Logging in...");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setStatus("✅ Logged in!", "lightgreen");
    showDashboard(cred.user.uid);
  } catch (e) {
    setStatus("❌ Login failed: " + e.message, "red");
  }
}

// ─── DASHBOARD ────────────────────────────────────────────
async function showDashboard(uid) {
  document.getElementById("authBox").style.display   = "none";
  document.getElementById("dashboard").style.display = "block";

  try {
    setStatus("Loading your pass...");
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      setStatus("❌ No data in Firestore for UID: " + uid, "red");
      document.getElementById("userName").innerText = "No data found";
      document.getElementById("userDob").innerText  = "Please sign up again";
      return;
    }

    const user = snap.data();
    setStatus("✅ Pass loaded!", "lightgreen");

    document.getElementById("userName").innerText =
      user.name || "Unknown";
    document.getElementById("userDob").innerText =
      user.dob
        ? `DOB: ${user.dob}  •  Age: ${calculateAge(user.dob)}`
        : "DOB: Unknown";

    if (user.photoURL) {
      document.getElementById("userPhoto").src           = user.photoURL;
      document.getElementById("userPhoto").style.display = "block";
    }

    generateQR(uid);

    setTimeout(() => {
      const el = document.getElementById("statusMsg");
      if (el) el.style.display = "none";
    }, 3000);

  } catch (e) {
    setStatus("❌ Dashboard error: " + e.message, "red");
  }
}

// ─── AUTO LOGIN ───────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) showDashboard(user.uid);
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
