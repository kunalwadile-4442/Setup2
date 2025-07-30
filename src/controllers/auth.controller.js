import { generateOtpTemplate, MESSAGES } from "../constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";



export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    console.log("user",user)

    const accessToken = user.generateAccessToken();     // ✅ make sure method exists
    const refreshToken = user.generateRefreshToken();   // ✅ typo fixed

    console.log("accessToken",accessToken)
    console.log("refreshToken",refreshToken)

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error); // helpful log
    throw new ApiError(500,"Internal Server Error: Unable to generate tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username, fullName } = req.body;

  // ✅ Validate input
  if (!email || !password || !username || !fullName) {
    throw new ApiError(400, MESSAGES.REQUIRED_FIELDS_MISSING);
  }

  // ✅ Check if user exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() }
    ]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ApiError(409, MESSAGES.EMAIL_ALREADY_EXISTS);
    }
    if (existingUser.username === username.toLowerCase()) {
      throw new ApiError(409, MESSAGES.USERNAME_ALREADY_EXISTS);
    }
  }

  // ✅ Create user (password will be hashed in pre-save hook)
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password
  });

  // ✅ Sanitize response (remove password & refreshToken)
  const sanitizedUser = await User.findById(user._id).select("-password -refreshToken").lean();

  // ✅ Send response
  return res.status(201).json(
    new ApiResponse(
      201,
      { user: sanitizedUser },
      MESSAGES.USER_REGISTERED_SUCCESSFULLY
    )
  );
});

const loginUser =asyncHandler (async (req, res) => {

  const { email, password } = req.body;

  if(!email || !password){
    throw new ApiError(400, MESSAGES.REQUIRED_FIELDS_MISSING);
  }
     const user = await User.findOne({ email }).select("+password"); // ✅ Fix here

  
  if(!user){
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }

  const isPAsswordValid = await user.isPasswordCorrect(password);

  if(!isPAsswordValid){
    throw new ApiError(401, MESSAGES.INVALID_PASSWORD);
  }

  user.isLogin = true;
  await user.save({ validateBeforeSave: false });
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const sanitarizedUser = await User.findById(user._id).select("-password -refreshToken").lean();

  res.
  cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .status(200).json(
    new ApiResponse(
      200,
      {user: sanitarizedUser, accessToken, refreshToken},
      MESSAGES.LOGIN_SUCCESSFULLY
    )
  )
}

)

const logoutUser = asyncHandler (async (req, res) => {
const user  = req.user; // ✅ Use authenticated user from middleware
  if(!user){
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }
   const options = {
    httpOnly: true,
    secure: true,
  }
  // Clear refresh token and access token
  user.refreshToken = null;
  user.isLogin = false;
  await user.save({ validateBeforeSave: false });

   res.clearCookie("refreshToken", options);
   res.clearCookie("accessToken", options);

  user.refreshToken = null;
  user.isLogin = false;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(
    new ApiResponse(
      200,
      {},
      MESSAGES.LOGOUT_SUCCESSFULLY
    )
  )
})

const forgotPassword = asyncHandler(async(req, res)=> {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }

  // Generate reset OTP and set expiration
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOTP = resetOTP;
  user.resetOTPExpire = Date.now() + 2 * 60 * 1000; // 2 minutes
  await user.save({ validateBeforeSave: false });

  const subject = "Password Reset OTP";
  const html = generateOtpTemplate(resetOTP);

  // ✅ Send email
  await sendEmail({ to: user.email, subject, html });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { otp: resetOTP },
        MESSAGES.RESET_OTP_SENT_SUCCESSFULLY
      )
    );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, resetOTP } = req.body;

  if (!email || !resetOTP) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email }).select("+resetOTP +resetOTPExpire");

  if (!user) {
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }

  // ✅ Validate OTP
  if (user.resetOTP !== resetOTP) {
    throw new ApiError(400, MESSAGES.INVALID_OTP);
  }

  if (user.resetOTPExpire < Date.now()) {
    throw new ApiError(400, MESSAGES.OTP_EXPIRED);
  }

  // ✅ OTP verified → clear OTP and expiry
  user.resetOTP = null;
  user.resetOTPExpire = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, {}, MESSAGES.OTP_VERIFIED_SUCCESSFULLY)
  );
});

const resetPassword = asyncHandler(async(req,res)=>{
  const {email,password, confirmNewPassword} = req.body;
  
  if(!email || !password || !confirmNewPassword){
    throw new ApiError(400, MESSAGES.REQUIRED_FIELDS_MISSING);
  }

  const user = await User.findOne({email});

  if(!user){
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }

  if(password !== confirmNewPassword){
    throw new ApiError(400, MESSAGES.PASSWORDS_DO_NOT_MATCH);
  }
  user.password = password;
  await user.save();
  res.status(200).json(
    new ApiResponse(
      200,
      {},
      MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY
    )
  );
})



export { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyOtp };
