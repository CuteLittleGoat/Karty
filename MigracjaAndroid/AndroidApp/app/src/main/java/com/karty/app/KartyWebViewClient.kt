package com.karty.app

import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

class KartyWebViewClient : WebViewClient() {
  // Blokuje przejście do trybu admina w aplikacji mobilnej.
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
