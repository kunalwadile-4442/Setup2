import Product from "../models/product.model.js";
import { aggregatePaginateHelper } from "../utils/aggregatePaginateHelper.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"; // <--- missing import

const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search="" } = req.body || {};

  const matchQuery = {};

  if (search) {
    matchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const response = await aggregatePaginateHelper(
    Product,
    matchQuery,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, response, "Products fetched successfully"));
});

// ---- OPTION A (params style) ----
const getProductsById = asyncHandler(async (req, res) => {
  const { id } = req.params;  // GET /products/:id

  if (!id) {
    throw new ApiError(400, "Product id is required");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});


export { getProducts, getProductsById };
