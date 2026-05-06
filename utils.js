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

// 🔥 IMPORTANT: change URL to your actual site later
export function generateQR(uid) {
  const url = `${window.location.origin}/user.html?uid=${uid}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

// Track rules (for later admin use)
export const trackRules = {
  beginner: 0,
  intermediate: 10,
  advanced: 14,
  pro: 16
};

export function canAccessTrack(age, track) {
  return age >= trackRules[track];
}
