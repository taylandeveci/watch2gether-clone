# WatchTogether - Full Stack Application

A complete real-time video watching platform where users can create rooms, share video URLs (YouTube, Vimeo, direct links), and watch synchronized videos together with live chat.

## 🚀 Features

- **Real-time Video Synchronization** - Watch videos in perfect sync with friends
- **Multiple Video Sources** - Support for YouTube, Vimeo, and direct video links
- **Live Chat** - Real-time messaging while watching
- **Room Management** - Create and join rooms with unique codes
- **Admin Controls** - Room creators have video playback control
- **Participant Management** - See who's watching with you
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Beautiful dark theme with Tailwind CSS

## 📋 Tech Stack

### Backend

- Node.js v18+
- Express.js
- Socket.IO (Real-time communication)
- PostgreSQL (Database)
- Sequelize ORM
- JWT Authentication
- Input validation (Joi)
- Security (Helmet, CORS, Rate Limiting)

### Frontend

- React 18+
- Vite (Build tool)
- Tailwind CSS (Styling)
- Socket.IO Client
- Zustand (State management)
- React Router v6
- React Player (Video playback)
- React Hook Form + Zod (Form validation)
- Axios (HTTP client)
- React Hot Toast (Notifications)
- Lucide React (Icons)

## 📁 Project Structure

```
watch2gether-clone/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database and socket configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   │   ├── ui/        # Reusable UI components
    │   │   ├── layout/    # Layout components
    │   │   ├── video/     # Video player components
    │   │   ├── chat/      # Chat components
    │   │   └── room/      # Room-related components
    │   ├── pages/         # Page components
    │   ├── stores/        # Zustand stores
    │   ├── hooks/         # Custom React hooks
    │   ├── services/      # API and socket services
    │   ├── utils/         # Utility functions
    │   ├── App.jsx        # Main app component
    │   ├── main.jsx       # Entry point
    │   └── index.css      # Global styles
    ├── package.json
    └── .env.example
```

## 🛠️ Installation

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd watch2gether-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/watch2gether
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

Create a PostgreSQL database:

```bash
createdb watch2gether
```

The tables will be created automatically when you start the backend server.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📦 Production Deployment

### Backend (Render.com)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all variables from `.env.example`

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy:
   ```bash
   cd frontend
   vercel
   ```
3. Add environment variables in Vercel dashboard

### Database (Supabase)

1. Create a new project on Supabase
2. Get the PostgreSQL connection string
3. Update `DATABASE_URL` in backend environment variables

## 🎮 Usage

1. **Create a Room**

   - Click "Create Room" on the homepage
   - Enter room name and your name
   - Share the generated room code with friends

2. **Join a Room**

   - Click "Join Room"
   - Enter the room code and your name
   - Start watching together!

3. **Add Videos**

   - Paste a YouTube, Vimeo, or direct video URL
   - Only the admin (room creator) can control playback
   - All participants stay synchronized

4. **Chat**
   - Send messages in real-time
   - See who joins or leaves
   - Stay connected while watching

## 🔧 API Endpoints

### Rooms

- `POST /api/rooms/create` - Create a new room
- `GET /api/rooms/:roomCode` - Get room details
- `DELETE /api/rooms/:roomCode` - Delete a room (admin only)
- `GET /api/rooms/:roomCode/history` - Get video history

### Videos

- `POST /api/rooms/:roomCode/video` - Add video to room
- `PATCH /api/rooms/:roomCode/state` - Update video state

### Health

- `GET /api/health` - Health check

## 🔌 Socket.IO Events

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

## 🛡️ Security Features

- Helmet.js for HTTP headers security
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- XSS protection
- SQL injection prevention (Sequelize ORM)

## 🎨 Design Features

- Modern dark theme
- Glassmorphism effects
- Smooth animations and transitions
- Responsive mobile-first design
- Custom scrollbars
- Loading states and error handling
- Toast notifications

## 📝 Environment Variables

### Backend

```env
NODE_ENV          # development | production
PORT              # Server port (default: 5000)
DATABASE_URL      # PostgreSQL connection string
JWT_SECRET        # Secret key for JWT tokens
CORS_ORIGIN       # Allowed frontend origin
RATE_LIMIT_MAX    # Max requests per window
RATE_LIMIT_WINDOW # Rate limit window in minutes
```

### Frontend

```env
VITE_API_URL      # Backend API URL
VITE_SOCKET_URL   # Socket.IO server URL
```

## 🧪 Testing

Run tests (when implemented):

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React Player for video playback support
- Socket.IO for real-time communication
- Tailwind CSS for beautiful styling
- All open-source libraries used in this project

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ for watching together
