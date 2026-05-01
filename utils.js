export function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// 🎯 Track rules (edit this to match your park)
export const trackRules = {
  beginner: 0,
  intermediate: 10,
  advanced: 14,
  pro: 16
};

// 🚦 Check access
export function canAccessTrack(age, track) {
  const minAge = trackRules[track];
  return age >= minAge;
}

// 📱 Generate QR (UID only)
export function generateQR(uid) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uid}`;
}
