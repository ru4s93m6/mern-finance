import Transaction from '../models/Transaction.js';
import Account from '../modules/Account.js';
// @desc Get Transactions by Month (Raw List)
// @route GET /api/transactions/month/:year/:month
export const getTransactionsByMonth = async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    try {
        const transactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        res.status(200).json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
import mongoose from 'mongoose';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(20); // Limit for now, pagination later

        res.status(200).json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
    const { type, amount, category, sourceAccount, destinationAccount, note, date } = req.body;

    try {
        // Validate
        if (!type || !amount) {
            return res.status(400).json({ success: false, message: 'Please provide type and amount' });
        }

        const transactionData = {
            user: req.user.id,
            type,
            amount,
            category,
            sourceAccount,
            destinationAccount,
            note,
            date: date || Date.now()
        };

        // Handle Balance Updates
        if (type === 'expense') {
            if (sourceAccount) {
                const account = await Account.findOne({ _id: sourceAccount, user: req.user.id });
                if (!account) return res.status(404).json({ success: false, message: 'Source account not found' });

                account.balance -= amount;
                await account.save();
            }
        } else if (type === 'income') { // Future proofing
            if (sourceAccount) { // deposit INTO this account
                const account = await Account.findOne({ _id: sourceAccount, user: req.user.id });
                if (account) {
                    account.balance += amount;
                    await account.save();
                }
            }
        } else if (type === 'transfer') {
            if (!sourceAccount || !destinationAccount) {
                return res.status(400).json({ success: false, message: 'Source and Destination required for transfer' });
            }
            const fromAcc = await Account.findOne({ _id: sourceAccount, user: req.user.id });
            const toAcc = await Account.findOne({ _id: destinationAccount, user: req.user.id });

            if (!fromAcc || !toAcc) return res.status(404).json({ success: false, message: 'Account not found' });

            fromAcc.balance -= amount;
            toAcc.balance += amount;

            await fromAcc.save();
            await toAcc.save();
        }

        const transaction = await Transaction.create(transactionData);

        res.status(201).json({ success: true, data: transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Get Monthly Stats
// @route GET /api/transactions/stats/:year/:month
export const getMonthlyStats = async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    try {
        const stats = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    type: 'expense',
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}


// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Revert Balance
        const { type, amount, sourceAccount, destinationAccount } = transaction;

        if (type === 'expense' && sourceAccount) {
            const account = await Account.findById(sourceAccount);
            if (account) {
                account.balance += amount;
                await account.save();
            }
        } else if (type === 'income' && sourceAccount) {
            const account = await Account.findById(sourceAccount);
            if (account) {
                account.balance -= amount;
                await account.save();
            }
        } else if (type === 'transfer') {
            const fromAcc = await Account.findById(sourceAccount);
            const toAcc = await Account.findById(destinationAccount);

            if (fromAcc) {
                fromAcc.balance += amount;
                await fromAcc.save();
            }
            if (toAcc) {
                toAcc.balance -= amount;
                await toAcc.save();
            }
        }

        await transaction.deleteOne();

        res.status(200).json({ success: true, message: 'Transaction removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // 1. Revert old transaction effects
        const { type: oldType, amount: oldAmount, sourceAccount: oldSource, destinationAccount: oldDest } = transaction;

        if (oldType === 'expense' && oldSource) {
            const account = await Account.findById(oldSource);
            if (account) {
                account.balance += oldAmount;
                await account.save();
            }
        } else if (oldType === 'income' && oldSource) {
            const account = await Account.findById(oldSource);
            if (account) {
                account.balance -= oldAmount;
                await account.save();
            }
        } else if (oldType === 'transfer') {
            const fromAcc = await Account.findById(oldSource);
            const toAcc = await Account.findById(oldDest);
            if (fromAcc) {
                fromAcc.balance += oldAmount;
                await fromAcc.save();
            }
            if (toAcc) {
                toAcc.balance -= oldAmount;
                await toAcc.save();
            }
        }

        // 2. Update transaction data
        const { type, amount, category, sourceAccount, destinationAccount, note, date } = req.body;

        transaction.type = type || transaction.type;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.sourceAccount = sourceAccount; // Can be null
        transaction.destinationAccount = destinationAccount;
        transaction.note = note || transaction.note;
        transaction.date = date || transaction.date;

        // 3. Apply new transaction effects
        const newType = transaction.type;
        const newAmount = transaction.amount;
        const newSource = transaction.sourceAccount;
        const newDest = transaction.destinationAccount;

        if (newType === 'expense' && newSource) {
            const account = await Account.findById(newSource);
            if (account) {
                account.balance -= newAmount;
                await account.save();
            }
        } else if (newType === 'income' && newSource) {
            const account = await Account.findById(newSource);
            if (account) {
                account.balance += newAmount;
                await account.save();
            }
        } else if (newType === 'transfer') {
            const fromAcc = await Account.findById(newSource);
            const toAcc = await Account.findById(newDest);
            if (fromAcc) {
                fromAcc.balance -= newAmount;
                await fromAcc.save();
            }
            if (toAcc) {
                toAcc.balance += newAmount;
                await toAcc.save();
            }
        }

        await transaction.save();

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
