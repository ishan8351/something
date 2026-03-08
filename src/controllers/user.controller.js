import { User } from "../models/User.js";
import { OtpToken } from "../models/OtpToken.js";

// --- Signup OTP ---
export const sendSignupOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ success: false, message: "Phone number is required" });

        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) return res.status(409).json({ success: false, message: "Phone number already registered" });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        await OtpToken.updateMany({ identifier: phoneNumber, isUsed: false }, { isUsed: true });
        await OtpToken.create({ identifier: phoneNumber, otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

        console.log(`\n📲 SMS SENT TO ${phoneNumber}: Your Sovely SIGNUP OTP is ${otpCode}\n`);
        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- NEW: Login OTP ---
export const sendLoginOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ success: false, message: "Phone number is required" });

        const existingUser = await User.findOne({ phoneNumber });
        if (!existingUser) return res.status(404).json({ success: false, message: "Phone number not registered. Please sign up." });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        await OtpToken.updateMany({ identifier: phoneNumber, isUsed: false }, { isUsed: true });
        await OtpToken.create({ identifier: phoneNumber, otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

        console.log(`\n📲 SMS SENT TO ${phoneNumber}: Your Sovely LOGIN OTP is ${otpCode}\n`);
        return res.status(200).json({ success: true, message: "Login OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, otpCode } = req.body;

        if (!name || !password) return res.status(400).json({ success: false, message: "Name and password are required" });
        if (!email && !phoneNumber) return res.status(400).json({ success: false, message: "Either Email or Phone Number is required" });

        if (phoneNumber) {
            if (!otpCode) return res.status(400).json({ success: false, message: "OTP is required for phone registration" });
            const validOtp = await OtpToken.findOne({ identifier: phoneNumber, otpCode, isUsed: false });
            if (!validOtp) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
            validOtp.isUsed = true;
            await validOtp.save();
        }

        const query = [];
        if (email) query.push({ email });
        if (phoneNumber) query.push({ phoneNumber });
        
        const existedUser = await User.findOne({ $or: query });
        if (existedUser) return res.status(409).json({ success: false, message: "User already exists with this contact method" });

        const user = await User.create({ name, email, phoneNumber, passwordHash: password });
        const createdUser = await User.findById(user._id).select("-passwordHash");

        return res.status(201).json({ success: true, data: createdUser, message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; 
        if (!identifier || !password) return res.status(400).json({ success: false, message: "Login credentials required" });

        const user = await User.findOne({ email: identifier });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select("-passwordHash");

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
            .json({ success: true, data: { user: loggedInUser, accessToken }, message: "Logged in successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- NEW: Passwordless Login via OTP ---
export const loginWithOtp = async (req, res) => {
    try {
        const { phoneNumber, otpCode } = req.body;
        if (!phoneNumber || !otpCode) return res.status(400).json({ success: false, message: "Phone and OTP required" });

        const user = await User.findOne({ phoneNumber });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const validOtp = await OtpToken.findOne({ identifier: phoneNumber, otpCode, isUsed: false });
        if (!validOtp) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        validOtp.isUsed = true;
        await validOtp.save();

        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select("-passwordHash");

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
            .json({ success: true, data: { user: loggedInUser, accessToken }, message: "Logged in successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: users, message: "Users fetched successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
        return res.status(200).json({ success: true, data: user, message: "User role updated" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};