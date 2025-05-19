// Modified generateToken to work with both traditional and Google login
import jwt from "jsonwebtoken";
export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }).json({
        success: true,
        message,
        user
    });
};

// Add this to your passport-config.js or auth routes
export const handleGoogleAuthSuccess = (req, res) => {
  // req.user contains the authenticated user from Google OAuth
  const user = req.user;
  
  // Use your existing token generation function
  return generateToken(res, user, "Successfully logged in with Google");
};