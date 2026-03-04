import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    }, // e.g., 'customerId', 'orderId'
    seq: {
        type: Number,
        default: 0
    }
});

// Atomic Increments Utility Generator
counterSchema.statics.getNextSequenceValue = async function (sequenceName) {
    const sequenceDocument = await this.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.seq;
};

export const Counter = mongoose.model('Counter', counterSchema);