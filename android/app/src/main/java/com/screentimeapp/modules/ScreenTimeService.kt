package com.screentimeapp.modules

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import android.content.Context

class ScreenTimeService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return
            
            // Don't block our own app
            if (packageName == this.packageName) return

            val prefs = getSharedPreferences("ScreenGuardianLimits", Context.MODE_PRIVATE)
            val isEnabled = prefs.getBoolean("${packageName}_enabled", false)
            
            if (isEnabled) {
                // Here we would normally check the current usage time
                // For now, let's just log it
                Log.d("ScreenTimeService", "Restricted app detected: $packageName")
            }
        }
    }

    override fun onInterrupt() {
        Log.d("ScreenTimeService", "Service Interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("ScreenTimeService", "Service Connected")
    }
}
