package com.screentimeapp.modules

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.*

class AppInterventionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppInterventionManager"

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        val authorized = Settings.canDrawOverlays(reactApplicationContext)
        val result = Arguments.createMap()
        result.putBoolean("authorized", authorized)
        result.putString("status", if (authorized) "approved" else "denied")
        promise.resolve(result)
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactApplicationContext.packageName}")
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
        
        val result = Arguments.createMap()
        result.putBoolean("authorized", false)
        result.putString("status", "pending")
        promise.resolve(result)
    }

    @ReactMethod
    fun blockApp(packageName: String, message: String, promise: Promise) {
        // Logic to show overlay
        val result = Arguments.createMap()
        result.putBoolean("success", true)
        promise.resolve(result)
    }

    @ReactMethod
    fun syncLimits(limits: ReadableMap, promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("ScreenGuardianLimits", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        
        val iterator = limits.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            val limit = limits.getMap(key)
            if (limit != null) {
                editor.putLong(key, limit.getInt("maxTimeMinutes").toLong() * 60)
                editor.putBoolean("${key}_enabled", limit.getBoolean("enabled"))
            }
        }
        editor.apply()
        
        val result = Arguments.createMap()
        result.putBoolean("success", true)
        promise.resolve(result)
    }
}
