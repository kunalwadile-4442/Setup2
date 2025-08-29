const sendStructuredResponse = (socket, response) => {
  if (socket && socket.emit) {
    return socket.emit("data", response)
  }
}

// ✅ Success Response (handles single object OR list)
export const SuccessSocketResponse = (
  socket, // Changed from callback to socket
  { request, msg, data = null, statusCode = 200 },
) => {
  let formattedData = {}

  if (Array.isArray(data)) {
    // If multiple records → put in items[]
    formattedData = { items: data }
  } else if (data && typeof data === "object") {
    // If single object → return directly
    formattedData = data
  }

  return sendStructuredResponse(socket, {
    status: true,
    statusCode,
    msg,
    data: formattedData,
    errors: [],
    request,
  })
}

// ❌ Error Response
export const ErrorSocketResponse = (
  socket, // Changed from callback to socket
  { request, msg, statusCode = 500, errors = [] },
) => {
  return sendStructuredResponse(socket, {
    status: false,
    statusCode,
    msg,
    data: {},
    errors,
    request,
  })
}
