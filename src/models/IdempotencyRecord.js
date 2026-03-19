import mongoose from 'mongoose';

const idempotencySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    // We store the successful response here.
    // If a duplicate request comes in, we just return this instead of processing again!
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // TTL Index: Auto-deletes document after 24 hours (86400 seconds)
    },
});

export const IdempotencyRecord = mongoose.model('IdempotencyRecord', idempotencySchema);
