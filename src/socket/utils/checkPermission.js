export const checkPermission = async (socket, action) => {
  console.log("🔐 Checking permission for action:", action)
  console.log("👤 User role:", socket.user?.role)

  const role = socket.user?.role

  switch (role) {
    case "admin":
      return checkAdmin(action)
    case "user":
      return checkUser(action)
    default:
      console.log("❌ Unknown role:", role)
      return {
        success: false,
        message: "Unknown role",
        error: "ROLE_NOT_FOUND",
      }
  }
}

function checkAdmin(action) {
  const allowed = [
    "users:read",
    "users:write",
    "users:delete",
    "admin:dashboard",
    "system:monitor",
    "profile:read",
    "profile:write",
    
    "product:read",
    "product:create",
    "product:update",
    "product:delete",

    "category:read",
    "category:create",
    "category:update",
    "category:delete",
  ]

  console.log("🔐 Admin checking action:", action, "Allowed:", allowed.includes(action))

  if (allowed.includes(action)) {
    return { success: true }
  }

  return {
    success: false,
    message: `Admin cannot perform '${action}'`,
    error: "INSUFFICIENT_PERMISSIONS",
  }
}

function checkUser(action) {
  const allowed = [
    "profile:read",
    "profile:write",
     "product:read",
    "category:read",
  ]

  console.log("🔐 User checking action:", action, "Allowed:", allowed.includes(action))

  if (allowed.includes(action)) {
    return { success: true }
  }

  return {
    success: false,
    message: `User cannot perform '${action}'`,
    error: "INSUFFICIENT_PERMISSIONS",
  }
}
