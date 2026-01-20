import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, List, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

import ExpenseDialog from '@/components/ExpenseDialog';
import MonthlyChart from '@/components/MonthlyChart';
import DailyTrendChart from '@/components/DailyTrendChart';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import api from '@/lib/api';

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    category: string;
    note: string;
    date: string;
    sourceAccount?: string;
}

export default function ExpensePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('overview');

    // For Delete Confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Fetch Monthly Stats (Existing Bar Chart)
    const { data: statsData } = useQuery({
        queryKey: ['monthlyStats', year, month],
        queryFn: async () => {
            const { data } = await api.get(`/transactions/stats/${year}/${month}`);
            return data.data;
        }
    });

    // Fetch All Transactions for Month (New for Calendar & Trend & List)
    const { data: monthlyTransactions, isLoading: isTransLoading } = useQuery({
        queryKey: ['transactions', 'month', year, month],
        queryFn: async () => {
            const { data } = await api.get(`/transactions/month/${year}/${month}`);
            return data.data; // Expecting array of transactions
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/transactions/${id}`);
        },
        onSuccess: () => {
            toast.success('刪除成功');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setDeleteId(null);
        },
        onError: () => {
            toast.error('刪除失敗');
            setDeleteId(null);
        }
    });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header / Month Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold w-24 text-center">
                        {year}年 {month}月
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => { setEditingTransaction(undefined); setIsDialogOpen(true); }} className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        記帳
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="overview" className="gap-2"><LayoutGrid className="h-4 w-4" /> 總覽</TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2"><CalendarIcon className="h-4 w-4" /> 日曆</TabsTrigger>
                    <TabsTrigger value="list" className="gap-2"><List className="h-4 w-4" /> 明細</TabsTrigger>
                </TabsList>

                {/* TAB: OVERVIEW */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MonthlyChart data={statsData || []} />
                        {/* We need to pass transactions to DailyTrendChart */}
                        {monthlyTransactions && (
                            <DailyTrendChart
                                transactions={monthlyTransactions}
                                year={year}
                                month={month}
                            />
                        )}
                    </div>
                </TabsContent>

                {/* TAB: CALENDAR */}
                <TabsContent value="calendar" className="mt-6">
                    {monthlyTransactions && (
                        <ExpenseCalendar
                            transactions={monthlyTransactions}
                            year={year}
                            month={month}
                        />
                    )}
                </TabsContent>

                {/* TAB: LIST (Details) */}
                <TabsContent value="list" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">本月消費明細</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-0 divide-y">
                                {isTransLoading ? (
                                    <div className="py-8 text-center text-gray-500">載入中...</div>
                                ) : (!monthlyTransactions || monthlyTransactions.length === 0) ? (
                                    <div className="py-12 text-center text-gray-400">
                                        本月尚無消費紀錄
                                    </div>
                                ) : (
                                    monthlyTransactions.map((t: Transaction) => (
                                        <div key={t._id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors px-2 rounded-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center
                                                    ${t.type === 'expense' ? 'bg-red-100 text-red-600' :
                                                        t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
                                                `}>
                                                    <span className="text-sm font-bold">{t.category ? t.category.charAt(0) : (t.type === 'transfer' ? '轉' : '交')}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{t.category || (t.type === 'transfer' ? '轉帳' : '交易')}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{formatDate(t.date)}</span>
                                                        {t.note && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{t.note}</span>
                                                            </>
                                                        )}
                                                        {t.sourceAccount && <span className="text-blue-400 hidden group-hover:inline">(Account)</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`font-semibold ${t.type === 'expense' ? 'text-red-600' : t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                                                    ${t.amount.toLocaleString()}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(t)}>
                                                            <Edit className="mr-2 h-4 w-4" /> 編輯
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(t._id)} className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> 刪除
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ExpenseDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingTransaction={editingTransaction}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除這筆紀錄嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此動作無法復原。刪除後，相關帳戶餘額將會自動還原。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">
                            確認刪除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
