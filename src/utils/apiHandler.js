export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    data: null, // To match ApiResponse structure
    errors: err.errors && err.errors.length > 0 ? err.errors : [message],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
