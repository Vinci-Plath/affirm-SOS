# Backend Integration Guide

## Overview
This document provides guidance for backend developers to integrate with the Affirm-SOS mobile application. The frontend is ready for backend integration with mock implementations currently in place.

## Prerequisites
- Node.js v16
- npm or yarn
- Expo development environment (for testing)

## Getting Started

### 1. Repository Structure
```
src/
  services/
    apiService.js    # Main API service with mock implementations
    emergencyService.js  # Emergency alert and check-in logic
  utils/
    contactUtils.js  # Contact management utilities
  screens/           # App screens
  components/        # Reusable components
```

### 2. Setting Up Development Environment
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   API_BASE_URL=https://api.your-service.com/v1
   API_TIMEOUT=30000
   ENABLE_LOGGING=true
   ```

## API Integration

### Replacing Mock Implementation
1. **Locate Mock Implementations**
   - Search for `[MOCK]` comments in the codebase
   - Main mock implementations are in `src/services/apiService.js`

2. **Implement Real Endpoints**
   - Update the following methods in `apiService.js` to make real API calls:
     - `sosApi.sendEmergencyAlert()`
     - `sosApi.sendCheckIn()`
     - `contactsApi.getContacts()`
     - `gbvApi.getOrganizations()`

3. **Error Handling**
   - Ensure consistent error responses as defined in `API_DOCS.md`
   - Handle network errors gracefully
   - Implement retry logic for failed requests

### Testing
1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Manual Testing**
   - Test all emergency flows:
     - SOS button press
     - Check-in timer
     - Contact management
     - Location services

## Data Flow

### Emergency Alert Flow
1. User triggers SOS
2. App gets current location
3. App sends alert to all emergency contacts
4. Backend processes and forwards alerts
5. App shows confirmation/error

### Check-in Flow
1. User starts check-in timer
2. If timer expires, emergency alert is sent
3. User can cancel or complete check-in
4. App sends check-in confirmation

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_BASE_URL` | Base URL for the API | Yes | `https://api.bestie-sos.com/v1` |
| `API_TIMEOUT` | Request timeout in ms | No | `30000` |
| `ENABLE_LOGGING` | Enable API request logging | No | `true` |

## Deployment

### Staging
1. Set `API_BASE_URL` to staging environment
2. Test all critical flows
3. Verify error handling

### Production
1. Update `API_BASE_URL` to production URL
2. Enable production logging
3. Monitor API performance

## Support
For any questions or issues, please contact:
- Frontend Lead: [Your Contact Info]
- Project Manager: [PM Contact Info]

## Next Steps
1. Implement real API endpoints
2. Set up authentication
3. Configure webhook for message delivery status
4. Set up monitoring and alerts
5. Performance testing
