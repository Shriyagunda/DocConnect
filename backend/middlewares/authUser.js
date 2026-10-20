import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.js";

const authUser = (req, res, next) => {
  try {
    const { token } = req.headers; // you’re sending `token` header from the client
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    // put auth info on req.user (never on req.body)
    req.user = { userId: decoded.id };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
