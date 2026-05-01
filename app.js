import { auth, db, storage } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

window.signup = async () => {
  const email = signupEmail.value;
  const password = signupPassword.value;
  const name = signupName.value;
  const dob = signupDob.value;
  const age = signupAge.value;
  const file = signupPhoto.files[0];

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  const storageRef = ref(storage, "users/" + user.uid);
  await uploadBytes(storageRef, file);
  const photoURL = await getDownloadURL(storageRef);

  await setDoc(doc(db, "users", user.uid), { name, dob, age, photoURL });

  showDashboard(user.uid);
};

window.login = async () => {
  const cred = await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  showDashboard(cred.user.uid);
};

async function showDashboard(uid) {
  authBox.style.display = "none";
  dashboard.style.display = "block";

  const snap = await getDoc(doc(db, "users", uid));
  const user = snap.data();

  userName.innerText = user.name;
  userPhoto.src = user.photoURL;

  qr.src = `https://api.qrserver.com/v1/create-qr-code/?data=${uid}`;
}
