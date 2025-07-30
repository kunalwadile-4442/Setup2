import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "./models/user.model.js";
import { generateAccessAndRefreshTokens } from "./controllers/user.controller.js"; // ✅ Import common function

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
      process.exit(1);
    }

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {



      admin = await User.create({
        fullName: "Super Admin",
        email: adminEmail,
        username: "admin",
        password: adminPassword,
        role: "admin",
      });

      console.log("✅ Admin user created successfully!");
    } else {
      console.log("✅ Admin user already exists!");
    }

    // ✅ Generate Access & Refresh Tokens using common function
    // const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

    // console.log("✅ Access Token:", accessToken);
    
    // console.log("✅ Refresh Token:", refreshToken);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
