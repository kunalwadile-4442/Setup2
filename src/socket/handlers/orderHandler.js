
import Address from "../../models/address.model.js";
import Cart from "../../models/cart.model.js";
import Order from "../../models/orders.modal.js";
import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { checkPermission } from "../utils/checkPermission.js";
import { sendError, sendSuccess } from "../utils/socketResponse.js";

export const orderSocketHandlers = (socket, io) => {
  socket.on(
    "order:create",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "order:create");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }

        const { shippingAddress, paymentMethod } = data.orderData ?? data;
        if (!shippingAddress) {
          return sendError(callback, "Shipping address is required", "VALIDATION_ERROR");
        }
        if (!paymentMethod) {
          return sendError(callback, "Payment method is required", "VALIDATION_ERROR");
        }

        // ✅ 1. Get cart
        const cart = await Cart.findOne({ user: socket.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
          return sendError(callback, "Cart is empty", "EMPTY_CART");
        }

        // ✅ 2. Get address + snapshot
        const addressDoc = await Address.findOne({ _id: shippingAddress, userId: socket.user._id });
        if (!addressDoc) {
          return sendError(callback, "Invalid shipping address", "NOT_FOUND");
        }
        const shippingAddressSnapshot = {
          fullName: addressDoc.fullName,
          phone: addressDoc.phone,
          line1: addressDoc.line1,
          line2: addressDoc.line2,
          city: addressDoc.city,
          state: addressDoc.state,
          country: addressDoc.country,
          postalCode: addressDoc.postalCode,
        };

        // ✅ 3. Build order items from cart
        const orderItems = cart.items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.imageUrl,
        }));

        // ✅ 4. Total price is already in cart
        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
            }, 0);

            console.log("totalAmount:::",totalAmount)


        // ✅ 5. Create order
        const order = await Order.create({
          userId: socket.user._id,
          items: orderItems,
          shippingAddress,
          shippingAddressSnapshot,
          paymentMethod,
          totalAmount,
          createdBy: socket.user._id,
        });

        // ✅ 6. Clear cart after successful order
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalQuantity = 0;
        await cart.save();

        // 📡 Notify user
        io.to(`user_${socket.user._id}`).emit("order:created", { order });

        return sendSuccess(callback, { order }, "Order created successfully");
      } catch (error) {
        console.error("💥 Error in order:create:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );
socket.on(
  "order:get",
  asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "order:read");
      if (!perm.success) {
        return sendError(callback, perm.message, perm.error);
      }

      const { page = 1, limit = 10, status = "", search = "" } = data || {};

      // Build match query
      const matchQuery = { userId: socket.user._id };

      if (status) {
        matchQuery.orderStatus = status; // filter by status (pending, delivered etc.)
      }

      if (search) {
        matchQuery.orderNumber = { $regex: search, $options: "i" };
      }

      // 📌 Use aggregatePaginateHelper
      const response = await aggregatePaginateHelper(
        Order,       // model
        matchQuery,  // match condition
        page,
        limit,
        [
          { $sort: { createdAt: -1 } }, // latest first
          {
            $project: {
              orderNumber: 1,
              totalAmount: 1,
              paymentMethod: 1,
              paymentStatus: 1,
              orderStatus: 1,
              createdAt: 1,
              "shippingAddressSnapshot.city": 1,
              "shippingAddressSnapshot.state": 1,
              "shippingAddressSnapshot.country": 1,
            },
          },
        ]
      );

      return sendSuccess(callback, { response }, "Orders fetched successfully");
    } catch (error) {
      console.error("💥 Error in order:get handler:", error);
      return sendError(callback, error.message, error.name);
    }
  })
);


};