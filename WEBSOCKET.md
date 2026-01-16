# WebSocket

## Event Listeners

- `session:joined` - When user joins a session
- `whiteboard:update` - When whiteboard data changes
- `message:new` - When new message is posted
- `quiz:answer` - When student submits quiz answer
- `session:ended` - When instructor ends session

## Best Practices

- Implement heartbeat mechanism for connection health
- Handle reconnection with exponential backoff
- Validate all incoming messages from clients
- Use namespaces for different event types
- Implement message compression for large payloads
