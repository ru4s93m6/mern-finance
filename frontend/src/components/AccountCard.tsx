import { useState } from "react"
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent,
    CardAction
} from "./ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "./ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog"
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
import { Badge } from "./ui/badge"
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react"
import { useAccounts, useAddAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useAccount"
import { BasicAccount, Account, AccountType, accountTypeMap } from "@/types/account"
import { toast } from "sonner" 

// Form data type
type FormData = {
    name: string;
    accountType: AccountType | "";
    balance: string;
    note: string;
}

export default function AccountCard() {
    const [open, setOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
    
    const [formData, setFormData] = useState<FormData>({
        name: "",
        accountType: "",
        balance: "",
        note: ""
    })

    // React Query hooks
    const { data: accounts = [], isLoading, error } = useAccounts()
    const addAccount = useAddAccount()
    const updateAccount = useUpdateAccount()
    const deleteAccount = useDeleteAccount()

    // Filter accounts by type
    const liquidAssets = accounts.filter(acc => 
        acc.accountType === 'bank' || acc.accountType === 'cash'
    )
    const investmentAssets = accounts.filter(acc => 
        acc.accountType === 'investment'
    )

    // Calculate totals
    const liquidTotal = liquidAssets.reduce((sum, account) => sum + account.balance, 0)
    const investmentTotal = investmentAssets.reduce((sum, account) => sum + account.balance, 0)

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Open dialog for adding new account
    const handleAddNew = () => {
        setEditingAccount(null)
        setFormData({
            name: "",
            accountType: "",
            balance: "",
            note: ""
        })
        setOpen(true)
    }

    // Open dialog for editing account
    const handleEdit = (account: Account) => {
        setEditingAccount(account)
        setFormData({
            name: account.name,
            accountType: account.accountType,
            balance: account.balance.toString(),
            note: account.note || ""
        })
        setOpen(true)
    }

    // Open delete confirmation dialog
    const handleDeleteClick = (account: Account) => {
        setAccountToDelete(account)
        setDeleteDialogOpen(true)
    }

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!accountToDelete) return

        try {
            await deleteAccount.mutateAsync(accountToDelete._id)
            toast.success("刪除成功", {
                description: `${accountToDelete.name} 已被刪除`
            })
            setDeleteDialogOpen(false)
            setAccountToDelete(null)
        } catch (error) {
            console.error("Failed to delete account:", error)
            toast.error("刪除失敗", {
                description: "請稍後再試"
            })
        }
    }

    // Handle form submission (ADD OR EDIT)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!formData.accountType) {
            toast.error("請選擇帳戶類別")
            return
        }
        
        try {
            const accountData: BasicAccount = {
                name: formData.name,
                accountType: formData.accountType as AccountType,
                balance: Number(formData.balance),
                currency: "TWD",
                note: formData.note
            }

            if (editingAccount) {
                // Update existing account
                await updateAccount.mutateAsync({
                    id: editingAccount._id,
                    data: accountData
                })
                toast.success("更新成功！", {
                    description: `${formData.name} 已更新`,
                    className: "toast-success"
                })
            } else {
                // Add new account
                await addAccount.mutateAsync(accountData)
                toast.success("新增成功！", {
                    description: `${formData.name} 已成功加入`,
                    className: "toast-success"
                })
            }

            // Close dialog and reset form
            setOpen(false)
            setEditingAccount(null)
            setFormData({
                name: "",
                accountType: "",
                balance: "",
                note: ""
            })
        } catch (error) {
            console.error("Failed to save account:", error)
            toast.error(editingAccount ? "更新失敗" : "新增失敗", {
                description: "請稍後再試"
            })
        }
    }

    // Render account list item
    const renderAccountItem = (account: Account) => (
        <div 
            key={account._id} 
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md group"
        >
            <div className="flex items-center gap-2">
                <span className="font-medium">{account.name}</span>
                <Badge variant="secondary">
                    {accountTypeMap[account.accountType]}
                </Badge>
                {account.note && (
                    <span className="text-xs text-gray-500">{account.note}</span>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="font-semibold">
                    {account.balance.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(account)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(account)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Card className="p-4">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>我的帳戶</CardTitle>
                    <CardAction>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleAddNew}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingAccount ? "編輯帳戶" : "新增帳戶"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingAccount 
                                            ? "修改帳戶資訊"
                                            : "填寫以下資訊來新增一個帳戶"
                                        }
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-4 py-4">
                                        {/* Name */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">名稱</Label>
                                            <Input
                                                id="name"
                                                placeholder="例如：台灣銀行"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Account Type */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="accountType">類別</Label>
                                            <Select
                                                value={formData.accountType}
                                                onValueChange={(value) => handleInputChange("accountType", value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="選擇類別" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bank">銀行</SelectItem>
                                                    <SelectItem value="cash">現金</SelectItem>
                                                    <SelectItem value="credit">信用卡</SelectItem>
                                                    <SelectItem value="investment">投資</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Balance */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="balance">目前餘額</Label>
                                            <Input
                                                id="balance"
                                                type="number"
                                                placeholder="0"
                                                value={formData.balance}
                                                onChange={(e) => handleInputChange("balance", e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Note */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="note">備註 (可選)</Label>
                                            <Textarea
                                                id="note"
                                                placeholder="輸入備註..."
                                                value={formData.note}
                                                onChange={(e) => handleInputChange("note", e.target.value)}
                                                rows={3}
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
                                            disabled={addAccount.isPending || updateAccount.isPending}
                                        >
                                            {(addAccount.isPending || updateAccount.isPending)
                                                ? "處理中..." 
                                                : editingAccount ? "更新" : "新增"
                                            }
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardAction>
                </CardHeader>

                <CardContent>
                    {/* 流動資產 */}
                    <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                <span>流動資產</span>
                            </div>
                            <span className="font-semibold">
                                {isLoading ? '載入中...' : liquidTotal.toLocaleString()}
                            </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pl-8 space-y-2">
                                {isLoading && (
                                    <div className="text-center py-4 text-gray-500">載入中...</div>
                                )}
                                {error && (
                                    <div className="text-center py-4 text-red-500">
                                        錯誤：{error.message}
                                    </div>
                                )}
                                {!isLoading && !error && liquidAssets.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        尚無流動資產資料
                                    </div>
                                )}
                                {!isLoading && !error && liquidAssets.map(renderAccountItem)}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 投資資產 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                <span>投資資產</span>
                            </div>
                            <span className="font-semibold">
                                {isLoading ? '載入中...' : investmentTotal.toLocaleString()}
                            </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pl-8 space-y-2">
                                {!isLoading && !error && investmentAssets.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        尚無投資資產資料
                                    </div>
                                )}
                                {!isLoading && !error && investmentAssets.map(renderAccountItem)}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除此帳戶？</AlertDialogTitle>
                        <AlertDialogDescription>
                            刪除後將無法復原。確定要刪除「{accountToDelete?.name}」嗎？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            刪除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}