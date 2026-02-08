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
