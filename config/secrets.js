"use strict";

module.exports = {
  // User session key
  sessionKey: "Yoursecretsessionkey",

  // Email login
  emailCredentials: {
    // required
    "no-reply": {
      user: "no-reply@domain.com",
      pass: "no-reply's password",
    },

    // Optional others
    "other-auto-email-accounts": {
      user: "account-name@domain.com",
      pass: "account-name's password",
    },
  },
};

