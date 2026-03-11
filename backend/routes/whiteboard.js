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
    const whiteboard = await Whiteboard.create({
      name: name || "Untitled",
      owner: req.user.id,
      strokes: [],
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

export default router;
