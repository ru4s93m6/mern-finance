import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Transaction {
    _id: string;
    amount: number;
    date: string;
    type: string;
    category?: string;
    note?: string;
}

interface ExpenseCalendarProps {
    transactions: Transaction[];
    year: number;
    month: number;
}

export default function ExpenseCalendar({ transactions, year, month }: ExpenseCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isdetailsOpen, setIsDetailsOpen] = useState(false);

    const currentDate = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Generate days
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty slots for start of week (Sunday start)
    const startDayOfWeek = getDay(monthStart);
    const emptySlots = Array.from({ length: startDayOfWeek });

    // Helper to get daily total
    const getDailyTotal = (date: Date) => {
        return transactions
            .filter(t => isSameDay(new Date(t.date), date) && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsDetailsOpen(true);
    };

    const getDayTransactions = () => {
        if (!selectedDate) return [];
        return transactions.filter(t => isSameDay(new Date(t.date), selectedDate)).sort((a, b) => b.amount - a.amount);
    };

    const selectedDayTransactions = getDayTransactions();

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
            {/* Week Headers */}
            <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2">{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-md" />
                ))}

                {days.map(day => {
                    const total = getDailyTotal(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "h-24 border rounded-md p-2 flex flex-col justify-between cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50",
                                isToday && "bg-blue-50 border-blue-200"
                            )}
                        >
                            <span className={cn(
                                "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                isToday ? "bg-blue-500 text-white" : "text-gray-700"
                            )}>
                                {format(day, 'd')}
                            </span>

                            {total > 0 && (
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-red-500 block truncate">
                                        -${total.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Daily Details Dialog */}
            <Dialog open={isdetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedDate && format(selectedDate, 'M月d日')} 消費明細</DialogTitle>
                        <DialogDescription>
                            當日消費總額: <span className="text-red-600 font-bold">${selectedDate && getDailyTotal(selectedDate).toLocaleString()}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {selectedDayTransactions.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">本日無紀錄</div>
                        ) : (
                            selectedDayTransactions.map(t => (
                                <div key={t._id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                            ${t.type === 'expense' ? 'bg-red-100 text-red-600' :
                                                t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {t.type === 'expense' ? '出' : t.type === 'income' ? '入' : '轉'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{t.category || (t.type === 'transfer' ? '轉帳' : '交易')}</div>
                                            {t.note && <div className="text-xs text-gray-500">{t.note}</div>}
                                        </div>
                                    </div>
                                    <div className={`font-semibold text-sm ${t.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                                        {t.type === 'expense' ? '-' : '+'}
                                        ${t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
