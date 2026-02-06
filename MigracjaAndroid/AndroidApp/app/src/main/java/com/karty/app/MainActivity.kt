package com.karty.app

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
  private lateinit var webView: WebView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    webView = findViewById(R.id.webView)

    WebViewConfig.applyDefaults(webView)
    webView.webViewClient = KartyWebViewClient()

    NotificationHelper.ensureChannel(this)

    webView.loadUrl(WebViewConfig.USER_START_URL)
  }
}
