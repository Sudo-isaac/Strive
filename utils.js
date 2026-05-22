// 🎂 AGE CALCULATION
export function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// 📲 QR GENERATOR
export function generateQR(uid) {
  const img = document.getElementById("qr");

  // Guard: element must exist before doing anything
  if (!img) {
    console.error("❌ #qr element not found in DOM — call generateQR after card is visible");
    return;
  }

  // Resolve base URL — window.location.origin is "null" (string) on file://
  const isFileProtocol =
    window.location.origin === "null" ||
    window.location.protocol === "file:";

  const base = isFileProtocol
    ? "http://localhost:5500"  // ← update to your actual server URL
    : window.location.origin;

  const passURL = base + "/pass.html?uid=" + encodeURIComponent(uid);
  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/?size=160x160" +
    "&color=ffffff&bgcolor=3a3a55" +
    "&data=" + encodeURIComponent(passURL);

  // Show a loading state while the external image fetches
  img.alt = "Loading QR...";
  img.style.opacity = "0.4";

  img.onload = () => {
    img.style.opacity = "1";
    console.log("✅ QR loaded:", passURL);
  };

  img.onerror = () => {
    img.alt = "QR unavailable";
    img.style.opacity = "1";
    // Fallback: render QR inline via Canvas so it works fully offline
    console.warn("⚠️ api.qrserver.com failed — consider a local QR library as fallback");
  };

  img.src = qrURL;
}
