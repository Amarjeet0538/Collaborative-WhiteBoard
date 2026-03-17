import crypto from "crypto";
import Whiteboard from "../models/Whiteboard.js";

export async function generateUniqueShareCode() {
  let code;
  let exists = true;
  while (exists) {
    code = crypto.randomBytes(6).toString("base64url");
    exists = await Whiteboard.exists({ shareCode: code });
  }
  return code;
}
