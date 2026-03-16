import { User } from "../models/User.js";
import { Counter } from "../models/Counter.js";
import { ApiError } from "../utils/ApiError.js";

export class AuthService {
    static async registerUser(userData) {
        const { name, email, password } = userData;

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            throw new ApiError(409, "User with this email already exists");
        }

        // Generate sequential Customer ID
        const sequenceDoc = await Counter.findOneAndUpdate(
            { _id: 'customerId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const seq = sequenceDoc.seq.toString().padStart(5, '0');

        // IMPORTANT: Ensure your Mongoose User model has a pre('save') hook 
        // using bcrypt.hash() to hash this password before saving to DB!
        const user = await User.create({
            name,
            email,
            passwordHash: password, 
            role: 'CUSTOMER',
            customerId: `CUST${seq}`
        });

        const createdUser = await User.findById(user._id).select("-passwordHash");
        if (!createdUser) {
            throw new ApiError(500, "Failed to register user");
        }

        return createdUser;
    }

    static async loginUser(credentials) {
        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user) throw new ApiError(404, "Invalid user credentials");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

        // Optimized: No need to query the DB again. Just use the instance method.
        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select("-passwordHash");

        return { user: loggedInUser, accessToken };
    }
}