class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors.length > 0 ? errors : [message]; // always have at least one error
    this.success = false;
    this.data = null; // same as ApiResponse for consistency

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      errors: this.errors
    };
  }
}

export { ApiError };
