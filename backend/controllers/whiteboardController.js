import Whiteboard from "../models/Whiteboard.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { generateUniqueShareCode } from "../services/shareCodeService.js";
import * as notificationService from "../services/notificationService.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

export const joinByCode = catchAsync(async (req, res) => {
  const { code } = req.params;

  const board = await Whiteboard.findOne({ shareCode: code }).select(
    "-sharedWith -pendingRequests",
  );

  if (!board) {
    throw ApiError.notFound("Board not found");
  }

  res.json(board);
});

export const getAll = catchAsync(async (req, res) => {
  const whiteboards = await Whiteboard.find({
    $or: [{ owner: req.user.id }, { "sharedWith.userId": req.user.id }],
  })
    .select("name createdAt updatedAt owner shareCode thumbnail")
    .sort({ updatedAt: -1 });

  res.json(whiteboards);
});

export const patchThumbnail = catchAsync(async (req, res) => {
  const { thumbnail } = req.body;

  const board = await Whiteboard.findOne({
    _id: req.params.id,
    $or: [
      { owner: req.user.id },
      { "sharedWith.userId": req.user.id }, // fix: was "collaborators.user"
    ],
  });

  if (!board) throw ApiError.notFound("Board not found");

  board.thumbnail = thumbnail;
  await board.save();

  res.json({ success: true });
});

export const getOne = catchAsync(async (req, res) => {
  const whiteboard = await Whiteboard.findOne({
    _id: req.params.id,
    $or: [{ owner: req.user.id }, { "sharedWith.userId": req.user.id }],
  });

  if (!whiteboard) {
    throw ApiError.notFound("Whiteboard not found");
  }

  res.json(whiteboard);
});

export const create = catchAsync(async (req, res) => {
  const { name } = req.body;
  const shareCode = await generateUniqueShareCode();

  const whiteboard = await Whiteboard.create({
    name: name || "Untitled",
    owner: req.user.id,
    strokes: [],
    shareCode,
  });

  res.status(201).json(whiteboard);
});

export const update = catchAsync(async (req, res) => {
  const { strokes, name } = req.body;

  const whiteboard = await Whiteboard.findOneAndUpdate(
    {
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        {
          sharedWith: { $elemMatch: { userId: req.user.id, role: "editor" } },
        },
      ],
    },
    { strokes, name },
    { new: true },
  );

  if (!whiteboard) {
    throw ApiError.notFound("Whiteboard not found or not authorized");
  }

  res.json(whiteboard);
});

export const remove = catchAsync(async (req, res) => {
  const whiteboard = await Whiteboard.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!whiteboard) {
    throw ApiError.notFound("Whiteboard not found");
  }

  res.json({ message: "Deleted successfully" });
});

export const requestAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  const board = await Whiteboard.findById(id);

  if (!board) {
    throw ApiError.notFound("Board not found");
  }

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const alreadyRequested = board.pendingRequests.some((r) =>
    r.userId?.equals(userId),
  );
  const alreadyShared = board.sharedWith.some((s) => s.userId?.equals(userId));

  if (alreadyRequested || alreadyShared) {
    throw ApiError.badRequest("Already requested or has access");
  }

  const lastPendingReq = board.pendingRequests[board.pendingRequests.length - 1];

  board.pendingRequests.push({ userId });
  await board.save();

  const sender = await User.findById(req.user.id).select("name");
  const owner = await User.findById(board.owner).select("name");

  await notificationService.createNotification({
    recipient: board.owner,
    sender: req.user.id,
    board: board._id,
    type: "request_received",
    message: `${sender.name} has requested access to your board "${board.name}"`,
    actionData: {
      requestId: lastPendingReq._id,
    },
  });

  res.json({ message: "Request sent successfully" });
});

export const respondToRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { requestId, approve } = req.body;

  const board = await Whiteboard.findById(id);
  if (!board) {
    throw ApiError.notFound("Board not found");
  }

  if (!board.owner.equals(req.user.id)) {
    throw ApiError.forbidden("Only the owner can respond to requests");
  }

  const pendingReq = board.pendingRequests.find(
    (r) => r._id.toString() === requestId.toString(),
  );

  if (!pendingReq) {
    throw ApiError.badRequest("Request not found");
  }

  board.pendingRequests = board.pendingRequests.filter(
    (r) => r._id.toString() !== requestId.toString(),
  );

  if (approve) {
    board.sharedWith.push({ userId: pendingReq.userId, role: "editor" });
  }

  await board.save();

  const requester = await User.findById(pendingReq.userId).select("name");
  const owner = await User.findById(req.user.id).select("name");

  await notificationService.createNotification({
    recipient: pendingReq.userId,
    sender: req.user.id,
    board: board._id,
    type: approve ? "request_approved" : "request_denied",
    message: approve
      ? `Your request to join "${board.name}" was approved by ${owner.name}`
      : `Your request to join "${board.name}" was denied`,
    actionData: {
      role: approve ? "editor" : undefined,
    },
  });

  res.json({
    message: approve ? "Access granted" : "Request denied",
  });
});
