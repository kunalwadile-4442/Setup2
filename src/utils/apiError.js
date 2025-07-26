class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // for validation or multiple errors
    this.success = false;

    // Capture stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };