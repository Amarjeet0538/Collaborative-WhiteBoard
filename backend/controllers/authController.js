import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/passwordService.js";
import { generateToken } from "../services/tokenService.js";
import catchAsync from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});
