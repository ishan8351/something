import { Router } from "express";
import { loginUser, registerUser, getAllUsers, updateUserRole } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Admin Routes (Kept open for your demo)
router.route("/admin/all").get(getAllUsers);
router.route("/admin/:id/role").put(updateUserRole);

export default router;