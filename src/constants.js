
export const MESSAGES = {
  // Auth & Credentials
  LOGIN_SUCCESSFUL: "User login successful",
  USER_REGISTERED_SUCCESSFULLY: "User registered successfully",
  REQUIRED_FIELDS_MISSING: "Required fields are missing",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  USERNAME_ALREADY_EXISTS: "Username already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_PASSWORD: "Invalid password",
  LOGIN_SUCCESSFULLY: "User logged in successfully",
  LOGOUT_SUCCESSFULLY: "User logged out successfully",
  PROFILE_UPDATED_SUCCESSFULLY: "Profile updated successfully",
  CLOUDINARY_UPLOAD_FAILED: "Failed to upload file on Cloudinary",
  PROFILE_PICTURE_REQUIRED: "Profile picture is required",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  PASSWORD_UPDATED_SUCCESSFULLY: "Password updated successfully",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",
  OTP_VERIFIED_SUCCESSFULLY: "OTP verified successfully",
  RESET_OTP_SENT_SUCCESSFULLY: "OTP sent successfully",
};


export const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};
export const generateOtpTemplate = (resetOTP) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
        <tr>
          <td style="background-color: #4f46e5; padding: 15px 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Password Reset Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
              You have requested to reset your password. Please use the OTP below:
            </p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block; margin: 15px 0;">
              <span style="font-size: 32px; color: #111827; font-weight: bold; letter-spacing: 4px;">
                ${resetOTP}
              </span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              This OTP is valid for <strong>2 minutes</strong>. Do not share it with anyone.
            </p>
            <a href="#" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
              Reset Password
            </a>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
              If you didn’t request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9fafb; padding: 10px; text-align: center; font-size: 12px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} Kunal. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `;
};
