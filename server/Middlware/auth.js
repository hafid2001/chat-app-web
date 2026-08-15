import User from "../models/User.js";
import Jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;                           
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-password",
    );

    if (!user) return res.json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//Controller to check if user is authenticated

export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};
