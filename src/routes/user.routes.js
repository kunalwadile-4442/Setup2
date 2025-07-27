import { Router } from "express";
import {jwtVerify} from  "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { updateUserPassword, updateUserProfile ,getAllUsers, getUserProfile} from "../controllers/user.controller.js";
import { verifyRole } from "../middlewares/roleVerify.middleware.js";


const router = Router();

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
router.get("/", jwtVerify, verifyRole(["admin"]), getAllUsers);
router.get("/profile", jwtVerify, getUserProfile);

export default router;
