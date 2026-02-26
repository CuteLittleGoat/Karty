#!/usr/bin/env node
/**
 * Odtwarza strukturę Firestore dla modułu Main.
 * Wymagane: GOOGLE_APPLICATION_CREDENTIALS + firebase-admin.
 */
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const seedUserProfile = (uid, email, role = "user") => ({
  uid,
  email,
  name: email.split("@")[0],
  role,
  isActive: role === "admin",
  permissions: role === "admin" ? ["playerZoneTab", "nextGameTab", "chatTab", "confirmationsTab", "userGamesTab", "statsTab"] : [],
  statsYearsAccess: [],
  source: role === "admin" ? "seed-admin" : "seed-user",
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});

async function main() {
  const batch = db.batch();

  batch.set(db.collection("main_app_settings").doc("rules"), {
    text: "",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  batch.set(db.collection("main_admin_messages").doc("admin_messages"), {
    text: "",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  batch.set(db.collection("main_calculators").doc("tournament"), {
    mode: "tournament",
    table2Rows: [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  batch.set(db.collection("main_calculators").doc("cash"), {
    mode: "cash",
    table9Rows: [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await batch.commit();

  console.log("Podstawowa struktura Main została odtworzona.");
  console.log("Kolejny krok: utwórz konta Firebase Auth i profile w main_users/{uid}.");
  console.log("Przykład profilu admina:");
  console.log(JSON.stringify(seedUserProfile("ADMIN_UID", "admin@example.com", "admin"), null, 2));
}

main().catch((error) => {
  console.error("Błąd podczas odtwarzania struktury:", error);
  process.exitCode = 1;
});
