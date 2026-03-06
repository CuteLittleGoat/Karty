package com.karty.mainwebviewpush.ui

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging
import com.karty.mainwebviewpush.BuildConfig
import com.karty.mainwebviewpush.R
import com.karty.mainwebviewpush.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val notificationsPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                subscribeToMainTopic()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView(binding.mainWebView)
        binding.mainWebView.loadUrl(BuildConfig.MAIN_WEB_URL)

        requestNotificationsIfNeeded()
    }

    private fun setupWebView(webView: WebView) {
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowContentAccess = false
            allowFileAccess = false
            loadsImagesAutomatically = true
            mediaPlaybackRequiresUserGesture = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return true
                return !isAllowedUrl(uri)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                binding.loadingIndicator.visibility =
                    if (newProgress in 0..99) android.view.View.VISIBLE else android.view.View.GONE
            }
        }
    }

    private fun isAllowedUrl(uri: Uri): Boolean {
        val schemeAllowed = uri.scheme.equals("https", ignoreCase = true)
        val hostAllowed = uri.host.equals(BuildConfig.ALLOWED_WEB_HOST, ignoreCase = true)
        return schemeAllowed && hostAllowed
    }

    private fun requestNotificationsIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            subscribeToMainTopic()
            return
        }

        val alreadyGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED

        if (alreadyGranted) {
            subscribeToMainTopic()
        } else {
            notificationsPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun subscribeToMainTopic() {
        FirebaseMessaging.getInstance().subscribeToTopic("main_users")
    }

    override fun onBackPressed() {
        if (binding.mainWebView.canGoBack()) {
            binding.mainWebView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
