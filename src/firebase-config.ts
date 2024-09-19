import * as admin from "firebase-admin";
import { initializeApp as initClient } from "firebase/app";

require("dotenv").config();

const { env } = process;

const {
  PROJECT_ID,
  PRIVATE_KEY_ID,
  PRIVATE_KEY,
  CLIENT_EMAIL,
  CLIENT_ID,
  CLIENT_X509_CERT_URL,
  API_KEY,
  APP_ID,
  MESSAGING_SENDER_ID,
} = env;

const adminServiceAccount = {
  type: "service_account",
  project_id: PROJECT_ID,
  private_key_id: PRIVATE_KEY_ID,
  private_key: PRIVATE_KEY,
  client_email: CLIENT_EMAIL,
  client_id: CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com",
};

// Client SDK (web-side Firebase)
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: `${PROJECT_ID}.appspot.com`,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};
initClient(firebaseConfig);

// Admin SDK (server-side Firebase)
admin.initializeApp({
  credential: admin.credential.cert(
    adminServiceAccount as admin.ServiceAccount
  ),
  databaseURL: `https://${PROJECT_ID}.firebaseio.com`,
});

export { admin };
