// Skopiuj ten plik jako: config/firebase-config.js (bez ".template")
// Następnie wklej swój firebaseConfig z:
// Firebase Console → Project settings → Your apps (Web) → Firebase SDK snippet (Config)

window.firebaseConfig = {
  apiKey: "AIzaSyBjSijsTEvkOF9oTPOf3FgTf3zCcM59rQY",
  authDomain: "karty-turniej.firebaseapp.com",
  projectId: "karty-turniej",
  storageBucket: "karty-turniej.firebasestorage.app",
  messagingSenderId: "716608782712",
  appId: "1:716608782712:web:27d29434f013a5cf31888d",
  tablesCollection: "Tables",
  gamesCollection: "Tables",
  gameDetailsCollection: "rows",
  userGamesCollection: "UserGames"

  // App Check (opcjonalnie, patrz Analizy/Bezpieczenstwo_Firestore_2026-09-07.md):
  // po zarejestrowaniu aplikacji w Firebase Console > App Check (dostawca reCAPTCHA v3)
  // dopisz poniżej klucz witryny, a aplikacja włączy App Check sama:
  // , appCheckSiteKey: "TU_WKLEJ_KLUCZ_WITRYNY_reCAPTCHA_v3"
  // Do pracy lokalnej: najpierw ustaw poniżej wartość true, otwórz aplikację
  // i skopiuj token wypisany w konsoli przeglądarki, potem wklej go tutaj
  // jako tekst i zarejestruj w Firebase Console > App Check > Manage debug tokens:
  // , appCheckDebugToken: true
};
