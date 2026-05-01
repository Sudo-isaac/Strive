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

// QR generator
export function generateQR(uid) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uid}`;
}

// Track rules (used in admin panel later)
export const trackRules = {
  beginner: 0,
  intermediate: 10,
  advanced: 14,
  pro: 16
};

export function canAccessTrack(age, track) {
  return age >= trackRules[track];
}
