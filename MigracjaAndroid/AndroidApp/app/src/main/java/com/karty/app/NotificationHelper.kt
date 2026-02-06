package com.karty.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

object NotificationHelper {
  private const val CHANNEL_ID = "karty_updates"

  fun ensureChannel(context: Context) {
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Karty — aktualizacje",
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
      .setAutoCancel(true)
      .build()

    NotificationManagerCompat.from(context)
      .notify(System.currentTimeMillis().toInt(), notification)
  }
}
