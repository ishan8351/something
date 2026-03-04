import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);