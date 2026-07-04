import mongoose from "mongoose";

const strokeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    tool: {
      type: String,
      enum: ["pen", "shape", "image", "text"],
      default: "pen",
    },
    // pen / shape fields
    points: {
      type: [[Number]],
      default: undefined,
    },
    color: {
      type: String,
    },
    size: {
      type: Number,
    },
    shapeType: {
      type: String,
      enum: [
        "rectangle",
        "square",
        "circle",
        "triangle",
        "diamond",
        "line",
        "arrow",
        "star",
      ],
    },
    // image fields
    imageUrl: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    // text fields
    text: {
      type: String,
    },
    fontSize: {
      type: Number,
    },
    // shared position field (used by image + text)
    x: {
      type: Number,
    },
    y: {
      type: Number,
    },
    createdAt: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);
const whiteboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Untitled",
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    strokes: [strokeSchema],
    shareCode: {
      type: String,
      unique: true,
    },
    sharedWith: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
    pendingRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    thumbnail: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);
export default Whiteboard;
