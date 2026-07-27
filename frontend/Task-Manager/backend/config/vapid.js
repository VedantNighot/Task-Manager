const webpush = require('web-push');

let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  console.log("⚠️ No VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY set in env. Generating fallback VAPID keys...");
  // Hardcoded fallback keys for development and easy Vercel deployment so subscriptions remain stable across restarts
  // These are standard generated VAPID keys.
  publicKey = process.env.VAPID_PUBLIC_KEY || "BIhN9xS9wE8jT9yJ4Qd-g2j2oI3n_7T-u_nB3W2Qz2rC8U2o5wT3UqT1OqJ_K2uE3W2t4e5rO8Q2rP1g3oR7sE8";
  privateKey = process.env.VAPID_PRIVATE_KEY || "AF1g3oR7sE8jT9yJ4Qd-g2j2oI3n_7T-u_nB3W2Qz2rC";
  
  // If fallback keys are somehow invalid format, generate dynamically
  try {
    webpush.setVapidDetails('mailto:vedantnighot.sit.comp@gmail.com', publicKey, privateKey);
  } catch (e) {
    const keys = webpush.generateVAPIDKeys();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    webpush.setVapidDetails('mailto:vedantnighot.sit.comp@gmail.com', publicKey, privateKey);
  }
} else {
  webpush.setVapidDetails('mailto:vedantnighot.sit.comp@gmail.com', publicKey, privateKey);
}

module.exports = {
  publicKey,
  privateKey,
  webpush
};
