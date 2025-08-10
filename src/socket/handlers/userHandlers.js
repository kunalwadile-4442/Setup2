import { checkPermission } from "../utils/checkPermission.js"
import { sendSuccess, sendError } from "../utils/socketResponse.js"

export const userSocketHandlers = (socket, io) => {
  
  // ✅ Get user profile
  socket.on("user:getProfile", async (callback) => {
    try {
      const hasPermission = await checkPermission(socket, "profile:read")
      if (!hasPermission.success) {
        return sendError(callback, new Error(hasPermission.message), 403)
      }

      const user = socket.user
      return sendSuccess(callback, {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture,
          role: user.role,
        },
      }, "Profile fetched successfully")
    } catch (error) {
      return sendError(callback, error, 500)
    }
  })

  // ✅ Update user status
  // socket.on("user:updateStatus", async (data, callback) => {
  //   try {
  //     const hasPermission = await checkPermission(socket, "profile:write")
  //     if (!hasPermission.success) {
  //       return sendError(callback, new Error(hasPermission.message), 403)
  //     }

  //     socket.to("admin_room").emit("user:statusChanged", {
  //       userId: socket.user._id,
  //       username: socket.user.username,
  //       status: data.status,
  //       timestamp: new Date(),
  //     })

  //     return sendSuccess(callback, { status: data.status }, "Status updated successfully")
  //   } catch (error) {
  //     return sendError(callback, error, 500)
  //   }
  // })

  // ✅ Real-time notifications
  // socket.on("user:subscribe", (data, callback) => {
  //   try {
  //     const { channels } = data
  //     if (!Array.isArray(channels) || channels.length === 0) {
  //       return sendError(callback, new Error("Channels are required"), 400)
  //     }

  //     channels.forEach((channel) => {
  //       socket.join(`notifications_${channel}`)
  //     })

  //     return sendSuccess(callback, { channels }, "Subscribed to notifications successfully")
  //   } catch (error) {
  //     return sendError(callback, error, 500)
  //   }
  // })
}
