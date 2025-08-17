import addressModel from "../../models/address.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { checkPermission } from "../utils/checkPermission.js";
import { sendError, sendSuccess } from "../utils/socketResponse.js";
import { aggregatePaginateHelper } from "../../utils/aggregatePaginateHelper.js";

export const addressSocketHandlers = (socket, io) => {
  console.log("🔧 Registering Address handlers for socket:", socket.id);

  socket.on(
    "address:add",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "address:create");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }

        const {
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          country,
          postalCode,
        } = data.addressData ?? data;

        if (
          !fullName ||
          !phone ||
          !line1 ||
          !city ||
          !state ||
          !country ||
          !postalCode
        ) {
          return sendError(
            callback,
            "All required fields must be provided",
            "VALIDATION_ERROR"
          );
        }

        const address = await addressModel.create({
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          country,
          postalCode,
          userId: socket.user._id,
        });

        // Notify this user only
        io.to(`user_${socket.user._id}`).emit("address:create", { address });

        return sendSuccess(callback, { address }, "Address Added successfully");
      } catch (error) {
        console.error("💥 Error address:create handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );

  socket.on(
    "address:update",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "address:update");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }

        const { addressId, addressData } = data;
        if (!addressId) {
          return sendError(
            callback,
            "Address ID is required",
            "VALIDATION_ERROR"
          );
        }

        // Allow partial update
        const updateFields = {};
        const allowedFields = [
          "fullName",
          "phone",
          "line1",
          "line2",
          "city",
          "state",
          "country",
          "postalCode",
        ];

        for (const field of allowedFields) {
          if (addressData?.[field] !== undefined) {
            updateFields[field] = addressData[field];
          }
        }

        if (Object.keys(updateFields).length === 0) {
          return sendError(
            callback,
            "No valid fields to update",
            "VALIDATION_ERROR"
          );
        }

        const address = await addressModel.findOneAndUpdate(
          { _id: addressId, userId: socket.user._id },
          { $set: updateFields },
          { new: true }
        );

        if (!address) {
          return sendError(
            callback,
            "Address not found or not owned by user",
            "NOT_FOUND"
          );
        }

        // Notify this user only
        io.to(`user_${socket.user._id}`).emit("address:update", { address });

        return sendSuccess(
          callback,
          { address },
          "Address updated successfully"
        );
      } catch (error) {
        console.error("💥 Error address:update handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );

  socket.on(
    "address:get",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "address:read");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }
        const { page = 1, limit = 10, search = "" } = data || {};

        // Match query for search
        const matchQuery = {
          userId: socket.user._id,
          ...(search && {
            $or: [
              { fullName: { $regex: search, $options: "i" } },
              { city: { $regex: search, $options: "i" } },
              { state: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }),
        };

        const response = await aggregatePaginateHelper(
          addressModel, // model
          matchQuery, // match condition
          page,
          limit
        );

        return sendSuccess(
          callback,
          { response },
          "Addresses fetched successfully"
        );
      } catch (error) {
        console.error("💥 Error address:get handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );

  socket.on(
    "address:delete",
    asyncHandler(async (data, callback) => {
      try {
        if (!socket.user) {
          return sendError(callback, "User not authenticated", "NO_USER");
        }

        const perm = await checkPermission(socket, "address:delete");
        if (!perm.success) {
          return sendError(callback, perm.message, perm.error);
        }

        const { addressId } = data;

        if (!addressId) {
          return sendError(
            callback,
            "Address ID is required",
            "VALIDATION_ERROR"
          );
        }

        const address = await addressModel.findOneAndDelete({
          _id: addressId,
          userId: socket.user._id,
        });

        if (!address) {
          return sendError(
            callback,
            "Address not found or not owned by user",
            "NOT_FOUND"
          );
        }

        // Match query for search
        
        return sendSuccess(
          callback,
          { address },
          "Addresses fetched successfully"
        );
      } catch (error) {
        console.error("💥 Error address:get handler:", error);
        return sendError(callback, error.message, error.name);
      }
    })
  );
};
