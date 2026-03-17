import mongoose from "mongoose";

const strokeSchema = new mongoose.Schema(
  {
    points: [[Number]],
    color: String,
    size: Number,
    composite: String,
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
  },
  { timestamps: true },
);

const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);
export default Whiteboard;
