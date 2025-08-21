# Sales Analytics Backend API

A Node.js backend API for the Sales Analytics Pro application, featuring MongoDB for data storage and Gemini AI for conversation analysis.

## Features

- **User Authentication**: Registration and login with organization/zone/store mapping
- **Session Management**: Create and track sales sessions with conversation transcripts
- **Customer Management**: Track customers across sessions with contact history
- **AI-Powered Analytics**: Conversation analysis using Google's Gemini AI
- **Performance Tracking**: Dashboard statistics and performance metrics
- **Follow-up Generation**: AI-generated personalized follow-up messages

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- Google Gemini API key

## Installation

1. **Clone and install dependencies:**
```bash
cd sales-backend
npm install
```

2. **Environment Setup:**
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/sales_analytics

# Server Configuration  
PORT=5000

# Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Sales Analysis Prompt (can be customized)
GEMINI_PROMPT="You are an expert sales coach analyzing a conversation..."
```

3. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User registration/login
- `GET /api/auth/profile/:userId` - Get user profile

### Sessions
- `POST /api/sessions` - Create new sale session
- `GET /api/sessions/salesperson/:salespersonId` - Get sessions for salesperson
- `GET /api/sessions/:sessionId` - Get specific session
- `GET /api/sessions/stats/:salespersonId` - Get dashboard statistics

### Customers
- `GET /api/customers` - Get customers (with filters)
- `GET /api/customers/:customerId` - Get customer with sessions
- `PATCH /api/customers/:customerId/notes` - Update customer notes

### Analytics
- `POST /api/analytics/analyze/:sessionId` - Analyze session with AI
- `GET /api/analytics/session/:sessionId` - Get session analytics
- `POST /api/analytics/followup/:sessionId` - Generate follow-up message
- `GET /api/analytics/salesperson/:salespersonId/stats` - Get performance stats

## Database Schema

### User
```javascript
{
  name: String,
  mobile: String (unique),
  organizationId: String,
  organizationName: String, 
  zoneId: String,
  storeId: String,
  isActive: Boolean
}
```

### Customer
```javascript
{
  name: String,
  phone: String,
  organizationId: String,
  zoneId: String,
  storeId: String,
  createdBy: ObjectId (User),
  totalSessions: Number,
  lastContactDate: Date,
  notes: String
}
```

### SaleSession
```javascript
{
  salesperson: ObjectId (User),
  customer: ObjectId (Customer),
  customerName: String,
  customerPhone: String,
  transcript: String,
  duration: Number (seconds),
  sessionDate: Date,
  organizationId: String,
  zoneId: String,
  storeId: String,
  isAnalyzed: Boolean
}
```

### Analytics
```javascript
{
  sessionId: ObjectId (SaleSession),
  salesperson: ObjectId (User),
  customer: ObjectId (Customer),
  pitchScore: Number (0-100),
  buyerIntent: Number (0-100),
  objections: [String],
  mistakes: [{statement: String, comment: String}],
  insights: [String],
  followupMessage: String,
  analysisDate: Date,
  organizationId: String,
  zoneId: String,
  storeId: String
}
```

## Usage Examples

### 1. User Login/Registration
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "+1234567890"
  }'
```

### 2. Create Sale Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "salespersonId": "user_id_here",
    "customerName": "Jane Smith", 
    "customerPhone": "+0987654321",
    "transcript": "Sales conversation transcript...",
    "duration": 300
  }'
```

### 3. Analyze Session
```bash
curl -X POST http://localhost:5000/api/analytics/analyze/session_id_here
```

## AI Integration

The system uses Google's Gemini AI for conversation analysis. The AI prompt can be customized in the `.env` file to match your specific business needs.

### Fallback System
If the Gemini AI service is unavailable, the system automatically falls back to generating mock analytics data to ensure uninterrupted service.

## Error Handling

All endpoints include comprehensive error handling with meaningful error messages and appropriate HTTP status codes.

## Performance Considerations

- Database indexes are configured for optimal query performance
- Pagination is supported for large datasets
- Connection pooling for MongoDB is handled automatically by Mongoose

## Security Notes

- Always use strong, unique API keys
- Consider implementing rate limiting for production
- Use HTTPS in production environments
- Validate and sanitize all user inputs