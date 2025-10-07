
import React, { useMemo } from 'react';
import type { ConstructionPlan } from '../types.ts';
import { BarChartIcon } from './icons/BarChartIcon.tsx';

interface MonthlySpendingChartProps {
    projectPlan: ConstructionPlan;
}

const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({ projectPlan }) => {
    const formatCurrency = (value: number) => {
        if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
        return `R$ ${value.toFixed(0)}`;
    };

    const monthlyData = useMemo(() => {
        const spendingByMonth: Record<string, number> = {};
        
        projectPlan.paymentSchedule.forEach(payment => {
            const date = new Date(payment.dueDate + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + payment.amount;
        });

        const sortedMonths = Object.keys(spendingByMonth).sort();
        if (sortedMonths.length === 0) {
            return { labels: [], values: [], maxSpending: 0 };
        }
        const maxSpending = Math.max(...Object.values(spendingByMonth));

        return {
            labels: sortedMonths.map(key => {
                const [year, month] = key.split('-');
                return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('pt-BR', { month: 'short' });
            }),
            values: sortedMonths.map(key => spendingByMonth[key]),
            maxSpending
        };
    }, [projectPlan.paymentSchedule]);

    if (monthlyData.values.length === 0) {
        return <p className="text-center text-slate-500 text-sm h-full flex items-center justify-center">Sem dados de pagamento para exibir o gráfico de desembolso.</p>;
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                <BarChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                Desembolso Mensal
            </h3>
            <div className="flex justify-around items-end h-48 space-x-2">
                {monthlyData.values.map((value, index) => {
                    const heightPercent = monthlyData.maxSpending > 0 ? (value / monthlyData.maxSpending) * 100 : 0;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md -mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{formatCurrency(value)}</span>
                            <div
                                className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                                style={{ height: `${heightPercent}%` }}
                                title={`${monthlyData.labels[index]}: ${formatCurrency(value)}`}
                            />
                            <span className="text-xs text-slate-500 mt-1 uppercase font-semibold">{monthlyData.labels[index]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthlySpendingChart;
