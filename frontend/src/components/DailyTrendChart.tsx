import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, getDate, lastDayOfMonth } from 'date-fns';

interface Transaction {
    _id: string;
    amount: number;
    date: string;
    type: string;
}

interface DailyTrendChartProps {
    transactions: Transaction[];
    year: number;
    month: number;
}

export default function DailyTrendChart({ transactions, year, month }: DailyTrendChartProps) {
    // 1. Prepare data: Group by day
    const daysInMonth = getDate(lastDayOfMonth(new Date(year, month - 1)));
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return { day, amount: 0 };
    });

    transactions.forEach(t => {
        if (t.type === 'expense') {
            const date = new Date(t.date);
            // Ensure we are in the correct month (should be filtered by API but safety check)
            if (date.getMonth() + 1 === month && date.getFullYear() === year) {
                const day = date.getDate();
                if (dailyData[day - 1]) {
                    dailyData[day - 1].amount += t.amount;
                }
            }
        }
    });

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{month}月{label}日</p>
                    <p className="text-blue-600 font-semibold">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">每日消費趨勢</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
