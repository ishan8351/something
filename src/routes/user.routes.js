import { Router } from "express";
import { loginUser, registerUser, sendSignupOtp, sendLoginOtp, loginWithOtp, getAllUsers, updateUserRole } from "../controllers/user.controller.js";

const router = Router();

router.route("/send-otp").post(sendSignupOtp); 
router.route("/send-login-otp").post(sendLoginOtp); // New
router.route("/login-otp").post(loginWithOtp);      // New
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/admin/all").get(getAllUsers);
router.route("/admin/:id/role").put(updateUserRole);

export default router;