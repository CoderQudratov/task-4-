import { Router } from "express";
import { auth } from "../middleware/auth";

import {
  getUsers,
  blockUsers,
  unblockUsers,
  deleteUsers,
  deleteUnverifiedUsers,
} from "../controllers/user.controller";

const router = Router();

router.get("/", auth, getUsers);

router.patch("/block", auth, blockUsers);

router.patch("/unblock", auth, unblockUsers);

router.delete("/", auth, deleteUsers);
router.delete(
  "/delete-unverified",
  auth,
  deleteUnverifiedUsers
);

export default router;