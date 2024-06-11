const admin = require("firebase-admin");
const serviceAccount = require("./native-gaming-b14d3-firebase-adminsdk-tcqrn-69ab08c76f.json"); // Download this file from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
