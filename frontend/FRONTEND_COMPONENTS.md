# Frontend Components - Complete Implementation

## Directory Structure
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── session/
│   │   ├── [id]/page.tsx
│   │   └── create/page.tsx
│   └── dashboard/page.tsx
├── components/
│   ├── Whiteboard.tsx
│   ├── ChatBox.tsx
│   ├── SessionCard.tsx
│   ├── QuizModal.tsx
│   ├── DoubtsPanel.tsx
│   └── Navbar.tsx
├── hooks/
│   ├── useSocket.ts
│   └── useAuth.ts
├── stores/
│   └── sessionStore.ts
├── lib/
│   ├── api.ts
│   └── socket.ts
└── styles/
    └── globals.css
```

## 1. app/layout.tsx
```typescript
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Peer Learning Platform',
  description: 'Real-time collaborative learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

## 2. app/page.tsx (Home)
```typescript
'use client';
import { useState, useEffect } from 'react';
import SessionCard from '@/components/SessionCard';
import { Play, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Peer Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">Learn together, grow together</p>
          <div className="flex gap-4 justify-center">
            <Link href="/session/create" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
              <Plus size={20} /> Start Session
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold">
              <Play size={20} /> My Sessions
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.slice(0, 6).map(session => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>

        {sessions.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No sessions yet. Create one to get started!</p>
          </div>
        )}
      </section>
    </div>
  );
}
```

## 3. components/Whiteboard.tsx
```typescript
'use client';
import { useRef, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { RotateCcw, Trash2 } from 'lucide-react';

interface DrawPoint {
  x: number;
  y: number;
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setContext(ctx);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle incoming drawing from others
    socket?.on('drawing:draw', (point: DrawPoint) => {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + 1, point.y + 1);
      ctx.stroke();
    });

    socket?.on('drawing:clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }, [socket]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.lineTo(x, y);
    context.stroke();
    socket?.emit('drawing:draw', { x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit('drawing:clear');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Whiteboard</h3>
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <Trash2 size={18} /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border-2 border-gray-300 w-full h-96 bg-white cursor-crosshair rounded"
      />
    </div>
  );
}
```

## 4. components/ChatBox.tsx
```typescript
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket?.on('chat:message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: 'You',
      text: input,
      timestamp: new Date(),
    };

    socket?.emit('chat:message', message);
    setMessages(prev => [...prev, message]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-96">
      <h3 className="text-lg font-semibold mb-4">Chat</h3>
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-sm text-gray-700">{msg.user}</p>
            <p className="text-gray-600">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
```

## 5. hooks/useSocket.ts
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true,
      });
    }

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      // Don't disconnect on unmount
    };
  }, []);

  return { socket, isConnected };
}
```

## 6. lib/api.ts
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 7. styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-white text-gray-900;
}

a {
  @apply text-blue-600 hover:text-blue-800;
}

button {
  @apply transition-colors duration-200;
}
```

## Installation Steps
```bash
cd frontend
npm install
npm run dev
```

## Key Features
- Real-time whiteboard collaboration with Canvas API
- Live chat with Socket.io
- Authentication with JWT tokens
- Responsive design with TailwindCSS
- Server-side rendering with Next.js
- Type-safe with TypeScript
