# Watch2gether Frontend

Real-time video synchronization frontend built with React, Vite, Tailwind CSS, and Socket.IO.

## Tech Stack

- React 18+
- Vite
- Tailwind CSS
- Socket.IO Client
- Zustand (State Management)
- React Player
- React Router v6

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Running Locally

```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Features

- Create and join rooms with unique codes
- Real-time video synchronization
- Live chat
- Support for YouTube, Vimeo, and direct video links
- Admin controls
- Participant list
- Video history
- Responsive mobile design

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

**Build Settings:**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## License

MIT
