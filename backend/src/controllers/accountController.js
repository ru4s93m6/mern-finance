import Account from "../modules/Account.js";

export const getAccounts = async(req, res) => {
    try{
        const accounts = await Account.find();
        res.status(200).json(accounts);
    }catch(error){
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getAccountById = async(req, res) => {
    const { id } = req.params;
    try{
        const account = await Account.findById(id);
        if(!account){
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(account);
    }catch(error){
        console.error("Error fetching account:", error);
        res.status(500).json({ message: error.message });
    }
}

export const createAccount = async(req, res) => {
    const { name, accountType, balance, currency, note } = req.body;
    try{
        const newAccount = new Account({name, accountType, balance, currency, note});
        const savedAccount = await newAccount.save();
        res.status(201).json({success:true, data:savedAccount});
    }catch(error){
        console.error("Error creating account:", error);
        res.status(500).json({ message: error.message });
    }

}

export const updateAccount = async(req, res) => {
    const { id } = req.params;
    try{
        const updatedAccount = await Account.findByIdAndUpdate(id, req.body, { new: true });
        if(!updatedAccount){
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(updatedAccount);
    }catch(error){
        console.error("Error updating account:", error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteAccount = async(req, res) => {
    const { id } = req.params;
    try{
        const deletedAccount = await Account.findByIdAndDelete(id);
        if(!deletedAccount){
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json({ message: "Account deleted successfully" });
    }catch(error){
        console.error("Error deleting account:", error);
        res.status(500).json({ message: error.message });
    }
}