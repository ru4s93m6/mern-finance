import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ArrowRightLeft } from "lucide-react"
import { Account, accountTypeMap, TransferData } from "@/types/account"
import { useTransferAccount } from "@/hooks/useAccount"
import { toast } from "sonner"

type TransferDialogProps = {
    fromAccount: Account;
    accounts: Account[];
}

export default function TransferDialog({ fromAccount, accounts }: TransferDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        toAccountId: "",
        amount: "",
        note: ""
    })

    const transferAccount = useTransferAccount()

    // Filter out the current account from options
    const availableAccounts = accounts.filter(acc => acc._id !== fromAccount._id)

    // Get selected account for validation
    const selectedAccount = availableAccounts.find(acc => acc._id === formData.toAccountId)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const amount = Number(formData.amount)

        // Validation
        if (!formData.toAccountId) {
            toast.error("請選擇目標帳戶")
            return
        }

        if (amount <= 0) {
            toast.error("金額必須大於 0")
            return
        }

        if (amount > fromAccount.balance) {
            toast.error("轉帳金額超過帳戶餘額", {
                description: `目前餘額：${fromAccount.balance.toLocaleString()}`
            })
            return
        }

        try {
            const transferData: TransferData = {
                fromAccountId: fromAccount._id,
                toAccountId: formData.toAccountId,
                amount: amount,
                note: formData.note
            }

            const res = await transferAccount.mutateAsync(transferData)
            console.log("Transfer response:", res)
            if(res.success){
                const toAccount = availableAccounts.find(acc => acc._id === formData.toAccountId)
                toast.success("轉帳成功！", {
                    description: `已從 ${fromAccount.name} 轉出 ${amount.toLocaleString()} 至 ${toAccount?.name}`
                })

                // Reset form and remain open state so user can do multiple transfers
                setFormData({
                    toAccountId: "",
                    amount: "",
                    note: ""
                })
            }
        } catch (error) {
            console.error("Transfer failed:", error)
            toast.error("轉帳失敗", {
                description: "請稍後再試"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    <ArrowRightLeft className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>轉帳</DialogTitle>
                    <DialogDescription>
                        從「{fromAccount.name}」轉帳至其他帳戶
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* From Account (Read-only) */}
                        <div className="grid gap-2">
                            <Label>來源帳戶</Label>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-medium">{fromAccount.name}</span>
                                <span className="text-sm text-gray-600">
                                    餘額：{fromAccount.balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* To Account */}
                        <div className="grid gap-2">
                            <Label htmlFor="toAccount">目標帳戶</Label>
                            <Select
                                value={formData.toAccountId}
                                onValueChange={(value) => 
                                    setFormData(prev => ({ ...prev, toAccountId: value }))
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="選擇目標帳戶" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAccounts.map(account => (
                                        <SelectItem key={account._id} value={account._id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{account.name}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({accountTypeMap[account.accountType]})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedAccount && (
                                <p className="text-xs text-gray-500">
                                    目標帳戶餘額：{selectedAccount.balance.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">轉帳金額</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                min="0"
                                max={fromAccount.balance}
                                value={formData.amount}
                                onChange={(e) => 
                                    setFormData(prev => ({ ...prev, amount: e.target.value }))
                                }
                                required
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>可用餘額：{fromAccount.balance.toLocaleString()}</span>
                                <button
                                    type="button"
                                    className="text-blue-600 hover:underline"
                                    onClick={() => 
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            amount: fromAccount.balance.toString() 
                                        }))
                                    }
                                >
                                    全部轉出
                                </button>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="grid gap-2">
                            <Label htmlFor="note">備註 (可選)</Label>
                            <Textarea
                                id="note"
                                placeholder="例如：薪資轉投資帳戶"
                                value={formData.note}
                                onChange={(e) => 
                                    setFormData(prev => ({ ...prev, note: e.target.value }))
                                }
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            取消
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={transferAccount.isPending}
                        >
                            {transferAccount.isPending ? "處理中..." : "確認轉帳"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}