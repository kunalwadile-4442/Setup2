import Cart from "../../models/cart.model.js"
import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { formatCart } from "../utils/cartFormat.js";
import { checkPermission } from "../utils/checkPermission.js";
import { sendError, sendSuccess } from "../utils/socketResponse.js";

export const cartSocketHandlers = (socket, io) => {
  console.log("🔧 Registering Cart handlers for socket:", socket.id);

  socket.on("cart:add",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "cart:create");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }

        const { productId, quantity } = data.cartData ?? data;
        if (!productId || !quantity) {
          return sendError(callback, "ProductId and quantity are required", "VALIDATION_ERROR");
        }

        // 1️⃣ Find user's cart
        let cart = await Cart.findOne({ user: socket.user._id });

        if (!cart) {
          // 2️⃣ Create new cart
          cart = await Cart.create({
            user: socket.user._id,
            items: [{ product: productId, quantity }],
          });
        } else {
          // 3️⃣ Check if product already in cart
          const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
          );

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.items.push({ product: productId, quantity });
          }

          await cart.save();
        }

        // 🔄 Populate items for frontend convenience
        await cart.populate("items.product");

        const cartResponse = formatCart(cart);
        console.log("✅ Cart updated successfully:", cart._id);

        // Notify this user only
        io.to(`user_${socket.user._id}`).emit("cart:updated", { cart:cartResponse });

        return sendSuccess(callback, { cart:cartResponse }, "Cart updated successfully");
      } catch (error) {
        console.error("💥 Error i__vn cart:add handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );

    socket.on("cart:get",
    asyncHandler(async (_, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }
        const perm = await checkPermission(socket, "cart:read");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }
        let cart = await Cart.findOne({ user: socket.user._id }).populate("items.product");

            if (!cart) {
            return sendSuccess(callback, { cart: null }, "Cart is empty");
            }

        const cartResponse = formatCart(cart);

        return sendSuccess(callback, {cart:cartResponse}, "Cart fetched successfully");
      } catch (error) {
        console.error("💥 Error in cart:get handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );


//   socket.on("cart:update",
//     asyncHandler(async (data, callback) => {
//       try {
//         if (!socket.user) {
//           console.log("❌ No user found on socket");
//           return sendError(callback, "User not authenticated", "NO_USER");
//         }

//         const permission = await checkPermission(socket, "cart:update");
//         if (!permission.success) {
//           console.log("❌ Permission denied");
//           return sendError(callback, permission.message, permission.error);
//         }
//         const { categoryId, categoryData } = data;
//         const cart = await Cart.findById(categoryId);

//         if (!cart) {
//           console.log("❌ Cart not found");
//           return sendError(callback, "Cart not found", "NOT_FOUND");
//         }

//         const { name, description } = categoryData;

//         if (!name || !description) {
//           console.log("⚠️ Validation failed - missing required fields");
//           return sendError(
//             callback,
//             "All required fields must be provided",
//             "404"
//           );
//         }

//         cart.name = name;
//         cart.description = description;

//         await cart.save();

//         console.log("✅ product updated successfully:", cart._id);

//         // Broadcast to all connected clients that a cart was updated
//         if (io) {
//           io.emit("cart:updated", { cart });
//         }
//         return sendSuccess(
//           callback,
//           { cart },
//           "Cart updated successfully"
//         );
//       } catch (error) {
//         console.error("💥 Error in cart:update handler:", error);
//         return sendError(callback, error.message, error.name);
//       }
//     })
//   );

//   socket.on("cart:delete",
//     asyncHandler(async (data, callback) => {
//       try {
//         if (!socket.user) {
//           console.log("❌ No user found on socket");
//           return sendError(callback, "User not authenticated", "NO_USER");
//         }

//         const permission = await checkPermission(socket, "cart:delete");
//         if (!permission.success) {
//           console.log("❌ Permission denied");
//           return sendError(callback, permission.message, permission.error);
//         }

//         const { categoryId } = data;
//         const cart = await Cart.findById(categoryId);

//         if (!cart) {
//           console.log("❌ cart not found");
//           return sendError(callback, "Cart not found", "NOT_FOUND");
//         }

//         await cart.deleteOne();

//         console.log("✅ Cart deleted successfully:", cart._id);

//         // Broadcast to all connected clients that a cart was deleted
//         if (io) {
//           io.emit("cart:deleted", { cart });
//         }
//         return sendSuccess(
//           callback,
//           { cart },
//           "Cart deleted successfully"
//         );
//       } catch (error) {
//         console.error("💥 Error in cart:delete handler:", error);
//         return sendError(callback, error.message, error.name);
//       }
//     })
//   );


};
