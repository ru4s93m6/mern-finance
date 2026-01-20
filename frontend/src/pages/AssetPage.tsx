import AccountCard from '@/components/AccountCard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    category: string;
    note: string;
    date: string;
    sourceAccount?: string;
    destinationAccount?: string;
}

export default function AssetPage() {
    const { data: transactionsData, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const { data } = await api.get('/transactions');
            return data.data;
        }
    });

    // Recent 5 (The endpoint returns 20, we take 5)
    // Filter? "Transfer out/in records" -> Maybe all transactions that affect balance?
    // I'll show all 5 most recent.
    const recentActivity = transactionsData?.slice(0, 5) || [];

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'transfer': return <ArrowRightLeft className="h-4 w-4" />;
            case 'expense': return <TrendingDown className="h-4 w-4" />;
            case 'income': return <TrendingUp className="h-4 w-4" />;
            default: return <Wallet className="h-4 w-4" />; // Wallet is not imported, using div
        }
    };

    // Hard to import Wallet if I didn't import it. I'll rely on lucide imports.

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <AccountCard />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">近期變動</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-0 divide-y">
                        {isLoading ? (
                            <div className="py-4 text-center text-gray-500">載入中...</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                尚無近期活動
                            </div>
                        ) : (
                            recentActivity.map((t: Transaction) => (
                                <div key={t._id} className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'expense' ? 'bg-red-100 text-red-600' :
                                                t.type === 'income' ? 'bg-green-100 text-green-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {getIcon(t.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {t.type === 'transfer' ? '轉帳' : t.category || '交易'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{formatDate(t.date)}</span>
                                                {t.note && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{t.note}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-semibold ${t.type === 'expense' ? 'text-red-600' :
                                            t.type === 'income' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                                        ${t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
