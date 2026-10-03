import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateProfile, updateAvatar, googleAuth, } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.put( "/avatar", protectRoute, upload.single("avatar"), updateAvatar);

export default router;
