# Screen Guardian 🛡️

**Screen Guardian** is an advanced digital wellbeing application designed to help users reclaim their focus. Built with React Native (Expo) and powerful native modules, it enforces strict usage limits and provides deep insights into your digital habits.

## Current Capabilities

-   **Deep Focus Mode**: Strict, distraction-free sessions that block non-essential apps instantly.
-   **Strict App Limits**: Set daily time budgets and visit limits for specific apps. **Base limits are locked for 12 days** after configuration. Disable requests require a 30-day waiting period.
-   **Temporary Extensions**: Need a few more minutes? Request a temporary extension (up to 3 times per day) that resets at midnight without resetting your 12-day lock.
-   **Intervention Overlays**: High-friction screens that appear when limits are reached, requiring engagement (e.g., physical refusal exercises) rather than a simple dismiss button.
-   **Real-time Enforcement**: Monitors app usage in real time, dropping the block overlay on top of restricted apps exactly when the budget is depleted.
-   **Premium UI**: A sleek, dynamic dark-mode-first aesthetic powered by NativeWind and Reanimated.

## Known Drawbacks

-   **Battery Consumption**: To achieve instant, real-time blocking while inside an active application, the Android background `MonitoringService` polls the system `UsageStatsManager` every 5 seconds. This frequent polling ensures accuracy but slightly increases the background battery consumption of the app compared to standard periodic workers.
-   **Android 'UsageStats' Limitations**: Android does not natively push "usage expired" events to apps. Thus, the real-time session tracker relies on a custom hybrid approach (combining OS stats with live session timers) which requires constant background processing.

## Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
-   **Language**: TypeScript, Kotlin (Android), Swift (iOS)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
-   **Animations**: [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
-   **Storage**: Async Storage & SharedPreferences

## Getting Started

### Prerequisites

-   Node.js > 18
-   **Android**: Android Studio & JDK 17+
-   **iOS**: Xcode (Mac only)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/screen-guardian.git
    cd screen-guardian
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the application**
    
    Since this project uses custom native code, you must use the "run" commands, not just "start".

    -   **Android**:
        ```bash
        npx expo run:android
        ```
    -   **iOS**:
        ```bash
        npx expo run:ios
        ```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
