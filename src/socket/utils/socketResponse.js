// socketResponse.js
import ApiResponse from "../../utils/apiResponse.js"
import { ApiError } from "../../utils/apiError.js"
import { safeCallback } from "./helper.js"

// Success handler
export const sendSuccess = (callback, data, message = "Success", statusCode = 200) => {
  const response = new ApiResponse(statusCode, data, message)
  safeCallback(callback, response)
}

// Error handler
export const sendError = (callback, error, statusCode = 500) => {
  let err

  if (error instanceof ApiError) {
    err = error
  } else if (error instanceof Error) {
    err = new ApiError(statusCode, error.message, [error.message])
  } else if (typeof error === "string") {
    err = new ApiError(statusCode, error, [error])
  } else {
    err = new ApiError(statusCode, "Something went wrong", ["Unknown error"])
  }

  safeCallback(callback, err.toJSON())
}
