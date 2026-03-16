import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-passwordHash -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        // Explicitly handle token expiration so the frontend knows exactly what happened
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired"); 
        }
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        // Safety check to prevent complete server crash if verifyJWT is missing
        if (!req.user) {
            return next(new ApiError(401, "Authentication required before checking roles"));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "You are not authorized to access this route"));
        }
        next();
    };
};