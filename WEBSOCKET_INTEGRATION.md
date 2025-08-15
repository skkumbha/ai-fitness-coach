# WebSocket Integration Guide

## Overview

The frontend now supports real-time chat communication via WebSocket after the initial message is sent through the REST API. This provides a seamless hybrid approach that ensures reliability while enabling real-time features.

## Architecture

```
User → Frontend → REST API (Initial Message) → Backend
                ↓
            WebSocket Connection Established
                ↓
            Real-time Communication via WebSocket
```

## Key Components

### 1. WebSocket Service (`src/services/websocket.js`)

**Features:**
- Automatic connection management
- JWT authentication
- Exponential backoff reconnection
- Message type handling
- Fallback to REST API when needed

**Message Types Supported:**
- `AUTH` - Authentication with JWT token
- `CHAT_MESSAGE` - New chat messages
- `MESSAGE_STATUS_UPDATE` - Message delivery status updates
- `TYPING_INDICATOR` - Show when AI is typing
- `ERROR` - Server error messages

### 2. Store Integration (`src/store/index.js`)

**New State:**
```javascript
state: {
  // ... existing state
  websocket: null,                    // WebSocket instance
  isWebSocketConnected: false,        // Connection status
  typingIndicators: {}               // Typing indicators by user
}
```

**New Actions:**
- `initializeWebSocket()` - Initialize WebSocket connection
- `disconnectWebSocket()` - Clean disconnect
- `sendTypingIndicator()` - Send typing status

**Modified Actions:**
- `sendMessage()` - Now uses WebSocket when available, falls back to REST API
- `loginUser()` / `signupUser()` - Initialize WebSocket after authentication
- `logoutUser()` - Disconnect WebSocket before logout

### 3. Component Updates

**ChatPage.vue:**
- WebSocket connection status indicator
- Visual feedback for connection state

**ChatInterface.vue:**
- Typing indicator when AI is responding
- Real-time message updates

## How It Works

### 1. **Initial Connection Flow**
```
1. User logs in/signs up
2. JWT token received and stored
3. WebSocket connection established
4. JWT token sent for authentication
5. Connection status updated in store
```

### 2. **Message Flow**
```
First Message:
User → Frontend → REST API → Backend → Response

Subsequent Messages:
User → Frontend → WebSocket → Backend → Real-time Response
```

### 3. **Fallback Mechanism**
```
If WebSocket unavailable:
1. Message sent via REST API
2. WebSocket reconnection attempted
3. Next message uses WebSocket if available
```

## Configuration

### Environment Variables
```bash
# Development (defaults to localhost:8081)
VITE_WS_URL=ws://localhost:8081/ws/chat

# Production (auto-detected from current domain)
# Uses wss:// for HTTPS, ws:// for HTTP
```

### Backend WebSocket Endpoint
```
ws://localhost:8081/ws/chat
```

## Message Format

### Outgoing Messages
```javascript
// Chat message
{
  type: 'CHAT_MESSAGE',
  message: 'Hello, how can you help me?',
  idempotencyKey: 'msg_1703123456789_abc123def'
}

// Typing indicator
{
  type: 'TYPING_INDICATOR',
  isTyping: true
}

// Authentication
{
  type: 'AUTH',
  token: 'jwt_token_here'
}
```

### Incoming Messages
```javascript
// Chat response
{
  type: 'CHAT_MESSAGE',
  message: {
    id: 'server-generated-uuid',
    sender: 'assistant',
    text: 'Hello! I can help you with...',
    timestamp: '2024-01-01T12:00:00Z'
  }
}

// Status update
{
  type: 'MESSAGE_STATUS_UPDATE',
  messageId: 'msg_uuid',
  status: 'delivered'
}

// Typing indicator
{
  type: 'TYPING_INDICATOR',
  userId: 'ai',
  isTyping: true
}
```

## Error Handling

### Connection Issues
- Automatic reconnection with exponential backoff
- Max 5 reconnection attempts
- Fallback to REST API when WebSocket unavailable

### Authentication Failures
- WebSocket connection closed on auth failure
- User redirected to login page
- Clear error messages displayed

### Message Failures
- Failed WebSocket messages fall back to REST API
- User notified of connection issues
- Messages retry automatically

## Benefits

1. **Real-time Communication**: Instant message delivery and responses
2. **Reduced Latency**: No need to poll for updates
3. **Better UX**: Typing indicators, real-time status updates
4. **Reliability**: Fallback to REST API ensures messages always get through
5. **Scalability**: WebSocket reduces server load for chat operations

## Testing

### Manual Testing
1. Open browser dev tools
2. Check WebSocket connection in Network tab
3. Send messages and verify real-time responses
4. Test connection status indicator
5. Verify typing indicators work

### Console Logs
Look for these log patterns:
```
🔌 [WebSocket] Connecting to: ws://localhost:8081/ws/chat
✅ [WebSocket] Connected successfully
🔐 [WebSocket] Sending authentication
✅ [WebSocket] Authentication successful
📤 [WebSocket] Sent message: {type: 'CHAT_MESSAGE', ...}
📨 [WebSocket] Received message: {type: 'CHAT_MESSAGE', ...}
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check backend WebSocket endpoint is running
   - Verify CORS configuration
   - Check firewall/network settings

2. **Authentication Failed**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure backend validates WebSocket auth

3. **Messages Not Real-time**
   - Check WebSocket connection status
   - Verify backend sends WebSocket messages
   - Check browser console for errors

### Debug Commands
```javascript
// Check WebSocket status
console.log(store.state.websocket?.getConnectionStatus());

// Check connection state
console.log(store.getters.isWebSocketConnected);

// Force reconnection
store.dispatch('disconnectWebSocket');
store.dispatch('initializeWebSocket');
```

## Future Enhancements

1. **Message Encryption**: End-to-end encryption for sensitive conversations
2. **File Sharing**: Support for image/document sharing via WebSocket
3. **Voice Messages**: Audio message support
4. **Presence Indicators**: Show when users are online/offline
5. **Message Reactions**: Real-time emoji reactions
6. **Read Receipts**: Track message read status

## Security Considerations

1. **JWT Validation**: Backend must validate JWT tokens for WebSocket connections
2. **Rate Limiting**: Implement rate limiting for WebSocket messages
3. **Input Validation**: Validate all incoming WebSocket messages
4. **Connection Limits**: Limit concurrent WebSocket connections per user
5. **Message Sanitization**: Sanitize HTML content in messages

## Performance Optimization

1. **Connection Pooling**: Reuse WebSocket connections when possible
2. **Message Batching**: Batch multiple messages when appropriate
3. **Heartbeat**: Implement heartbeat to detect stale connections
4. **Compression**: Enable WebSocket compression for large messages
5. **Connection Timeout**: Set appropriate connection timeouts 