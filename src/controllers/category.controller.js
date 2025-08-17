import Category from "../models/category.model.js";
import { aggregatePaginateHelper } from "../utils/aggregatePaginateHelper.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;  // ✅ Use query params

  const matchQuery = {};

  if (search) {
    matchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const response = await aggregatePaginateHelper(
    Category,
    matchQuery,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, response, "Categories fetched successfully"));
});

const getCategoriesById = asyncHandler(async (req, res) => {
  const { id } = req.params;   // ✅ body instead of params

  if (!id) {
    throw new ApiError(400, "Category id is required");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

export { getCategories , getCategoriesById};
