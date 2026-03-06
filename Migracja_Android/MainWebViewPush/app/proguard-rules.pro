# Keep Firebase Messaging service entry points.
-keep class com.karty.mainwebviewpush.push.MainFirebaseMessagingService { *; }

# Keep custom activity (safe for reflection edge cases).
-keep class com.karty.mainwebviewpush.ui.MainActivity { *; }
