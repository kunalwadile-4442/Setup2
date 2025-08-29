// handlers/userSocketHandlers.js
import { User } from "../../models/user.model.js";
import { checkPermission } from "../utils/checkPermission.js";
import { SuccessSocketResponse, ErrorSocketResponse } from "../utils/stdScoketResponse.js";

export const userSocketHandlers = (socket, io) => {
  socket.on("action", async (req) => {
    try {
      if (req.type === "profile") {
        const userId = socket.user._id;

        // GET PROFILE
        if (req.action === "getProfile") {
          const hasPermission = await checkPermission(socket, "profile:read");
          if (!hasPermission.success) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: hasPermission.message,
              statusCode: 403,
            });
          }

          const user = socket.user;
          return SuccessSocketResponse(socket, {
            request: req,
            msg: "Profile fetched successfully",
            data: {
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              username: user.username,
              profilePicture: user.profilePicture,
              role: user.role,
            },
          });
        }

        // UPDATE PROFILE
        if (req.action === "updateProfile") {
          const hasPermission = await checkPermission(socket, "profile:write");
          if (!hasPermission.success) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: hasPermission.message,
              statusCode: 403,
            });
          }

          const payload = req.payload; // { fullName, email, username, profilePicture }

          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: payload },
            { new: true }
          ).lean();

          if (!updatedUser) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: "User not found",
              statusCode: 404,
            });
          }

          return SuccessSocketResponse(socket, {
            request: req,
            msg: "Profile updated successfully",
            data: updatedUser,
          });
        }

      
      }

      // Unknown type
     
    } catch (error) {
      return ErrorSocketResponse(socket, {
        request: req,
        msg: error.message || "Internal Server Error",
        statusCode: 500,
      });
    }
  });
};
