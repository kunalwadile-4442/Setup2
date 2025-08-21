import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"
import { server } from "./app.js"

dotenv.config({
  path: "./.env",
})

// Connect to MongoDB

connectDB()
  .then(() => {
    const PORT = process.env.PORT
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🔌 Socket.IO server ready`)
    })
  })
  .catch((err) => {
    console.log("MongoDB connection failed on index.js", err)
    process.exit(1)
  })
