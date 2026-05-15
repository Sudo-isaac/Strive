// 🎂 AGE CALCULATION
export function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// 📲 QR GENERATOR (uses free API, no broken imports)
export async function generateQR(uid) {
  const passURL = window.location.origin + "/pass.html?uid=" + uid;
  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=ffffff&bgcolor=3a3a55&data=" +
    encodeURIComponent(passURL);

  const img = document.getElementById("qr");
  img.src = qrURL;
  console.log("QR generated successfully 🚀");
}
