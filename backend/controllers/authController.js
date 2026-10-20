import crypto from "crypto";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/passwordService.js";
import { generateToken } from "../services/tokenService.js";
import { getProvider } from "../services/oauthService.js";
import catchAsync from "../utils/catchAsync.js";

const OAUTH_STATE_COOKIE = "oauth_state";

const readCookie = (req, name) => {
  const match = (req.headers.cookie || "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([key]) => key === name);
  return match ? decodeURIComponent(match[1]) : null;
};

const redirectToClient = (res, path) =>
  res.redirect(`${process.env.CLIENT_URL.replace(/\/$/, "")}${path}`);

export const oauthStart = catchAsync(async (req, res) => {
  const provider = getProvider(req.params.provider);
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(provider.authUrl(state));
});

export const oauthCallback = async (req, res) => {
  const { provider: providerName } = req.params;
  const { code, state, error } = req.query;
  const expectedState = readCookie(req, OAUTH_STATE_COOKIE);
  res.clearCookie(OAUTH_STATE_COOKIE);

  try {
    if (error) throw new Error(error);
    if (!code || !state || state !== expectedState) {
      throw new Error("Invalid OAuth state");
    }

    const provider = getProvider(providerName);
    const profile = await provider.getProfile(code);
    const idField = `${providerName}Id`;

    // Match on provider id first, then link by (provider-verified) email
    let user =
      (await User.findOne({ [idField]: profile.providerId })) ||
      (await User.findOne({ email: profile.email.toLowerCase() }));

    if (user) {
      if (!user[idField]) {
        user[idField] = profile.providerId;
        await user.save();
      }
    } else {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        [idField]: profile.providerId,
        ...(profile.avatar && { profilePicture: profile.avatar }),
      });
    }

    // Token goes in the fragment so it never reaches server logs
    redirectToClient(res, `/oauth/callback#token=${generateToken(user._id)}`);
  } catch (err) {
    console.error(`OAuth ${providerName} error:`, err.message);
    redirectToClient(res, "/login?error=oauth_failed");
  }
};

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

  if (!user.password) {
    return res.status(401).json({
      message: "This account uses Google or GitHub sign-in",
    });
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
