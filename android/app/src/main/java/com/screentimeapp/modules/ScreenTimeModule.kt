package com.screentimeapp.modules

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

class ScreenTimeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ScreenTimeMonitor"

    @ReactMethod
    fun checkAuthorization(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), reactApplicationContext.packageName)
        } else {
            appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), reactApplicationContext.packageName)
        }
        
        val result = Arguments.createMap()
        result.putBoolean("authorized", mode == AppOpsManager.MODE_ALLOWED)
        result.putString("status", if (mode == AppOpsManager.MODE_ALLOWED) "approved" else "denied")
        promise.resolve(result)
    }

    @ReactMethod
    fun requestAuthorization(promise: Promise) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
        
        val result = Arguments.createMap()
        result.putBoolean("authorized", false) // User needs to return after granting
        result.putString("status", "pending")
        promise.resolve(result)
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        var accessibilityEnabled = 0
        val service = "${reactApplicationContext.packageName}/${ScreenTimeService::class.java.canonicalName}"
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                reactApplicationContext.contentResolver,
                Settings.Secure.ACCESSIBILITY_ENABLED
            )
        } catch (e: Settings.SettingNotFoundException) {
            // Error finding setting
        }

        val mStringColonSplitter = TextUtils.SimpleStringSplitter(':')
        var authorized = false

        if (accessibilityEnabled == 1) {
            val settingValue = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            if (settingValue != null) {
                mStringColonSplitter.setString(settingValue)
                while (mStringColonSplitter.hasNext()) {
                    val accessibilityService = mStringColonSplitter.next()
                    if (accessibilityService.equals(service, ignoreCase = true)) {
                        authorized = true
                    }
                }
            }
        }

        val result = Arguments.createMap()
        result.putBoolean("authorized", authorized)
        result.putString("status", if (authorized) "approved" else "denied")
        promise.resolve(result)
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
        
        val result = Arguments.createMap()
        result.putBoolean("authorized", false)
        result.putString("status", "pending")
        promise.resolve(result)
    }

    @ReactMethod
    fun getTodayUsage(promise: Promise) {
        val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()
        
        val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
        
        val result = Arguments.createMap()
        val appsArray = Arguments.createArray()
        var totalTime = 0L

        if (stats != null) {
            for (usageStats in stats) {
                if (usageStats.totalTimeInForeground > 0) {
                    val appMap = Arguments.createMap()
                    appMap.putString("packageName", usageStats.packageName)
                    appMap.putString("appName", getAppName(pm = reactApplicationContext.packageManager, packageName = usageStats.packageName))
                    appMap.putDouble("timeInForeground", usageStats.totalTimeInForeground.toDouble() / 1000) // seconds
                    appsArray.pushMap(appMap)
                    totalTime += usageStats.totalTimeInForeground
                }
            }
        }

        result.putDouble("totalScreenTime", totalTime.toDouble() / 1000)
        result.putArray("apps", appsArray)
        promise.resolve(result)
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        val pm = reactApplicationContext.packageManager
        val apps = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            pm.getInstalledApplications(PackageManager.ApplicationInfoFlags.of(PackageManager.MATCH_DISABLED_COMPONENTS.toLong()))
        } else {
            @Suppress("DEPRECATION")
            pm.getInstalledApplications(PackageManager.MATCH_DISABLED_COMPONENTS)
        }
        val result = Arguments.createArray()
        val launcherPackages = mutableSetOf<String>()

        val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val launcherActivities = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            pm.queryIntentActivities(launcherIntent, PackageManager.ResolveInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            pm.queryIntentActivities(launcherIntent, 0)
        }
        for (activity in launcherActivities) {
            launcherPackages.add(activity.activityInfo.packageName)
        }

        val recentlyUsedPackages = getRecentlyUsedPackages()

        apps
            .filter { app -> isConfigurableApp(pm, app, launcherPackages, recentlyUsedPackages) }
            .distinctBy { app -> app.packageName }
            .sortedBy { app -> getAppName(pm, app).lowercase(Locale.getDefault()) }
            .forEach { app ->
                val appMap = Arguments.createMap()
                appMap.putString("packageName", app.packageName)
                appMap.putString("appName", getAppName(pm, app))
                appMap.putBoolean("hasLauncher", launcherPackages.contains(app.packageName))
                appMap.putBoolean("seenInUsage", recentlyUsedPackages.contains(app.packageName))
                result.pushMap(appMap)
            }
        promise.resolve(result)
    }

    private fun isConfigurableApp(
        pm: PackageManager,
        app: ApplicationInfo,
        launcherPackages: Set<String>,
        recentlyUsedPackages: Set<String>
    ): Boolean {
        if (app.packageName == reactApplicationContext.packageName) return false
        if (!app.enabled && !recentlyUsedPackages.contains(app.packageName)) return false
        if (launcherPackages.contains(app.packageName)) return true
        if (recentlyUsedPackages.contains(app.packageName)) return true
        return pm.getLaunchIntentForPackage(app.packageName) != null
    }

    private fun getRecentlyUsedPackages(): Set<String> {
        return try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 30L * 24L * 60L * 60L * 1000L
            val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
            stats
                ?.filter { it.totalTimeInForeground > 0 }
                ?.map { it.packageName }
                ?.toSet()
                ?: emptySet()
        } catch (_: SecurityException) {
            emptySet()
        }
    }

    private fun getAppName(pm: PackageManager, app: ApplicationInfo): String {
        return pm.getApplicationLabel(app).toString().ifBlank { app.packageName }
    }

    private fun getAppName(pm: PackageManager, packageName: String): String {
        return try {
            val app = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                pm.getApplicationInfo(packageName, PackageManager.ApplicationInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getApplicationInfo(packageName, 0)
            }
            getAppName(pm, app)
        } catch (_: PackageManager.NameNotFoundException) {
            packageName
        }
    }

    @ReactMethod
    fun startMonitoring(promise: Promise) {
        // This would start a background service or worker
        val result = Arguments.createMap()
        result.putBoolean("monitoring", true)
        promise.resolve(result)
    }

    @ReactMethod
    fun stopMonitoring(promise: Promise) {
        val result = Arguments.createMap()
        result.putBoolean("monitoring", false)
        promise.resolve(result)
    }
}
