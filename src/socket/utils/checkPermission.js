// // utils/checkPermission.js
// export const checkPermission = async (socket, action) => {
//   try {
//     const userRole = socket.user?.role;

//     if (!userRole) {
//       return {
//         success: false,
//         message: "User role missing",
//         error: "INVALID_USER",
//       };
//     }

//     // Centralized permissions map
//     const permissions = {
//       admin: [
//         "users:read",
//         "users:write",
//         "users:delete",
//         "admin:dashboard",
//         "system:monitor",
//         "profile:read",
//         "profile:write",
//       ],
//       user: [
//         "profile:read",
//         "profile:write",
//       ],
//     };

//     const userPermissions = permissions[userRole] || [];

//     if (!userPermissions.includes(action)) {
//       return {
//         success: false,
//         message: `Action '${action}' not permitted for role '${userRole}'`,
//         error: "INSUFFICIENT_PERMISSIONS",
//       };
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("checkPermission error:", error);
//     return {
//       success: false,
//       message: "Permission check failed",
//       error: error.message,
//     };
//   }
// };

export const checkPermission = async (socket, action) => {
  const role = socket.user?.role;

  switch (role) {
    case "admin":
      return checkAdmin(action);
    case "user":
      return checkUser(action);
    default:
      return {
        success: false,
        message: "Unknown role",
        error: "ROLE_NOT_FOUND",
      };
  }
};

function checkAdmin(action) {
  const allowed = [
    "users:read",
    "users:write",
    "users:delete",
    "admin:dashboard",
    "system:monitor",
    "profile:read",
    "profile:write",
  ];

  if (allowed.includes(action)) {
    return { success: true };
  }
  return {
    success: false,
    message: `Admin cannot perform '${action}'`,
    error: "INSUFFICIENT_PERMISSIONS",
  };
}

function checkUser(action) {
  const allowed = ["profile:read", "profile:write"];

  if (allowed.includes(action)) {
    return { success: true };
  }
  return {
    success: false,
    message: `User cannot perform '${action}'`,
    error: "INSUFFICIENT_PERMISSIONS",
  };
}
