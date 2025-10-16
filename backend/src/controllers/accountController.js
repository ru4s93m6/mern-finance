export const getAccounts = (req, res) => {
    res.status(200).json({ message: 'Get all accounts' });
}

export const createAccount = (req, res) => {
    res.status(201).json({ message: 'Account created' });
}

export const getAccountById = (req, res) => {
    const { id } = req.params;
    res.status(200).json({ message: `Get account with ID: ${id}` });
}

export const updateAccount = (req, res) => {
    const { id } = req.params;
    res.status(200).json({ message: `Account with ID: ${id} updated` });
}

export const deleteAccount = (req, res) => {
    const { id } = req.params;
    res.status(200).json({ message: `Account with ID: ${id} deleted` });
}