import express from "express";
import Whiteboard from "../models/Whiteboard.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below are protected
router.use(protect);

// GET all whiteboards for logged-in user
router.get("/", async (req, res) => {
  try {
    const whiteboards = await Whiteboard.find({ owner: req.user.id })
      .select("name createdAt updatedAt") // don't send strokes in list
      .sort({ updatedAt: -1 });
    res.json(whiteboards);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single whiteboard by id
router.get("/:id", async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!whiteboard) return res.status(404).json({ message: "Not found" });
    res.json(whiteboard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create new whiteboard
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const shareCode = await generateUniqueShareCode();
    const whiteboard = await Whiteboard.create({
      name: name || "Untitled",
      owner: req.user.id,
      strokes: [],
      shareCode,
    });
    res.status(201).json(whiteboard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT save strokes to whiteboard
router.put("/:id", async (req, res) => {
  try {
    const { strokes, name } = req.body;
    const whiteboard = await Whiteboard.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { strokes, name },
      { new: true },
    );
    if (!whiteboard) return res.status(404).json({ message: "Not found" });
    res.json(whiteboard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE whiteboard
router.delete("/:id", async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!whiteboard) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/join/:code", async (req, res) => {
  try {
    const board = await Whiteboard.findOne({
      shareCode: req.params.code,
    }).select("-sharedWith -pendingRequests");
    if (!board) res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/request-access", async (req, res) => {
  try {
    const board = await Whiteboard.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    const userId = req.user._id;

    const alreadyRequested = board.pendingRequests.some((r) =>
      r.userId.equals(userId),
    );
    const alreadyShared = board.sharedWith.some((s) => s.userId.equals(userId));

    if (alreadyRequested || alreadyShared)
      return res
        .status(400)
        .json({ message: "Already requested or has access" });

    board.pendingRequests.push({ userId });
    await board.save();
    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/response-request", async (req, res) => {
  try {
    const { userId, approve } = req.body;
    const board = await Whiteboard.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    if (!board.owner.equals(req.user._id))
      return res.status(403).json({ message: "Not the owner" });

    board.pendingRequests = board.pendingRequests.filter(
      (r) => !r.userId.equals(userId),
    );

    if (approve) {
      board.sharedWith.push({ userId, role: "editor" });
    }

    await board.save();
    res.json({ message: approve ? "Access granted" : "Request denied" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
