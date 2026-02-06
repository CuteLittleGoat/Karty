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
