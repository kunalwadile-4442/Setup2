import { Router } from "express";
import {
    forgotPassword,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    verifyOtp,
} from "../controllers/auth.controller.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(jwtVerify,logoutUser);

// Passsword update route

router.route("/forgot-password").post(forgotPassword); 
router.route("/verify-otp").post(verifyOtp); 
router.route("/reset-password").post(resetPassword); 

export default router;
