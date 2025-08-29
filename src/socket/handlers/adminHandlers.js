import { User } from "../../models/user.model.js";
import { checkPermission } from "../utils/checkPermission.js";
import { SuccessSocketResponse, ErrorSocketResponse } from "../utils/stdScoketResponse.js";
import {paginate} from "../utils/wspaginationHelper.js"

export const adminSocketHandlers = (socket, io) => {
  socket.on("action", async (req) => {
    try {
      console.log("admin req",req);
     
      if (req.type === "admin") {
        const userId = socket.user._id;

       if (req.action === "getallUsers") {
        const hasPermission = await checkPermission(socket, "users:read");
        if (!hasPermission.success) {
          return ErrorSocketResponse(socket, {
            request: req,
            msg: hasPermission.message,
            statusCode: 403,
          });
        }

        const { page, limit, sort, query } = req.payload || {};
        const filters = { role: "user" };

          // Add search query filter if query is provided
          if (query) {
            filters.$or = [
              { fullName: { $regex: query, $options: "i" } }, // Case-insensitive search
              { email: { $regex: query, $options: "i" } },
              { username: { $regex: query, $options: "i" } },
            ];
          }

          try {
            const result = await paginate(User, {
              page,
              limit,
              filters,
              sort,
              projection: {
                _id: 1,
                fullName: 1,
                email: 1,
                username: 1,
                profilePicture: 1,
                role: 1,
              },
            });

            return SuccessSocketResponse(socket, {
              request: req,
              msg: "Users fetched successfully",
              data: {
                items: result.items,
                pagination: result.pagination,
              },
            });
          } catch (err) {
            console.error("getallUsers error:", err);
            return ErrorSocketResponse(socket, {
              request: req,
              msg: "Failed to fetch users",
              statusCode: 500,
              errors: [err.message],
            });
          }
        }

        // USER MONITORING
        if (req.action === "monitorUsers") {
          const hasPermission = await checkPermission(socket, "system:monitor");
          if (!hasPermission.success) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: hasPermission.message,
              statusCode: 403,
            });
          }

          const connectedSockets = await io.fetchSockets()
          const onlineUsers = connectedSockets.length
          const totalUsers = await User.countDocuments({ role: "user" })
          const totalAdmins = await User.countDocuments({ role: "admin" })

          return SuccessSocketResponse(socket, {
            request: req,
            msg: "System stats fetched",
            data: {
              onlineUsers,
              totalUsers,
              totalAdmins,
              timestamp: new Date(),
            },
          });
        }

        if(req.action ==="broadcast"){
          const hasPermission = await checkPermission(socket, "users:write");
          if (!hasPermission.success) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: hasPermission.message,
              statusCode: 403,
            });
          }

          const { message, type = "info" } = req.payload;
          io.emit("notification", { type, message, from: "admin", timestamp: new Date() });

          return SuccessSocketResponse(socket, {
            request: req,
            msg: "Message broadcasted successfully",
            data: { message, type },
          });
        }

        if(req.action ==="deleteUser"){
          const hasPermission = await checkPermission(socket, "users:delete");
          if (!hasPermission.success) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: hasPermission.message,
              statusCode: 403,
            });
          }

          const { userId } = req.payload;
          const user = await User.findByIdAndDelete(userId);

          if (!user) {
            return ErrorSocketResponse(socket, {
              request: req,
              msg: "User not found",
              statusCode: 404,
            });
          }

          socket.to("admin_room").emit("user:deleted", {
            deletedUser: user.username,
            deletedBy: socket.user.username,
            timestamp: new Date(),
          });

          return SuccessSocketResponse(socket, {
            request: req,
            msg: "User deleted successfully",
            data: { deletedUser: user.username },
          });
        }

        if(req.action === "createUser"){
            const hasPermission = await checkPermission(socket, "users:write");
            if (!hasPermission.success) {
              return ErrorSocketResponse(socket, {
                request: req,
                msg: hasPermission.message,
                statusCode: 403,
              });
            }

            const { fullName, email, username, password="123456", role = "user" } = req.payload;

            // Basic validation
            if (!fullName || !email || !username ) {
              return ErrorSocketResponse(socket, {
                request: req,
                msg: "Missing required fields",
                statusCode: 400,
              });
            }

            // Check for existing user
            const existingUser = await User.findOne({
              $or: [{ email }, { username }],
            });
            if (existingUser) {
              return ErrorSocketResponse(socket, {
                request: req,
                msg: "Email or username already in use",
                statusCode: 409,
              });
            }

            // Create new user
            const newUser = new User({ fullName, email, username, password, role });
            await newUser.save();

            return SuccessSocketResponse(socket, {
              request: req,
              msg: "User created successfully",
              data: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
              },
            });
          }


            if(req.action === "userUpdate"){
              const hasPermission = await checkPermission(socket, "users:update");
              if (!hasPermission.success) {
                return ErrorSocketResponse(socket, {
                  request: req,
                  msg: hasPermission.message,
                  statusCode: 403,
                });
              }
              
              const { userId, updates } = req.payload; // updates = { fullName, email, username, role }

              if (!userId || !updates || typeof updates !== "object") {
                return ErrorSocketResponse(socket, {
                  request: req,
                  msg: "Invalid payload",
                  statusCode: 400,
                });
              }

              // Prevent updating to an existing email/username
              if (updates.email || updates.username) {
                const conflictUser = await User.findOne({
                  $or: [
                    updates.email ? { email: updates.email } : null,
                    updates.username ? { username: updates.username } : null,
                  ].filter(Boolean),
                  _id: { $ne: userId },
                });

                if (conflictUser) {
                  return ErrorSocketResponse(socket, {
                    request: req,
                    msg: "Email or username already in use by another user",
                    statusCode: 409,
                  });
                }
              }

              const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updates },
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
                msg: "User updated successfully",
                data: updatedUser,
              });
            }

          }

      }
   catch (error) {
      return ErrorSocketResponse(socket, {
        request: req,
        msg: error.message || "Internal Server Error",
        statusCode: 500,
      });
    }
  });
};

