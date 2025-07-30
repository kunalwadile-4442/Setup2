import { User } from "../../models/user.model.js"
import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js"
import { checkPermission } from "../utils/checkPermission.js"
import { sendSuccess, sendError } from "../utils/socketResponse.js"
// import { buildPagination } from "../utils/pagination.js"

export const adminSocketHandlers = (socket, io) => {
  
  // ✅ Get all users
socket.on("admin:getAllUsers", async (data, callback) => {
  try {
    const hasPermission = await checkPermission(socket, "users:read");
    if (!hasPermission.success) 
      return sendError(callback, new Error(hasPermission.message), 403);

    const { page = 1, limit = 10, search = "" } = data || {};
    const matchQuery = { role: "user" };

    if (search) {
      matchQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const response = await aggregatePaginateHelper(User, matchQuery, page, limit);

    return sendSuccess(callback, response, "Users fetched successfully");
  } catch (error) {
    return sendError(callback, error, 500);
  }
});

  // ✅ Monitor Users
  socket.on("admin:monitorUsers", async (callback) => {
    try {
      const hasPermission = await checkPermission(socket, "system:monitor")
      if (!hasPermission.success) return sendError(callback, new Error(hasPermission.message), 403)

      const connectedSockets = await io.fetchSockets()
      const onlineUsers = connectedSockets.length
      const totalUsers = await User.countDocuments({ role: "user" })
      const totalAdmins = await User.countDocuments({ role: "admin" })

      return sendSuccess(callback, {
        onlineUsers,
        totalUsers,
        totalAdmins,
        timestamp: new Date(),
      }, "System stats fetched")
    } catch (error) {
      return sendError(callback, error, 500)
    }
  })

  // ✅ Broadcast
  socket.on("admin:broadcast", async (data, callback) => {
    try {
      const hasPermission = await checkPermission(socket, "users:write")
      if (!hasPermission.success) return sendError(callback, new Error(hasPermission.message), 403)

      const { message, type = "info" } = data
      io.emit("notification", { type, message, from: "admin", timestamp: new Date() })

      return sendSuccess(callback, { message, type }, "Message broadcasted successfully")
    } catch (error) {
      return sendError(callback, error, 500)
    }
  })

  // ✅ Delete User
  socket.on("admin:deleteUser", async (data, callback) => {
    try {
      const hasPermission = await checkPermission(socket, "users:delete")
      if (!hasPermission.success) return sendError(callback, new Error(hasPermission.message), 403)

      const { userId } = data
      const user = await User.findByIdAndDelete(userId)

      if (!user) return sendError(callback, new Error("User not found"), 404)

      socket.to("admin_room").emit("user:deleted", {
        deletedUser: user.username,
        deletedBy: socket.user.username,
        timestamp: new Date(),
      })

      return sendSuccess(callback, { deletedUser: user.username }, "User deleted successfully")
    } catch (error) {
      return sendError(callback, error, 500)
    }
  })
}
