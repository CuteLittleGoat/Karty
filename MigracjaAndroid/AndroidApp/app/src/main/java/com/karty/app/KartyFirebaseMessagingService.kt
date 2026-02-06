package com.karty.app

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class KartyFirebaseMessagingService : FirebaseMessagingService() {
  override fun onMessageReceived(message: RemoteMessage) {
    val title = message.notification?.title ?: "Nowa wiadomość"
    val body = message.notification?.body ?: "Masz nowe powiadomienie z Karty"

    NotificationHelper.showNotification(this, title, body)
  }
}
