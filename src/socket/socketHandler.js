import { socketAuth } from "./middlewares/socketAuth.js"
import { userSocketHandlers } from "./handlers/userHandlers.js"
import { adminSocketHandlers } from "./handlers/adminHandlers.js"
import { productSocketHandlers } from "./handlers/productHandler.js"
import { categorySocketHandlers } from "./handlers/categoryHandler.js"
import { cartSocketHandlers } from "./handlers/cartHandler.js"
import { wishlistSocketHandlers } from "./handlers/wishlistHandler.js"

export const initializeSocket = (io) => {
  let connectedUsers = 0

  // Register socket authentication middleware
  io.use(socketAuth)

  // Define handler arrays
  
  const commonHandlers = [
    userSocketHandlers,
    productSocketHandlers,
    categorySocketHandlers,
    cartSocketHandlers,
    wishlistSocketHandlers
  ];
  const adminHandlers = [adminSocketHandlers] // you can add more here if needed

  io.on("connection", (socket) => {
    connectedUsers++
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`)
    console.log(`Connected users: ${connectedUsers}`)

    // Join personal room
    socket.join(`user_${socket.user._id}`)

    // Join admin room if applicable
    if (socket.user.role === "admin") {
      socket.join("admin_room")
    }

    // Register common handlers
    commonHandlers.forEach((handler) => handler(socket, io))

    // Register admin handlers if admin
    if (socket.user.role === "admin") {
      adminHandlers.forEach((handler) => handler(socket, io))
    }

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      connectedUsers--
      console.log(`❌ User disconnected: ${socket.user.username} - Reason: ${reason}`)
      console.log(`Connected users: ${connectedUsers}`)
    })

    // Handle socket errors
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
