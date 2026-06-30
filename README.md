# RealTime Collaborative Whiteboard

A real-time collaborative whiteboard app where multiple users can draw, sketch, and brainstorm together — with a built-in ML model that recognizes hand-drawn shapes and snaps them into clean geometric forms.

---

## Features

- **Real-time collaboration** — multiple users can draw on the same board simultaneously, with live cursor tracking and presence indicators
- **Drawing tools** — freehand pen, eraser, and shape tools (rectangle, circle, triangle, line, arrow, diamond, star)
- **AI shape recognition** — draw a rough shape and hold; a CNN trained on the Google QuickDraw dataset snaps it into a clean geometric form
- **Undo / Redo** — full history stack, also synced across collaborators
- **Pan & Zoom** — infinite canvas with pinch-to-zoom and spacebar-to-pan support
- **Board sharing** — share boards via a unique code; grant viewer or editor roles
- **Notifications** — access request system with in-app notifications
- **Persistence** — boards auto-save to MongoDB, including a thumbnail preview
- **Dark mode** — theme toggle baked in

---

## Tech Stack

**Frontend**

- React 19 + Vite
- Tailwind CSS + shadcn/ui
- Socket.io client
- Framer Motion

**Backend**

- Node.js + Express 5
- Socket.io
- MongoDB + Mongoose
- JWT authentication

**ML Server**

- Python + FastAPI
- TensorFlow / Keras CNN
- Trained on Google QuickDraw dataset (circle, square, triangle, line)

---

## Project Structure

```
Whiteboard/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── components/    # UI components (Canvas, Toolbar, BoardHeader, etc.)
│       ├── hooks/         # useCanvas, useCamera, useBoardSocket, useHistory, ...
│       ├── pages/         # Login, Home, WhiteboardPage, AccountSettings
│       ├── api/           # Axios API clients
│       └── utils/         # Shape recognizer, geometry helpers, constants
├── backend/           # Express + Socket.io server
│   ├── controllers/   # Auth, whiteboard, notification logic
│   ├── models/        # Mongoose schemas (User, Whiteboard, Notification)
│   ├── routes/        # REST endpoints
│   ├── socket/        # Socket event handlers
│   └── services/      # Token, password, share-code utilities
└── pythonServer/      # FastAPI ML inference server
    ├── main.py        # /api/recognize endpoint
    ├── preprocess.py  # Stroke resampling & normalization
    ├── train.py       # CNN training script
    └── shape_model.keras
```

---

## Getting Started

### Prerequisites

- Node.js + pnpm
- MongoDB instance
- Python 3.10+

### Backend

```bash
cd backend
pnpm install
```

Create a `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
pnpm dev
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Create a `.env.local` pointing to your backend URL if needed.

### Python ML Server

```bash
cd pythonServer
pip install fastapi uvicorn tensorflow numpy pydantic
uvicorn main:app --reload --port 8000
```

> The `shape_model.keras` file is already included. If you want to retrain, place the QuickDraw `.ndjson` files in `pythonServer/dataset/` and run `python train.py`.

---

## How Shape Recognition Works

When you finish drawing a stroke, the canvas sends the raw `[x, y]` points to the Python server. The server resamples them to 64 points, normalizes the size, and passes the result through a CNN trained on 10,000 samples per shape class. If the model's confidence exceeds 60%, it returns the predicted shape type and the frontend snaps your drawing to a clean geometric version.

---

## License

ISC
