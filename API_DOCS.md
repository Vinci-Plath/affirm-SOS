# Affirm SOS API Documentation

## Table of Contents
1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [SOS Alerts](#sos-alerts)
   - [Check-ins](#check-ins)
   - [Contacts](#contacts)
   - [GBV Organizations](#gbv-organizations)
4. [Data Types](#data-types)
5. [Error Handling](#error-handling)
6. [Environment Variables](#environment-variables)
7. [Mock Implementation Notes](#mock-implementation-notes)

## Base URL
```
https://api.affirm-sos.com/v1
```

## Authentication
All endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### SOS Alerts

#### Send Emergency Alert
```
POST /alerts/emergency
```

**Request Body:**
```json
{
  "message": "I'm in danger. Send help. Do not call.",
  "location": {
    "latitude": -1.292066,
    "longitude": 36.821945,
    "accuracy": 15,
    "timestamp": "2025-06-24T09:36:57.000Z",
    "address": "Lat: -1.292066, Lon: 36.821945",
    "mapUrl": "https://www.google.com/maps?q=-1.292066,36.821945"
  },
  "contacts": [
    {
      "id": "contact_123",
      "name": "Jane Doe",
      "phone": "+254712345678",
      "isOrganization": false
    }
  ],
  "timestamp": "2025-06-24T09:36:57.000Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "alertId": "alert_abc123",
  "message": "Emergency alert sent successfully",
  "timestamp": "2025-06-24T09:36:57.000Z",
  "recipients": [
    {
      "phone": "+254712345678",
      "status": "queued",
      "messageId": "msg_xyz789"
    }
  ]
}
```

### Check-ins

#### Send Check-in
```
POST /checkins
```

**Request Body:**
```json
{
  "message": "I'm safe. This is a check-in message.",
  "isEmergency": false,
  "location": {
    "latitude": -1.292066,
    "longitude": 36.821945,
    "accuracy": 15,
    "timestamp": "2025-06-24T09:36:57.000Z",
    "address": "Lat: -1.292066, Lon: 36.821945",
    "mapUrl": "https://www.google.com/maps?q=-1.292066,36.821945"
  },
  "contacts": [
    {
      "id": "contact_123",
      "name": "Jane Doe",
      "phone": "+254712345678",
      "isOrganization": false
    }
  ],
  "timestamp": "2025-06-24T09:36:57.000Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "checkInId": "checkin_abc123",
  "message": "Check-in sent successfully",
  "timestamp": "2025-06-24T09:36:57.000Z"
}
```

### Contacts

#### Get All Contacts
```
GET /contacts
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "contact_123",
      "name": "Jane Doe",
      "phone": "+254712345678",
      "isPrimary": true,
      "createdAt": "2025-06-24T09:36:57.000Z",
      "updatedAt": "2025-06-24T09:36:57.000Z"
    }
  ]
}
```

### GBV Organizations

#### Get All GBV Organizations
```
GET /gbv/organizations
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gbv_123",
      "name": "GBV Emergency Response",
      "phone": "+254720000000",
      "description": "24/7 GBV emergency support",
      "location": "Nairobi, Kenya",
      "services": ["Emergency shelter", "Legal aid", "Counseling"],
      "isVerified": true,
      "createdAt": "2025-06-24T09:36:57.000Z"
    }
  ]
}
```

## Data Types

### Alert
```typescript
interface Alert {
  id: string;
  message: string;
  location: Location;
  contacts: Contact[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
  updatedAt: string;
}
```

### Contact
```typescript
interface Contact {
  id: string;
  name: string;
  phone: string;
  isPrimary: boolean;
  isOrganization: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Location
```typescript
interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
  mapUrl?: string;
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "timestamp": "2025-06-24T09:36:57.000Z"
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| 1001 | 400 | Invalid request data |
| 1002 | 401 | Unauthorized |
| 1003 | 403 | Forbidden |
| 1004 | 404 | Resource not found |
| 1005 | 429 | Too many requests |
| 2001 | 500 | Internal server error |
| 2002 | 503 | Service unavailable |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for the API | `https://api.bestie-sos.com/v1` |
| `API_TIMEOUT` | Request timeout in milliseconds | `30000` |
| `ENABLE_LOGGING` | Enable/disable API request logging | `true` |

## Mock Implementation Notes

1. **Replacing Mock Implementation**
   - The mock API implementation is located in `src/services/apiService.js`
   - Look for `[MOCK]` comments to identify mock implementations
   - Replace mock functions with actual API calls to the backend

2. **Testing**
   - The mock API includes simulated network delays (500-1000ms)
   - Error scenarios can be tested by modifying the mock implementation
   - See `__tests__/api` for example test cases

3. **Development**
   - Set `ENABLE_LOGGING=true` to see detailed request/response logs
   - Use the included error simulation for testing error handling
   - The mock API persists data in memory (reset on app restart)
