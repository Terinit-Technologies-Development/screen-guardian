import { AppUsageData, UsageData, DailySummary } from '../types/usage';
import { getTodayString, getLast7Days } from '../utils/dateHelpers';

class MockDataService {
  private mockApps: AppUsageData[] = [
    {
      packageName: 'com.instagram.android',
      appName: 'Instagram',
      appIcon: '📷',
      timeInForeground: 3600,
      launchCount: 15,
      lastTimeUsed: Date.now() - 300000,
      category: 'Social',
    },
    {
      packageName: 'com.google.android.youtube',
      appName: 'YouTube',
      appIcon: '📺',
      timeInForeground: 5400,
      launchCount: 8,
      lastTimeUsed: Date.now() - 600000,
      category: 'Entertainment',
    },
    {
      packageName: 'com.twitter.android',
      appName: 'Twitter',
      appIcon: '🐦',
      timeInForeground: 1800,
      launchCount: 12,
      lastTimeUsed: Date.now() - 900000,
      category: 'Social',
    },
    {
      packageName: 'com.slack',
      appName: 'Slack',
      appIcon: '💼',
      timeInForeground: 2700,
      launchCount: 20,
      lastTimeUsed: Date.now() - 1200000,
      category: 'Productivity',
    },
    {
      packageName: 'com.netflix.mediaclient',
      appName: 'Netflix',
      appIcon: '🎬',
      timeInForeground: 4200,
      launchCount: 3,
      lastTimeUsed: Date.now() - 1800000,
      category: 'Entertainment',
    },
    {
      packageName: 'com.spotify.music',
      appName: 'Spotify',
      appIcon: '🎵',
      timeInForeground: 1200,
      launchCount: 5,
      lastTimeUsed: Date.now() - 2400000,
      category: 'Entertainment',
    },
    {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      appIcon: '💬',
      timeInForeground: 900,
      launchCount: 25,
      lastTimeUsed: Date.now() - 100000,
      category: 'Social',
    },
  ];

  getTodayUsage(): UsageData {
    const totalScreenTime = this.mockApps.reduce(
      (sum: number, app: AppUsageData) => sum + app.timeInForeground,
      0
    );

    return {
      totalScreenTime,
      apps: [...this.mockApps].sort((a, b) => b.timeInForeground - a.timeInForeground),
      timestamp: Date.now(),
      date: getTodayString(),
    };
  }

  getWeeklyData(): DailySummary[] {
    const dates = getLast7Days();

    return dates.map((date: string, index: number) => {
      const baseTime = 7200 + Math.random() * 3600;
      const trend = index * 200;

      return {
        date,
        totalScreenTime: Math.max(3600, Math.floor(baseTime - trend)),
        totalVisits: Math.floor(30 + Math.random() * 20),
        totalAppsUsed: Math.floor(5 + Math.random() * 4),
        exercisesCompleted: Math.floor(Math.random() * 3),
        extensionsUsed: Math.floor(Math.random() * 2),
        limitExceeded: Math.random() > 0.5,
        mostUsedApp: this.mockApps[Math.floor(Math.random() * 3)].appName,
      };
    });
  }

  getAppUsageHistory(days: number = 7): number[] {
    return Array.from({ length: days }, () =>
      Math.floor(1800 + Math.random() * 3600)
    );
  }

  refreshUsageData(): UsageData {
    this.mockApps = this.mockApps.map(app => ({
      ...app,
      timeInForeground: app.timeInForeground + Math.floor(Math.random() * 120),
      launchCount: app.launchCount + (Math.random() > 0.7 ? 1 : 0),
      lastTimeUsed: Math.random() > 0.5 ? Date.now() : app.lastTimeUsed,
    }));

    return this.getTodayUsage();
  }
}

export default new MockDataService();
