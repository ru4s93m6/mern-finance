import Account from "../modules/Account.js";
import Transaction from "../models/Transaction.js";

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user.id });
        res.status(200).json(accounts);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getAccountById = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await Account.findOne({ _id: id, user: req.user.id });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(account);
    } catch (error) {
        console.error("Error fetching account:", error);
        res.status(500).json({ message: error.message });
    }
}

export const createAccount = async (req, res) => {
    const { name, accountType, balance, currency, note } = req.body;
    try {
        const newAccount = new Account({
            name,
            accountType,
            balance,
            currency,
            note,
            user: req.user.id
        });
        const savedAccount = await newAccount.save();
        res.status(201).json({ success: true, data: savedAccount });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ message: error.message });
    }

}

export const updateAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedAccount = await Account.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(updatedAccount);
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAccount = await Account.findOneAndDelete({ _id: id, user: req.user.id });
        if (!deletedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: error.message });
    }
}

export const transferBetweenAccounts = async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount, note } = req.body;

        // Validate
        if (!fromAccountId || !toAccountId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Get accounts
        const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user.id });
        const toAccount = await Account.findOne({ _id: toAccountId, user: req.user.id });

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Check balance
        if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Perform transfer
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save();
        await toAccount.save();

        // Record transaction history
        await Transaction.create({
            user: req.user.id,
            type: 'transfer',
            amount,
            sourceAccount: fromAccountId,
            destinationAccount: toAccountId,
            note,
            date: Date.now()
        });

        return res.json({
            success: true,
            message: 'Transfer successful',
            fromAccount,
            toAccount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}