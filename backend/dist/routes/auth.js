"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
// IMPORTANT: auth middleware validates the JWT cookie before me() runs
router.get("/me", auth_1.auth, auth_controller_1.me);
router.get("/verify/:token", auth_controller_1.verifyEmail);
exports.default = router;
