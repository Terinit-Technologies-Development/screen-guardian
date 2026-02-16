# Screen Guardian 🛡️

**Screen Guardian** is an advanced digital wellbeing application designed to help users reclaim their focus. Built with React Native (Expo) and powerful native modules, it enforces strict usage limits and provides deep insights into your digital habits.

## Features

-   **Deep Focus Mode**: strict, distraction-free sessions that block non-essential apps.
-   **App Limits**: Set daily time budgets and visit limits for specific apps.
-   **Intervention Overlays**: Beautiful, high-friction screens that appear when limits are reached.
-   **Usage Analytics**: Detailed daily and weekly breakdowns of your screen time.
-   **Native Integration**: Uses Android Accessibility Services and Usage Stats/Screen Time API for system-level enforcement.
-   **Premium UI**: A sleek, dark-mode-first aesthetic powered by NativeWind and Reanimated.

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
