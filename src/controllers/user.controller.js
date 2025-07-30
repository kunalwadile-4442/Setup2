import { MESSAGES } from "../constants.js";
import { User } from "../models/user.model.js";
import { aggregatePaginateHelper } from "../utils/aggregatePaginateHelper.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const updateUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, MESSAGES.REQUIRED_FIELDS_MISSING);
  }

  let profilePictureUrl;

  // ✅ Upload only if file exists
  if (req.files?.profilePicture?.[0]?.path) {
    const profilePictureLocalPath = req.files.profilePicture[0].path;
    profilePictureUrl = await uploadOnCloudinary(profilePictureLocalPath, "auto");

    if (!profilePictureUrl) {
      throw new ApiError(500, MESSAGES.CLOUDINARY_UPLOAD_FAILED);
    }
    user.profilePicture = profilePictureUrl.url; // ✅ Update only when new image is uploaded
  }
  // ✅ Always update name and email
  user.fullName = fullName;
  user.email = email.toLowerCase();

  
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { user }, MESSAGES.PROFILE_UPDATED_SUCCESSFULLY)
  );
});

const getUserProfile = asyncHandler(async (req, res) => {
  
  const user = req.user;

  if(!user){
    throw new ApiError(404, MESSAGES.USER_NOT_FOUND);
  }

  const sanitarizedUser = await User.findById(user._id).select("-password -refreshToken -resetOTP -resetOTPExpire").lean();


  res.status(200).json(
    new ApiResponse(
      200,
      { user:sanitarizedUser},
      MESSAGES.PROFILE_FETCHED_SUCCESSFULLY
    )
  );
});

const updateUserPassword = asyncHandler(async (req, res) => {
const user = await User.findById(req.user._id).select("+password");  
const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if( !currentPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, MESSAGES.REQUIRED_FIELDS_MISSING);
  }

  if(newPassword !== confirmNewPassword){
    throw new ApiError(400, MESSAGES.PASSWORDS_DO_NOT_MATCH);
  }
  // const isPasswordValid = await user.comparePassword(currentPassword);

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);


  if (!isPasswordValid) {
    throw new ApiError(400, MESSAGES.INVALID_PASSWORD);
  }
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {},
      MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY
    )
  );

});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.body || {};
  const matchQuery = { role: "user" };

  if (search) {
    matchQuery.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const response = await aggregatePaginateHelper(User, matchQuery, page, limit);

  res.status(200).json(
    new ApiResponse(200, response, "Users fetched successfully")
  );
});



export { getAllUsers, updateUserPassword, updateUserProfile ,getUserProfile};
