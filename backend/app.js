import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import whiteboardRoutes from "./routes/whiteboard.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socketHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
const httpServer = createServer(app);

// const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
// 	Boolean,
// );

const allowedOrigins = [
	"http://localhost:5173",
	"https://collaborative-white-board-iota.vercel.app",
];

const io = new Server(httpServer, {
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
});

app.use((req, res, next) => {
	const origin = req.headers.origin;

	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS",
		);
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);
	}

	if (req.method === "OPTIONS") {
		return res.sendStatus(204);
	}

	next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/whiteboards", whiteboardRoutes);

initSocket(io);

mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log("Connected to MongoDB");
		httpServer.listen(PORT, () =>
			console.log(`Server running on port ${PORT}`),
		);
	})
	.catch((err) => console.error("MongoDB connection error:", err));
