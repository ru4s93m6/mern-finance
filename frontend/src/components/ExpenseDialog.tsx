import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAccounts } from '@/hooks/useAccount';
import { Account } from '@/types/account';

const CATEGORIES = ['食物', '交通', '娛樂', '購物', '居住', '醫療', '教育', '其他'];

interface ExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTransaction?: any; // To be typed properly later
}


interface ApiError {
    response?: {
        data?: {
            message?: string;
        }
    }
}

interface TransactionData {
    type: string;
    amount: number;
    category: string;
    sourceAccount: string | null;
    note: string;
    date: Date;
}

export default function ExpenseDialog({ open, onOpenChange, editingTransaction }: ExpenseDialogProps) {
    const { data: accounts } = useAccounts();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [sourceAccountId, setSourceAccountId] = useState<string>('cash'); // 'cash' or accountId
    const [note, setNote] = useState('');
    const [date, setDate] = useState<Date>(new Date());

    // Reset form helper
    const resetForm = () => {
        setAmount('');
        setCategory('');
        setSourceAccountId('cash');
        setNote('');
        setDate(new Date());
    };

    // Populate Form for Editing
    useEffect(() => {
        if (open && editingTransaction) {
            setAmount(editingTransaction.amount.toString());
            setCategory(editingTransaction.category);
            setSourceAccountId(editingTransaction.sourceAccount || 'cash');
            setNote(editingTransaction.note || '');
            setDate(new Date(editingTransaction.date));
        } else if (open && !editingTransaction) {
            resetForm();
        }
    }, [open, editingTransaction]);

    const createTransactionMutation = useMutation({
        mutationFn: async (newTransaction: TransactionData) => {
            const { data } = await api.post('/transactions', newTransaction);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Balance updates
            queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
            toast.success('記帳成功！');
            onOpenChange(false);
            resetForm();
        },
        onError: (error: ApiError) => {
            toast.error(error.response?.data?.message || '記帳失敗');
        },
    });

    const updateTransactionMutation = useMutation({
        mutationFn: async (updatedData: TransactionData) => {
            const { data } = await api.put(`/transactions/${editingTransaction._id}`, updatedData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
            toast.success('更新成功！');
            onOpenChange(false);
            resetForm();
        },
        onError: (error: ApiError) => {
            toast.error(error.response?.data?.message || '更新失敗');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !category) {
            toast.error('請填寫金額與類別');
            return;
        }

        const payload = {
            type: 'expense',
            amount: Number(amount),
            category,
            sourceAccount: sourceAccountId === 'cash' ? null : sourceAccountId,
            note,
            date,
        };

        if (editingTransaction) {
            updateTransactionMutation.mutate(payload);
        } else {
            createTransactionMutation.mutate(payload);
        }
    };

    const isPending = createTransactionMutation.isPending || updateTransactionMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingTransaction ? '編輯消費' : '新增消費'}</DialogTitle>
                    <DialogDescription>記錄您的日常開支</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Amount */}
                    <div className="grid gap-2">
                        <Label htmlFor="amount">金額</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="grid gap-2">
                        <Label htmlFor="category">類別</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇類別" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Source */}
                    <div className="grid gap-2">
                        <Label htmlFor="source">支付來源</Label>
                        <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇來源" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">現金</SelectItem>
                                {accounts?.map((acc: Account) => (
                                    <SelectItem key={acc._id} value={acc._id}>
                                        {acc.name} (${acc.balance})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="grid gap-2">
                        <Label>日期</Label>
                        {/* Using Input type=date for simplicity/mobile friendly, or stick to Popover/Calendar if installed */}
                        <Input
                            type="date"
                            value={format(date, 'yyyy-MM-dd')}
                            onChange={(e) => setDate(new Date(e.target.value))}
                        />
                    </div>

                    {/* Note */}
                    <div className="grid gap-2">
                        <Label htmlFor="note">備註 (心情小語)</Label>
                        <Textarea
                            id="note"
                            placeholder="關於消費細項的說明或是心情小語"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? '處理中...' : (editingTransaction ? '更新' : '儲存')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
