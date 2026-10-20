# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

always use edit/update tool for files, so that we can rewind command in cli to rewind stuff, incase it get bad, instead of editing using shell command

when ever you are told to implement any features, always ask questions and interview me relentlessly using askquestionstool, until you have the topic or features completey clear, no doubts

do not do any commit and push to prod, until U are told to do

## Overview

Real-time collaborative whiteboard. Three independently run services, no root package/workspace:

- `frontend/` — React 19 + Vite, Tailwind v4, shadcn/ui (JS/JSX only, no TypeScript). Deployed on Vercel (`vercel.json` SPA rewrite) at `https://lienwand.vercel.app`.
- `backend/` — Express 5 + Socket.io + Mongoose, ES modules. JWT auth, Cloudinary for image/thumbnail storage.
- `pythonServer/` — FastAPI + Keras CNN that classifies a hand-drawn stroke as circle/square/triangle/line.

Product/technical specs live in `Docs/` (PRD.md, TRD.md, ProjectDetails.md, TODO.md).

## Commands

Package manager is pnpm. There are no tests anywhere in the repo.

```bash
# backend (needs backend/.env — see backend/.env.example: MONGO_URL, JWT_SECRET, PORT, CLIENT_URL, CLOUDINARY_*)
cd backend && pnpm install && pnpm dev      # nodemon app.js, port 5000

# frontend (env: VITE_API_URL, VITE_ML_API_URL; defaults to localhost:5000 / 127.0.0.1:8000)
cd frontend && pnpm install && pnpm dev     # vite, port 5173
cd frontend && pnpm lint                    # eslint
cd frontend && pnpm build

# ML server (optional FRONTEND_URL env for CORS)
cd pythonServer && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
cd pythonServer && python train.py          # retrain; needs QuickDraw .ndjson files in pythonServer/dataset/
```

## Architecture

### Data model

A board (`backend/models/Whiteboard.js`) stores its whole content as one embedded `strokes` array. Every drawn element — pen stroke, shape, image, text — is a "stroke" distinguished by `tool` (`pen|shape|image|text`) with tool-specific fields (`points`, `shapeType`, `imageUrl`, `text`, `x/y/width/height`…). Adding a new element type means updating this schema's enums/fields as well as the frontend renderer. Sharing uses a 6-char `shareCode`, `sharedWith[{userId, role}]` and `pendingRequests`; approved requests are granted the `editor` role.

### Persistence vs. realtime are separate paths

- **Persistence is REST only.** `WhiteboardPage.handleStrokesChange` debounces (1s, `useWhiteboard.debouncedSave`) a `PUT /api/whiteboards/:id` with the _full_ strokes array, then uploads a canvas-rendered JPEG thumbnail to `POST /:id/thumbnail` (→ Cloudinary). Images are uploaded via `POST /:id/upload-image` (multer memory storage → Cloudinary) and stored as URLs.
- **Socket.io is a stateless relay** (`backend/socket/socketHandler.js`). It keeps in-memory presence per board (`boardUsers`) and relays `join-board`, `leave-board`, `stroke-update`, `board-sync`, `cursor-move`, emitting `presence-update` / `cursor-leave`. It never writes to MongoDB.
- Sockets are authenticated by an `io.use` middleware that verifies `handshake.auth.token` (JWT) and sets `socket.data.userId`. `join-board` checks board access in the DB and takes the username from `User`, not the client. `stroke-update` / `board-sync` are dropped for sockets that haven't joined or are `viewer`s.
- `stroke-update` carries one added stroke. `board-sync` (`{ boardId, strokes }`) carries the full array and is sent on erase, undo and redo; undo/redo also save via `persistStrokes` in `WhiteboardPage.jsx`.

### Frontend structure

- `api/client.js` `apiFetch` wraps `fetch`, reads the JWT from `localStorage` and adds `Authorization: Bearer`. Per-resource clients are in `api/*.api.js`.
- Global state is React context (`context/`: Auth, Socket, Theme, Toast; context objects themselves are declared in `AllContexts.jsx`), consumed via hooks in `hooks/`.
- Canvas logic lives in hooks, not components: `useCanvas` (drawing, erasing, hold-to-snap shape recognition), `useCamera` (pan/zoom, limits in `utils/constants.js` `ZOOM`), `useHistory` (undo/redo as snapshots of the full strokes array), `useBoardSocket` (initial board load + socket listeners).
- `@/` aliases `frontend/src`.

### Shape recognition flow

Holding still at the end of a stroke (`useCanvas` hold timer) calls `utils/shapeRecognizer.recognizeShape` → `POST {VITE_ML_API_URL}/api/recognize` with `{points}`. The server resamples/normalizes (`preprocess.py`) and returns a class if confidence > 60%; the frontend then replaces the stroke with clean geometry from `utils/shapeGeometry.js`. `CATEGORIES` in `main.py` must match the class order used in `train.py`.

### Backend conventions

- Controllers are wrapped in `utils/catchAsync`; throw `ApiError` (with `isOperational`) for client-facing errors — non-operational errors are masked as 500 unless `NODE_ENV=development`.
- Validation uses express-validator chains in `middleware/validationMiddleware.js`, ending with `validate`.
- `protect` middleware puts the decoded JWT (`{ id }`) on `req.user`.
- CORS is hand-rolled in `app.js` and in `config/socket.js`, both driven by `ALLOWED_ORIGINS` in `utils/constants.js`, which is parsed from the comma-separated `CLIENT_URL` env (default `http://localhost:5173`). Its first entry is also the OAuth redirect target. The Python server reads a comma-separated `FRONTEND_URL` the same way.
