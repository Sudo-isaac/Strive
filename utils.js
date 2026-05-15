// 🎂 AGE CALCULATION
export function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// 📲 QR GENERATOR — uses api.qrserver.com, no broken npm imports
export function generateQR(uid) {
  // Use a hardcoded base or relative path — works on file:// and localhost
  const base = (window.location.origin === "null" || window.location.origin === "file://")
    ? "http://localhost:5500"  // change this to your server URL if needed
    : window.location.origin;

  const passURL = base + "/pass.html?uid=" + encodeURIComponent(uid);

  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/?size=120x120" +
    "&color=ffffff&bgcolor=3a3a55" +
    "&data=" + encodeURIComponent(passURL);

  const img = document.getElementById("qr");
  if (img) {
    img.src = qrURL;
    img.alt = "QR Code";
    console.log("✅ QR generated:", qrURL);
  } else {
    console.error("❌ #qr element not found in DOM");
  }
}
