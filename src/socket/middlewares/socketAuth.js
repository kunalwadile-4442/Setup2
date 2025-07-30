import jwt from "jsonwebtoken"
import { User } from "../../models/user.model.js"

export const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.request.headers?.authorization?.replace("Bearer ", "")

    if (!token) {
      return next(new Error("Authentication token required"))
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Get user from database
    const user = await User.findById(decoded._id).select("-password -refreshToken")

    if (!user) {
      return next(new Error("User not found"))
    }

    // Attach user to socket
    socket.user = user
    next()
  } catch (error) {
    console.error("Socket authentication error:", error.message)
    next(new Error("Invalid authentication token"))
  }
}
