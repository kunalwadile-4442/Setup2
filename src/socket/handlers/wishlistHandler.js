import { Wishlist } from "../../models/wishlist.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { formatCart } from "../utils/cartFormat.js";
import { checkPermission } from "../utils/checkPermission.js";
import { sendError, sendSuccess } from "../utils/socketResponse.js";

export const wishlistSocketHandlers = (socket, io) => {
  console.log("🔧 Registering WishList handlers for socket:", socket.id);

socket.on(
  "wishlist:toggle",
  asyncHandler(async (data, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "wishlist:toggle");
      if (!perm.success) return sendError(callback, perm.message, perm.error);

      const { productId } = data || {};
      if (!productId) {
        return sendError(callback, "Product ID is required", "VALIDATION_ERROR");
      }

      // ✅ Get or create wishlist
      let wishlist = await Wishlist.findOne({ user: socket.user._id });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: socket.user._id, items: [] });
      }

      // ✅ Check if product exists
      const index = wishlist.items.findIndex(
        (item) => item.product.toString() === productId
      );

      let action;
      if (index > -1) {
        // ✅ If already exists → remove
        wishlist.items.splice(index, 1);
        action = "removed";
      } else {
        // ✅ If not exists → add
        wishlist.items.push({ product: productId });
        action = "added";
      }

      await wishlist.save();
      await wishlist.populate("items.product", "name price imageUrl");

      return sendSuccess(
        callback,
        { wishlist, action },
        `Product ${action} from wishlist successfully`
      );
    } catch (err) {
      console.error("💥 Error in wishlist:toggle:", err);
      return sendError(callback, err.message, err.name);
    }
  })
);

socket.on("wishlist:get",
  asyncHandler(async (_, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "wishlist:read");
      if (!perm.success) return sendError(callback, perm.message, perm.error);

      let wishlist = await Wishlist.findOne({ user: socket.user._id })
        .populate("items.product");

    if (!wishlist || wishlist.items.length === 0) {
        return sendSuccess(callback, {}, "Wishlist is empty");
    }

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: socket.user._id, items: [] });
      }

      return sendSuccess(
        callback,
        { wishlist },
        "Wishlist fetched successfully"
      );
    } catch (err) {
      console.error("💥 Error in wishlist:get:", err);
      return sendError(callback, err.message, err.name);
    }
  })
);


socket.on("wishlist:clear",
  asyncHandler(async (_, callback) => {
    try {
      if (!socket.user) {
        return sendError(callback, "User not authenticated", "NO_USER");
      }

      const perm = await checkPermission(socket, "wishlist:clear");
      if (!perm.success) return sendError(callback, perm.message, perm.error);

      let wishlist = await Wishlist.findOne({ user: socket.user._id });

    if (!wishlist || wishlist.items.length === 0) {
        return sendSuccess(callback, {  }, "Wishlist cleared successfully");
    }

      if (wishlist) {
        wishlist.items = [];
        await wishlist.save();
      }

      return sendSuccess(
        callback,
        { wishlist },
        "Wishlist cleared successfully"
      );
    } catch (err) {
      console.error("💥 Error in wishlist:clear:", err);
      return sendError(callback, err.message, err.name);
    }
  })
);

};
