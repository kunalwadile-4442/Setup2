import Cart from "../../models/cart.model.js";
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


   socket.on(
     "cart:removeItem",
     asyncHandler(async (data, callback) => {
       try {
         if (!socket.user) {
           return sendError(callback, "User not authenticated", "NO_USER");
         }
         const perm = await checkPermission(socket, "cart:removeItem");
         if (!perm.success) {
           return sendError(callback, perm.message, perm.error);
         }

         const { productId } = data || {};
         if (!productId) {
           return sendError(
             callback,
             "Product ID is required",
             "VALIDATION_ERROR"
           );
         }

         let cart = await Cart.findOne({ user: socket.user._id }).populate(
           "items.product"
         );

         if (!cart) {
           return sendSuccess(callback, { cart: null }, "Cart is empty");
         }

         const itemIndex = cart.items.findIndex(
           (item) => item.product && item.product._id.toString() === productId
         );

         if (itemIndex === -1) {
           return sendError(callback, "Item not found in cart", "NOT_FOUND");
         }

         cart.items.splice(itemIndex, 1);
         await cart.save();

         const cartResponse = formatCart(cart);

         return sendSuccess(
           callback,
           { cart: cartResponse },
           "Remove from Cart successfully"
         );
       } catch (error) {
         console.error("💥 Error in :cart:removeItem", error);
         return sendError(callback, error.message, error.name);
       }
     })
   );

    socket.on(
     "cart:remove",
     asyncHandler(async (data, callback) => {
       try {
         if (!socket.user) {
           return sendError(callback, "User not authenticated", "NO_USER");
         }
         const perm = await checkPermission(socket, "cart:remove");
         if (!perm.success) {
           return sendError(callback, perm.message, perm.error);
         }


         let cart = await Cart.findOne({ user: socket.user._id }).populate(
           "items.product"
         );

         if (!cart) {
           return sendSuccess(callback, { cart: null }, "Cart already empty");
         }
         cart.items = [];
         await cart.save();

         const cartResponse = formatCart(cart);

         return sendSuccess(
           callback,
           { cart: cartResponse },
           "Cart cleared successfully"
         );
       } catch (error) {
         console.error("💥 Error in cart:remove", error);
         return sendError(callback, error.message, error.name);
       }
     })
   );
};
