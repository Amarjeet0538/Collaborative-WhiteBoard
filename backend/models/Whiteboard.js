import mongoose from "mongoose";

const strokeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    points: {
      type: [[Number]],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    tool: {
      type: String,
      enum: ["pen"],
      default: "pen",
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
