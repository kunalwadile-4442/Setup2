import { Router } from "express";
import {
    forgotPassword,
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserPassword,
  updateUserProfile,
  verifyOtp,
} from "../controllers/user.controller.js";
import {jwtVerify} from  "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(jwtVerify,logoutUser);


//  Frontend pending apis 
router.route("/update-profile").patch(
  jwtVerify,
  upload.fields([
    { name: "profilePicture", maxCount: 1 }
  ]),
  updateUserProfile
);
// Passsword update route
router.route("/update-password").patch(jwtVerify, updateUserPassword);

router.route("/forgot-password").post(forgotPassword); 
router.route("/verify-otp").post(verifyOtp); 
router.route("/reset-password").post(resetPassword); 
router.route("/users").get(getAllUsers);

export default router;
