import express from "express";
import {
  joinByCode,
  getAll,
  getOne,
  create,
  update,
  remove,
  requestAccess,
  respondToRequest,
  patchThumbnail,
} from "../controllers/whiteboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  whiteboardIdValidation,
  shareCodeValidation,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/join/:code", shareCodeValidation, joinByCode);

router.use(protect);

router.get("/", getAll);
router.get("/:id", whiteboardIdValidation, getOne);
router.post("/", create);
router.put("/:id", whiteboardIdValidation, update);
router.delete("/:id", whiteboardIdValidation, remove);
router.post("/:id/request-access", whiteboardIdValidation, requestAccess);
router.post("/:id/respond-request", respondToRequest);
router.patch("/:id/thumbnail", whiteboardIdValidation, patchThumbnail);
export default router;
