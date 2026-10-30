package com.pocketpal

import android.os.Build
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import com.pocketpal.specs.NativeNavigationBarSpec

@ReactModule(name = NativeNavigationBarSpec.NAME)
class NavigationBarModule(reactContext: ReactApplicationContext) :
    NativeNavigationBarSpec(reactContext), LifecycleEventListener {

  private var lastIsDark: Boolean? = null

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun setNavigationBarDark(isDark: Boolean) {
    UiThreadUtil.runOnUiThread {
      lastIsDark = isDark
      applyToCurrentActivity()
    }
  }

  override fun getWallpaperPalette(promise: Promise) {
    val palette = Arguments.createMap()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val res = reactApplicationContext.resources
      for (group in PALETTE_GROUPS) {
        for (tone in PALETTE_TONES) {
          val id = res.getIdentifier("system_${group}_$tone", "color", "android")
          if (id != 0) {
            val argb = res.getColor(id, null)
            palette.putString("${group}_$tone", String.format("#%06X", argb and 0xFFFFFF))
          }
        }
      }
    }
    promise.resolve(palette)
  }

  override fun onHostResume() {
    applyToCurrentActivity()
  }

  override fun onHostPause() {}

  override fun onHostDestroy() {}

  override fun invalidate() {
    super.invalidate()
    reactApplicationContext.removeLifecycleEventListener(this)
  }

  private fun applyToCurrentActivity() {
    val isDark = lastIsDark ?: return
    val window = reactApplicationContext.currentActivity?.window ?: return
    WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightNavigationBars =
        !isDark
  }

  companion object {
    private val PALETTE_GROUPS = listOf("accent1", "accent2", "accent3", "neutral1", "neutral2")
    private val PALETTE_TONES = listOf(0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)
  }
}
