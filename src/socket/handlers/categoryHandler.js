import Category from "../../models/category.model.js";

import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { checkPermission } from "../utils/checkPermission.js"
import { sendError, sendSuccess } from "../utils/socketResponse.js";

export const categorySocketHandlers = (socket, io) => {
  console.log("🔧 Registering product handlers for socket:", socket.id);

  socket.on("category:add", asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        console.log("❌ No user found on socket");
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "category:create");
      if (!perm.success) {
        console.log("❌ Permission denied");
        return sendError(callback, perm.message, perm.error);
      }

      const categroyInfo = data.categoryData ?? data;

      const { name, description } = categroyInfo;

      if (!name || !description) {
        console.log("⚠️ Validation failed - missing required fields");
        return sendError(callback, "All required fields must be provided", "404");
      }

      const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return sendError(
        callback,
        `Category '${name}' already exists`,
        "DUPLICATE_CATEGORY"
      );
    }
      const category = await Category.create({
        name,
        description,
        createdBy: socket.user._id,
      });

      console.log("✅ Category created successfully:", category._id);

      // Broadcast to all connected clients that a product was created
      if (io) {
        io.emit("category:created", { category });
      }

      return sendSuccess(callback, { category }, "Category added successfully");
    } catch (error) {
      console.error("💥 Error in category:add handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));

    socket.on("category:get", asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const permission = await checkPermission(socket, "category:read");
      if (!permission.success) {
        return sendError(callback, permission.message, permission.error);
      }

      const { page = 1, limit = 10, search = "" } = data || {};

      // Match query for search
      const matchQuery = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const response = await aggregatePaginateHelper(
        Category,        // model
        matchQuery,     // match condition
        page,
        limit
      );

      return sendSuccess(callback, response, "Categorys fetched successfully");
    } catch (error) {
      console.error("💥 Error in product:get handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));

  socket.on("category:update" , asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        console.log("❌ No user found on socket");
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const permission = await checkPermission(socket, "category:update");
      if (!permission.success) {
        console.log("❌ Permission denied");
        return sendError(callback, permission.message, permission.error);
      }
      const { categoryId, categoryData } = data;
      const category = await Category.findById(categoryId);

      if (!category) {
        console.log("❌ Category not found");
        return sendError(callback, "Category not found", "NOT_FOUND");
      }

      const { name, description } = categoryData;

      if (!name || !description) {
        console.log("⚠️ Validation failed - missing required fields");
        return sendError(callback, "All required fields must be provided", "404");
      }

      category.name = name;
      category.description = description;

      await category.save();

      console.log("✅ Product updated successfully:", category._id);

      // Broadcast to all connected clients that a product was updated
      if (io) {
        io.emit("category:updated", { category });
      }
      return sendSuccess(callback, { category }, "Category updated successfully");
      
    } catch (error) {
      console.error("💥 Error in category:update handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));

//   socket.on("product:delete", asyncHandler(async (data, callback) => {
//     try {
//       if (!socket.user) {
//         console.log("❌ No user found on socket");
//         return sendError(callback, "User not authenticated", "NO_USER");
//       }

//       const permission = await checkPermission(socket, "product:delete");
//       if (!permission.success) {
//         console.log("❌ Permission denied");
//         return sendError(callback, permission.message, permission.error);
//       }

//       const { productId } = data;
//       const product = await Category.findById(productId);

//       if (!product) {
//         console.log("❌ Product not found");
//         return sendError(callback, "Product not found", "NOT_FOUND");
//       }

//      await product.deleteOne();
     
//       console.log("✅ Product deleted successfully:", product._id);

//       // Broadcast to all connected clients that a product was deleted
//       if (io) {
//         io.emit("product:deleted", { product });
//       }
//       return sendSuccess(callback, { product }, "Product deleted successfully");
//     } catch (error) {
//       console.error("💥 Error in product:delete handler:", error);
//       return sendError(callback, error.message, error.name);
//     }
    
//   }));
      



};
