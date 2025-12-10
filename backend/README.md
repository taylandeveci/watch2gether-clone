# Watch2gether Backend

Real-time video synchronization backend built with Node.js, Express, Socket.IO, and PostgreSQL.

## Tech Stack

- Node.js v18+
- Express.js
- Socket.IO
- PostgreSQL
- Sequelize ORM

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/watch2gether
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

## Running Locally

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Room Endpoints

- `POST /api/rooms/create` - Create a new room
- `GET /api/rooms/:roomCode` - Get room details
- `DELETE /api/rooms/:roomCode` - Delete a room (admin only)
- `GET /api/rooms/:roomCode/history` - Get video history

### Video Endpoints

- `POST /api/rooms/:roomCode/video` - Add a video to the room
- `PATCH /api/rooms/:roomCode/state` - Update video state (playing/paused)

### Health Check

- `GET /api/health` - Health check endpoint

## Socket.IO Events

### Client → Server

- `join-room` - Join a room
- `leave-room` - Leave a room
- `play-video` - Play video
- `pause-video` - Pause video
- `seek-video` - Seek to position
- `change-video` - Change video URL
- `chat-message` - Send chat message
- `sync-request` - Request current state

### Server → Client

- `room-update` - Room state updated
- `video-play` - Play command
- `video-pause` - Pause command
- `video-seek` - Seek command
- `video-changed` - Video URL changed
- `chat-message` - New chat message
- `user-joined` - User joined notification
- `user-left` - User left notification
- `sync-state` - Current state sync
- `error` - Error message

## Deployment

Deploy to Render.com with the following configuration:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:** Set all variables from `.env.example`

## License

MIT
