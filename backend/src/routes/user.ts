import { Router } from "express";
import { auth } from "../middleware/auth";

import {
  getUsers,
  blockUsers,
  unblockUsers,
  deleteUsers,
} from "../controllers/user.controller";

const router = Router();

router.get("/", auth, getUsers);

router.patch("/block", auth, blockUsers);

router.patch("/unblock", auth, unblockUsers);

router.delete("/", auth, deleteUsers);

export default router;