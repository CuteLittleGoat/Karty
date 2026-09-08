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

  // App Check — dostawca reCAPTCHA Enterprise (klucz "Karty" z Google Cloud,
  // domena cutelittlegoat.github.io). Klucz witryny jest jawny z założenia,
  // tak samo jak apiKey powyżej. Szczegóły: Analizy/Instrukcja_AppCheck_2026-09-07.md
  , appCheckEnterpriseSiteKey: "6Ld6x68tAAAAAFjbhLm9CqHY2V5xnoKBEFnxzKU2"

  // Wariant zapasowy — klasyczna reCAPTCHA v3 (wycofywana przez Google).
  // Używać tylko zamiast powyższej linii, nigdy razem z nią:
  // , appCheckSiteKey: "TU_WKLEJ_KLUCZ_WITRYNY_reCAPTCHA_v3"
  //
  // Do pracy lokalnej: najpierw ustaw poniżej wartość true, otwórz aplikację
  // i skopiuj token wypisany w konsoli przeglądarki, potem wklej go tutaj
  // jako tekst i zarejestruj w Firebase Console > App Check > Manage debug tokens:
  // , appCheckDebugToken: true
};
