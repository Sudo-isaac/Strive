import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";


// 🎂 AGE CALCULATION
export function calculateAge(dob) {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}


// 📲 QR GENERATOR (CANVAS — FIXED)
export async function generateQR(uid) {
  const canvas = document.getElementById("qr");

  const data = JSON.stringify({
    uid: uid,
    type: "bike-pass",
    issued: Date.now()
  });

  try {
    await QRCode.toCanvas(canvas, data, {
      width: 140,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#3a3a55"
      }
    });

    console.log("QR generated successfully 🚀");

  } catch (err) {
    console.error("QR generation failed:", err);
  }
}
