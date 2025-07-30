import { socketAuth } from "./middlewares/socketAuth.js"
import { userSocketHandlers } from "./handlers/userHandlers.js"
import { adminSocketHandlers } from "./handlers/adminHandlers.js"

export const initializeSocket = (io) => {
  // Socket authentication middleware
  let connectedUsers = 0;

  io.use(socketAuth)

  io.on("connection", (socket) => {
    connectedUsers++;
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`)
       console.log(`Connected users: ${connectedUsers}`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`)

    // Join admin users to admin room
    if (socket.user.role === "admin") {
      socket.join("admin_room")
    }

    // Register user handlers (available to all authenticated users)
    userSocketHandlers(socket, io)

    // Register admin handlers (only for admin users)
    if (socket.user.role === "admin") {
      adminSocketHandlers(socket, io)
    }

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.user.username} - Reason: ${reason}`)
    })

    // Handle errors
    socket.on("error", (error) => {
      console.error(`🚨 Socket error for user ${socket.user.username}:`, error)
      socket.emit("error", {
        success: false,
        message: "Socket error occurred",
        error: error.message,
      })
    })
  })

  console.log("🔌 Socket.IO handlers initialized")
}
