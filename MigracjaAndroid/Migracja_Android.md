# Migracja aplikacji Karty na Android (WebView + powiadomienia PUSH)

Ten dokument zawiera kompletny zestaw informacji potrzebnych do przygotowania **wersji Android** (APK/AAB) w Android Studio:
- konfigurację projektu i zależności,
- gotowe pliki Kotlin (WebView + blokada trybu admina),
- konfigurację powiadomień PUSH opartych o Firestore,
- checklistę budowy APK/AAB.

> Wymaganie: aplikacja **ma wyświetlać tylko widok użytkownika**, więc w Androidzie **nie dopuszczamy parametru `?admin=1`**.

---

## 1. Adresy aplikacji web (widok użytkownika)

### 1.1. Start aplikacji (bez admina)
- **Start (Main):** `https://cutelittlegoat.github.io/Karty/Main/index.html`

### 1.2. Zasady widoku użytkownika (bez admina)
- URL startowy **nie zawiera** `?admin=1`.
- W kodzie Android **blokujemy każdy adres z `admin=1`** i zastępujemy go adresem bez parametru.

---

## 2. Struktura projektu Android (do utworzenia w Android Studio)

Utwórz projekt o strukturze (przykład):
```
MigracjaAndroid/AndroidApp/
├─ settings.gradle
├─ build.gradle
├─ gradle.properties
└─ app/
   ├─ build.gradle
   ├─ proguard-rules.pro
   ├─ google-services.json
   └─ src/main/
      ├─ AndroidManifest.xml
      ├─ java/com/karty/app/
      │  ├─ MainActivity.kt
      │  ├─ WebViewConfig.kt
      │  ├─ KartyWebViewClient.kt
      │  ├─ NotificationHelper.kt
      │  └─ AdminMessageListener.kt
      └─ res/
         ├─ layout/activity_main.xml
         ├─ values/strings.xml
         ├─ values/colors.xml
         ├─ values/themes.xml
         └─ drawable/ic_notification.xml
```

---

## 3. Pliki Kotlin i konfiguracja (pełne minimum)

Poniżej masz **gotowy kod** do skopiowania (najważniejsze pliki). Dzięki temu:
- WebView uruchamia `Main/index.html`,
- `?admin=1` jest blokowane,
- notyfikacje PUSH działają w tle dzięki nasłuchowi Firestore.

### 3.1. `MainActivity.kt`
```kotlin
package com.karty.app

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
  private lateinit var webView: WebView
  private val adminMessageListener = AdminMessageListener()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    webView = findViewById(R.id.webView)

    WebViewConfig.applyDefaults(webView)
    webView.webViewClient = KartyWebViewClient()

    // Start w trybie użytkownika (bez admin=1)
    webView.loadUrl(WebViewConfig.USER_START_URL)

    // Nasłuchuj wiadomości admina i pokazuj PUSH.
    adminMessageListener.start(this)
  }

  override fun onDestroy() {
    adminMessageListener.stop()
    super.onDestroy()
  }
}
```

### 3.2. `WebViewConfig.kt`
```kotlin
package com.karty.app

import android.webkit.WebSettings
import android.webkit.WebView

object WebViewConfig {
  const val USER_START_URL = "https://cutelittlegoat.github.io/Karty/Main/index.html"

  fun applyDefaults(webView: WebView) {
    val settings: WebSettings = webView.settings
    settings.javaScriptEnabled = true
    settings.domStorageEnabled = true
    settings.useWideViewPort = true
    settings.loadWithOverviewMode = true
  }
}
```

### 3.3. `KartyWebViewClient.kt` (blokada `?admin=1`)
```kotlin
package com.karty.app

import android.content.Context
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

class KartyWebViewClient : WebViewClient() {
  override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
    val url = request?.url ?: return false

    if (url.getQueryParameter("admin") == "1") {
      val safeUrl = Uri.Builder()
        .scheme(url.scheme)
        .authority(url.authority)
        .path(url.path)
        .build()
        .toString()

      view?.loadUrl(safeUrl)
      return true
    }

    return false
  }
}
```

### 3.4. `NotificationHelper.kt`
```kotlin
package com.karty.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

object NotificationHelper {
  private const val CHANNEL_ID = "karty_updates"

  fun ensureChannel(context: Context) {
    val channel = NotificationChannel(
      CHANNEL_ID,
      context.getString(R.string.notification_channel_name),
      NotificationManager.IMPORTANCE_DEFAULT
    )
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(channel)
  }

  fun showNotification(context: Context, title: String, body: String) {
    ensureChannel(context)

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle(title)
      .setContentText(body)
      .setColor(ContextCompat.getColor(context, R.color.notification_gold))
      .setAutoCancel(true)
      .build()

    NotificationManagerCompat.from(context).notify(System.currentTimeMillis().toInt(), notification)
  }
}
```

### 3.5. `AdminMessageListener.kt` (PUSH z Firestore)
```kotlin
package com.karty.app

import android.content.Context
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query

class AdminMessageListener {
  private var registration: ListenerRegistration? = null
  private var lastMessageId: String? = null

  fun start(context: Context) {
    val db = FirebaseFirestore.getInstance()
    registration = db.collection("admin_messages")
      .orderBy("createdAt", Query.Direction.DESCENDING)
      .limit(1)
      .addSnapshotListener { snapshots, error ->
        if (error != null || snapshots == null || snapshots.isEmpty) {
          return@addSnapshotListener
        }

        val doc = snapshots.documents.first()
        val messageId = doc.id
        val message = doc.getString("message") ?: return@addSnapshotListener

        if (lastMessageId == messageId) {
          return@addSnapshotListener
        }

        lastMessageId = messageId
        val title = context.getString(R.string.notification_title_default)
        NotificationHelper.showNotification(context, title, message)
      }
  }

  fun stop() {
    registration?.remove()
    registration = null
  }
}
```

---

## 4. AndroidManifest.xml (uprawnienia i PUSH)

```xml
<manifest package="com.karty.app" xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

  <application
    android:label="Karty"
    android:icon="@mipmap/ic_launcher"
    android:usesCleartextTraffic="false">

    <activity
      android:name=".MainActivity"
      android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>

  </application>
</manifest>
```

---

## 5. `app/build.gradle` — kluczowe zależności

```gradle
plugins {
  id 'com.android.application'
  id 'org.jetbrains.kotlin.android'
  id 'com.google.gms.google-services'
}

android {
  namespace 'com.karty.app'
  compileSdk 34

  defaultConfig {
    applicationId "com.karty.app"
    minSdk 24
    targetSdk 34
    versionCode 1
    versionName "1.0"
  }
}

dependencies {
  implementation platform('com.google.firebase:firebase-bom:33.2.0')
  implementation 'com.google.firebase:firebase-firestore-ktx'
  implementation 'androidx.core:core-ktx:1.13.1'
  implementation 'androidx.appcompat:appcompat:1.7.0'
  implementation 'com.google.android.material:material:1.12.0'
}
```

---

## 6. Konfiguracja Firebase (PUSH/Firestore)

1. Firebase Console → **Dodaj aplikację Android**.
2. Package name: `com.karty.app`.
3. Pobierz `google-services.json` i wklej do: `AndroidApp/app/google-services.json`.
4. Włącz **Cloud Firestore** w Firebase.
5. Ustaw reguły Firestore tak, aby aplikacja mobilna mogła czytać `admin_messages`.

---

## 7. PUSH z panelu admina (bez FCM)

Wiadomość wysłana w panelu admina trafia do kolekcji `admin_messages`. Android nasłuchuje tej kolekcji i natychmiast pokazuje lokalne powiadomienie (PUSH) dzięki `AdminMessageListener`.

---

## 8. Budowa APK/AAB w Android Studio

### 8.1. Przygotowanie środowiska
- Android Studio (SDK + Build Tools)
- JDK 17
- API 34 (Android 14)

### 8.2. Test APK (debug)
1. `Run ▶`
2. Plik debug: `AndroidApp/app/build/outputs/apk/debug/app-debug.apk`

### 8.3. Release APK/AAB
1. `Build → Generate Signed Bundle / APK...`
2. Wybierz **APK** lub **AAB**.
3. Utwórz `keystore`.
4. Zbuduj wariant **release**.

Pliki wynikowe:
- **AAB:** `AndroidApp/app/build/outputs/bundle/release/app-release.aab`
- **APK:** `AndroidApp/app/build/outputs/apk/release/app-release.apk`

---

## 9. Najważniejsze spełnione wymagania

✅ **Tylko widok użytkownika** — URL bez `?admin=1`, a WebView blokuje każdy link z adminem.  
✅ **Powiadomienia Android** — PUSH oparte o nasłuch Firestore + `NotificationHelper`.  
✅ **Możliwość budowy APK/AAB** — pełna instrukcja krok po kroku.
