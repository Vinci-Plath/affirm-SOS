# AffirmSOS - Emergency Response App

A discreet, trauma-informed emergency app for individuals at risk of gender-based violence (GBV). The app appears as a simple journaling app but includes hidden emergency features with real-time location sharing and emergency alerts.

## Features

- **Decoy Journal Interface**: Appears as a simple journal app
- **Hidden SOS Features**: Accessible via gestures or PIN
- **PIN Protection**: Secure access to emergency features
- **Emergency Contacts**: Quick access to trusted contacts and GBV organizations
- **Check-in System**: Automatic alerts if you don't stop the check-in timer
- **Real-time Location Sharing**: Share your location with emergency contacts
- **GBV Organization Integration**: Direct access to support services

## API Documentation

For detailed API specifications, please see:
- [API Documentation](API_DOCS.md) - Complete API reference
- [Backend Handoff Guide](BACKEND_HANDOFF.md) - Integration instructions for backend developer.

### Base URL
```
https://api.affirm-sos.com/v1
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Key Endpoints
- `POST /alerts/emergency` - Send emergency alert
- `POST /checkins` - Send check-in message
- `GET /contacts` - Get emergency contacts
- `GET /gbv/organizations` - Get GBV support organizations

## Development Status

### Frontend (Current)
- [x] UI/UX Implementation
- [x] Mock API Integration
- [x] Emergency Alert System
- [x] Check-in Timer
- [x] Contact Management
- [x] Location Services

### Backend (Pending Integration)
- [ ] Real API Endpoints
- [ ] Authentication Service
- [ ] SMS Gateway Integration
- [ ] Database Integration
- [ ] Webhook Support

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm
- Expo CLI (`npm install -g expo-cli` or `pnpm add -g expo-cli`)
- Android Studio / Xcode (for emulators)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/bestie-sos.git
   cd bestie-sos
   ```

2. Install dependencies
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   pnpm start
   # or
   npm start
   ```

5. Run the app
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with the Expo Go app on your physical device

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
API_BASE_URL=https://api.bestie-sos.com/v1
API_TIMEOUT=30000
ENABLE_LOGGING=true
```

## Backend Integration

### Setting Up Mock Mode
By default, the app uses mock API implementations. To connect to a real backend:

1. Update the API base URL in `.env`
2. Implement the required endpoints as per [API_DOCS.md](API_DOCS.md)
3. Set up authentication if needed

### Testing Backend Integration

1. Start the development server:
   ```bash
   npm start
   ```
2. Use the app to test:
   - Emergency alerts
   - Check-in system
   - Contact management
   - Location services

## Project Structure

```
src/
  ├── screens/         # App screens
  ├── config/          # Configuration files
  └── components/      # Reusable components
```

## Gestures

- **Swipe Right**: Access Action Screen (SOS features)
- **Swipe Left**: Access Settings (PIN protected)

## Security Note

This is a prototype. For production use, ensure to implement proper security measures including:
- Secure storage for sensitive data
- End-to-end encryption for messages
- Secure authentication
- Regular security audits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
