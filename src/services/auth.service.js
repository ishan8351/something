import { User } from '../models/User.js';
import { Counter } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
    static async registerUser(userData) {
        const { name, email, phoneNumber, password, accountType, companyName, gstin } = userData;

        const orConditions = [];
        if (email) orConditions.push({ email });
        if (phoneNumber) orConditions.push({ phoneNumber });

        if (orConditions.length > 0) {
            const existedUser = await User.findOne({ $or: orConditions });
            if (existedUser) {
                throw new ApiError(409, 'User with this email or phone number already exists');
            }
        }

        if (accountType === 'B2B' && gstin) {
            const existedGstin = await User.findOne({ gstin });
            if (existedGstin) {
                throw new ApiError(409, 'A business with this GSTIN is already registered');
            }
        }

        const sequenceDoc = await Counter.getNextSequenceValue('customerId');
        const seq = sequenceDoc.toString().padStart(5, '0');

        const createPayload = {
            name,
            passwordHash: password,
            role: 'CUSTOMER',
            customerId: `CUST${seq}`,
            accountType: accountType || 'B2C',
        };

        if (email) createPayload.email = email;
        if (phoneNumber) createPayload.phoneNumber = phoneNumber;

        if (accountType === 'B2B') {
            createPayload.companyName = companyName;
            createPayload.gstin = gstin;
            createPayload.isVerifiedB2B = false;
        }

        const user = await User.create(createPayload);

        const createdUser = await User.findById(user._id).select('-passwordHash');
        if (!createdUser) {
            throw new ApiError(500, 'Failed to register user');
        }

        return createdUser;
    }

    static async loginUser(credentials) {
        const { email, phoneNumber, password } = credentials;

        const query = email ? { email } : { phoneNumber };
        const user = await User.findOne(query);

        if (!user) throw new ApiError(401, 'Invalid credentials');

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, 'Invalid credentials');

        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select('-passwordHash');

        return { user: loggedInUser, accessToken };
    }
}
