// config/auth.js

require("dotenv").config(); // Load environment variables from a .env file

// Expose our config directly to our application
module.exports = {
  googleAuth: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://pcaso.io/auth/google/callback",
  },
};
