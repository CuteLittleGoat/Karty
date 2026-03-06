# WebView JS interfaces should not be obfuscated if you add @JavascriptInterface methods.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
