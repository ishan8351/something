import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const addressSchema = new mongoose.Schema(
    {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true },
        phoneNumber: { type: String, unique: true, sparse: true },
        passwordHash: { type: String, required: true },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
        refreshToken: { type: String },

        customerId: { type: String, sparse: true },
        accountType: { type: String, enum: ['B2B', 'B2C'], default: 'B2C' },

        companyName: { type: String, trim: true },
        gstin: {
            type: String,
            trim: true,
            uppercase: true,
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                'Invalid GSTIN format',
            ],
        },
        isVerifiedB2B: { type: Boolean, default: false },

        walletBalance: { type: Number, default: 0 },
        addresses: [addressSchema],
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role,
            accountType: this.accountType,
            isVerifiedB2B: this.isVerifiedB2B,
        },
        process.env.ACCESS_TOKEN_SECRET || 'fallback_secret',
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
        }
    );
};

export const User = mongoose.model('User', userSchema);
