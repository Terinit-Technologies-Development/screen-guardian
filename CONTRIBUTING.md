# Contributing to Screen Guardian

Thank you for your interest in contributing to Screen Guardian! We welcome contributions from everyone. By participating in this project, you agree to help us create a safe and positive experience for all.

## How to Contribute

### 1. Reporting Bugs
- **Ensure the bug was not already reported** by searching on GitHub under [Issues].
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a **title and clear description**, as well as as much relevant information as possible, including a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### 2. Suggesting Enhancements
- Open a new issue with a clear title and detailed description.
- Explain why this enhancement would be useful to most users.

### 3. Pull Requests
- Fork the repo and create your branch from `main`.
- If you've added code that should be tested, add tests.
- Ensure the test suite passes.
- Make sure your code follows the existing style conventions.
- Issue that pull request!

## Development Setup

1.  **Prerequisites**:
    - Node.js > 18
    - Android Studio (for Android build)
    - Xcode (for iOS build, Mac only)

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run the App**:
    - Android: `npx expo run:android`
    - iOS: `npx expo run:ios`

## Project Architecture
- **State Management**: Zustand (`src/store`)
- **Native Modules**:
    - `AppInterventionModule` (Android): Handles overlays and app blocking.
    - `ScreenTimeMonitor` (iOS): Handles Screen Time API.
- **Navigation**: Expo Router (`app/`)
- **Styling**: NativeWind (Tailwind CSS)

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
