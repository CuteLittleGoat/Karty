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

  // Main module collections
  tablesCollection: "main_tables",
  gamesCollection: "main_tables",
  gameDetailsCollection: "rows",
  userGamesCollection: "main_user_games",
  playerAccessCollection: "main_app_settings",
  rulesCollection: "main_app_settings",
  adminMessagesCollection: "main_admin_messages",
  chatCollection: "main_chat_messages",
  adminGamesStatsCollection: "main_admin_games_stats",
  calculatorCollection: "main_calculators",

  // Second module collections
  secondTablesCollection: "second_tables",
  secondGamesCollection: "second_tables",
  secondGameDetailsCollection: "rows",
  secondUserGamesCollection: "second_user_games",
  secondPlayerAccessCollection: "second_app_settings",
  secondRulesCollection: "second_app_settings",
  secondAdminMessagesCollection: "second_admin_messages",
  secondChatCollection: "second_chat_messages",
  secondAdminGamesStatsCollection: "second_admin_games_stats",
  secondCalculatorCollection: "second_calculators"
};
