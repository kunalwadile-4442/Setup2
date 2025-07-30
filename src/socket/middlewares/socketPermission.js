// Permission middleware for socket events
export const requireRole = (roles = []) => {
  return (socket, next) => {
    if (!socket.user || !roles.includes(socket.user.role)) {
      return next(new Error("Insufficient permissions"))
    }
    next()
  }
}

// Action-based permission middleware
export const requireAction = (action) => {
  return (socket, next) => {
    const userRole = socket.user.role

    // Define action permissions
    const permissions = {
      admin: ["users:read", "users:write", "users:delete", "admin:dashboard", "system:monitor"],
      user: ["profile:read", "profile:write"],
    }

    const userPermissions = permissions[userRole] || []

    if (!userPermissions.includes(action)) {
      return next(new Error(`Action '${action}' not permitted for role '${userRole}'`))
    }

    next()
  }
}
