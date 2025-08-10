import Product from "../../models/product.model.js"
import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { checkPermission } from "../utils/checkPermission.js"
import { sendError, sendSuccess } from "../utils/socketResponse.js";

export const productSocketHandlers = (socket, io) => {
  console.log("🔧 Registering product handlers for socket:", socket.id);

  socket.on("product:add", asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        console.log("❌ No user found on socket");
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "product:create");
      if (!perm.success) {
        console.log("❌ Permission denied");
        return sendError(callback, perm.message, perm.error);
      }

      const productInfo = data.productData ?? data;

      const { name, description, price, category, subcategory, quantity, imageUrl } = productInfo;

      if (!name || !description || !price || !category || !imageUrl) {
        console.log("⚠️ Validation failed - missing required fields");
        return sendError(callback, "All required fields must be provided", "VALIDATION_ERROR");
      }

      const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        subcategory,
        quantity: Number(quantity ?? 0),
        imageUrl,
        createdBy: socket.user._id,
      });

      console.log("✅ Product created successfully:", product._id);

      // Broadcast to all connected clients that a product was created
      if (io) {
        io.emit("product:created", { product });
      }

      return sendSuccess(callback, { product }, "Product added successfully");
    } catch (error) {
      console.error("💥 Error in product:add handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));

  socket.on("product:update" , asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        console.log("❌ No user found on socket");
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const permission = await checkPermission(socket, "product:update");
      if (!permission.success) {
        console.log("❌ Permission denied");
        return sendError(callback, permission.message, permission.error);
      }
      const { productId, productData } = data;
      const product = await Product.findById(productId);

      if (!product) {
        console.log("❌ Product not found");
        return sendError(callback, "Product not found", "NOT_FOUND");
      }

      const { name, description, price, category, subcategory, quantity, imageUrl } = productData;

      if (!name || !description || !price || !category || !imageUrl) {
        console.log("⚠️ Validation failed - missing required fields");
        return sendError(callback, "All required fields must be provided", "VALIDATION_ERROR");
      }

      product.name = name;
      product.description = description;
      product.price = Number(price);
      product.category = category;
      product.subcategory = subcategory;
      product.quantity = Number(quantity ?? 0);
      product.imageUrl = imageUrl;

      await product.save();

      console.log("✅ Product updated successfully:", product._id);

      // Broadcast to all connected clients that a product was updated
      if (io) {
        io.emit("product:updated", { product });
      }
      return sendSuccess(callback, { product }, "Product updated successfully");
      
    } catch (error) {
      console.error("💥 Error in product:update handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));

  socket.on("product:delete", asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        console.log("❌ No user found on socket");
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const permission = await checkPermission(socket, "product:delete");
      if (!permission.success) {
        console.log("❌ Permission denied");
        return sendError(callback, permission.message, permission.error);
      }

      const { productId } = data;
      const product = await Product.findById(productId);

      if (!product) {
        console.log("❌ Product not found");
        return sendError(callback, "Product not found", "NOT_FOUND");
      }

     await product.deleteOne();
     
      console.log("✅ Product deleted successfully:", product._id);

      // Broadcast to all connected clients that a product was deleted
      if (io) {
        io.emit("product:deleted", { product });
      }
      return sendSuccess(callback, { product }, "Product deleted successfully");
    } catch (error) {
      console.error("💥 Error in product:delete handler:", error);
      return sendError(callback, error.message, error.name);
    }
    
  }));
      
  socket.on("product:get", asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const permission = await checkPermission(socket, "product:read");
      if (!permission.success) {
        return sendError(callback, permission.message, permission.error);
      }

      const { page = 1, limit = 10, search = "" } = data || {};

      // Match query for search
      const matchQuery = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const response = await aggregatePaginateHelper(
        Product,        // model
        matchQuery,     // match condition
        page,
        limit
      );

      return sendSuccess(callback, response, "Products fetched successfully");
    } catch (error) {
      console.error("💥 Error in product:get handler:", error);
      return sendError(callback, error.message, error.name);
    }
  }));


};
