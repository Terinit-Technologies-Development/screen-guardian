# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow these steps to report it responsibly:

1.  **Do not** open a public issue on GitHub.
2.  Email the vulnerability details to your designated security contact (e.g., `security@example.com` - *replace with your email*).
3.  Include a detailed description of the vulnerability, steps to reproduce, and any proof-of-concept code.

We will acknowledge your report within 48 hours and provide an estimated timeline for a fix. We ask that you verify the fix before we release it publicly.

## Security Best Practices in Development

This project follows these security principles:
- **No Hardcoded Secrets**: We use environment variables or secure storage for sensitive keys.
- **Secure Storage**: Sensitive user preferences are stored using platform-encrypted storage (`SharedPreferences` on Android, `UserDefaults/Keychain` on iOS).
- **Minimal Permissions**: We only request permissions necessary for core functionality (Overlay, Usage Stats).
- **Data Privacy**: No user usage data is sent to external servers; all processing is done locally on the device.
