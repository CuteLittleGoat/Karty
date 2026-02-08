# Add project specific ProGuard rules here.
# Firestore (PUSH) - zachowaj klasy modelu i listenerów.
-keepclassmembers class * {
  @com.google.firebase.firestore.PropertyName <fields>;
  @com.google.firebase.firestore.PropertyName <methods>;
}
