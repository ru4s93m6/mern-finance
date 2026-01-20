import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String, // 'expense', 'income', 'transfer'
        required: true,
        enum: ['expense', 'income', 'transfer'],
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: function () { return this.type !== 'transfer'; }
    },
    sourceAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null, // null means Cash
    },
    destinationAccount: { // Only for transfers
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        trim: true,
    },
});

export default mongoose.model('Transaction', transactionSchema);
