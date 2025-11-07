export type AccountType = 'bank' | 'cash' | 'credit' | 'investment';

export type BasicAccount = {
    name: string;
    accountType: AccountType;
    balance: number;
    currency?: string; // Future extenstion feature
    note?: string;
}

export type Account = BasicAccount & {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export type TransferData = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    note?: string;
}

export type TransferResponse = {
    success: boolean;
    message: string;
    fromAccount: Account;
    toAccount: Account;
}

export const accountTypeMap: Record<AccountType, string> = {
    bank: "銀行",
    cash: "現金",
    credit: "信用卡",
    investment: "投資"
}