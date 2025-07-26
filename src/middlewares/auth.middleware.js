import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { MESSAGES, STATUS_CODE } from "../constants.js";
import asyncHandler from "../utils/asyncHandler.js";


 export const jwtVerify = asyncHandler(async (req, res, next) => {
   try {
     const token =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace(/Bearer\s+/i, ""); 
     if (!token) {
         throw new ApiError(
         STATUS_CODE.UNAUTHORIZED,
         MESSAGES.UNAUTHORIZED_ACCESS
       );
     }

     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

     if (!decoded) {
       throw new ApiError(
         STATUS_CODE.UNAUTHORIZED,
         MESSAGES.INVALID_ACCESS_TOKEN
       );
     }
     const user = await User.findById(decoded._id).select(
       "-password -refreshToken"
     );
     if (!user) {
       throw new ApiError(
         STATUS_CODE.UNAUTHORIZED,
         MESSAGES.UNAUTHORIZED_ACCESS
       );
     }
     req.user = user;
     next();
   } catch (error) {
     console.error("JWT verification error:", error);
     throw new ApiError(
       STATUS_CODE.UNAUTHORIZED,
       MESSAGES.INVALID_ACCESS_TOKEN
     );
   }
 });
