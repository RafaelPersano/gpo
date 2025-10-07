import React, { useState, useMemo } from 'react';
import type { ConstructionPlan } from '../types.ts';
import { BarChartIcon } from './icons/BarChartIcon.tsx';
import MonthlySpendingChart from './MonthlySpendingChart.tsx';

interface Financials {
    directCost: number;
    bdiBreakdown: {
        indirectCosts: Record<string, string>;
        taxes: Record<string, string>;
    };
}

interface FinancialScenariosSectionProps {
    financials: Financials;
    projectPlan: ConstructionPlan;
}

const FinancialScenariosSection: React.FC<FinancialScenariosSectionProps> = ({ financials, projectPlan }) => {
    const bankInterestRate = 0.15; // 15% ao ano
    const [activeProfitScenario, setActiveProfitScenario] = useState('Realista');

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(2)}M`;
        if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    
    const formatCurrencyFull = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


    const projectDurationMonths = useMemo(() => {
        const start = new Date(projectPlan.projectStartDate + 'T00:00:00');
        const end = new Date(projectPlan.projectEndDate + 'T00:00:00');
        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += end.getMonth();
        return months <= 0 ? 1 : months + 1;
    }, [projectPlan.projectStartDate, projectPlan.projectEndDate]);
    
    const parse = (val: string) => parseFloat(val) / 100 || 0;
    // FIX: Provided an initial value of 0 to `reduce` calls. This ensures the accumulator `sum` is correctly typed as `number` instead of `unknown`, preventing type errors in subsequent calculations.
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalIndirect = Object.values(financials.bdiBreakdown.indirectCosts).reduce((sum, val) => sum + parse(String(val)), 0);
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalTaxesBDI = Object.values(financials.bdiBreakdown.taxes).reduce((sum, val) => sum + parse(String(val)), 0);

    const profitScenarios = useMemo(() => [
        { name: 'Pessimista', margin: 15 },
        { name: 'Realista', margin: 22 },
        { name: 'Otimista', margin: 30 },
    ], []);

    const salesTimings = useMemo(() => [
        { name: 'Na Planta', interestDurationMonths: projectDurationMonths / 2 },
        { name: 'Na Entrega', interestDurationMonths: projectDurationMonths },
        { name: '6 meses pós-entrega', interestDurationMonths: projectDurationMonths + 6 },
    ], [projectDurationMonths]);

    const financingLevels = useMemo(() => [
        { name: '0% Financiado', percent: 0, color: 'bg-sky-300', hoverColor: 'bg-sky-400' },
        { name: '50% Financiado', percent: 50, color: 'bg-sky-500', hoverColor: 'bg-sky-600' },
        { name: '100% Financiado', percent: 100, color: 'bg-sky-700', hoverColor: 'bg-sky-700' },
    ], []);

    const fullScenarioData = useMemo(() => {
        const data: Record<string, Array<{ timingName: string; profits: Record<number, number>}>> = {};

        profitScenarios.forEach(scenario => {
            data[scenario.name] = salesTimings.map(timing => {
                const profits: Record<number, number> = {};
                financingLevels.forEach(level => {
                    const financedAmount = financials.directCost * (level.percent / 100);
                    const interestCost = (financedAmount * bankInterestRate * (timing.interestDurationMonths / 12));
                    
                    const profitMargin = scenario.margin / 100;
                    const denominator = 1 - (totalTaxesBDI + profitMargin);
                    if (denominator <= 0) {
                        profits[level.percent] = -Infinity;
                        return;
                    }
                    const bdiRate = (((1 + totalIndirect) / denominator) - 1);
                    const finalPrice = financials.directCost * (1 + bdiRate);
                    const profitValue = finalPrice * profitMargin;
                    
                    profits[level.percent] = profitValue - interestCost;
                });
                return { timingName: timing.name, profits };
            });
        });
        return data;
    }, [financials.directCost, bankInterestRate, profitScenarios, salesTimings, financingLevels, totalIndirect, totalTaxesBDI]);

    const activeChartData = fullScenarioData[activeProfitScenario];
    // FIX: Explicitly typed the parameter `d` in flatMap to ensure correct property access and type inference.
    // FIX: Explicitly typed the parameter `d` in flatMap to ensure correct property access and type inference.
    const maxProfit = Math.max(...Object.values(fullScenarioData).flat().flatMap((d: { profits: Record<number, number> }) => Object.values(d.profits)), 0);
    // FIX: Explicitly typed the parameter `d` in flatMap to ensure correct property access and type inference.
    const minProfit = Math.min(...Object.values(fullScenarioData).flat().flatMap((d: { profits: Record<number, number> }) => Object.values(d.profits)), 0);
    const hasNegativeValues = minProfit < 0;
    const chartRange = maxProfit - (hasNegativeValues ? minProfit : 0);
    const zeroLinePercent = hasNegativeValues ? (maxProfit / chartRange) * 100 : 100;


    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Análise de Cenários para Investidores</h2>
            <p className="text-slate-600 mb-6">Simule o impacto do financiamento e analise diferentes cenários de lucratividade e venda para tomar decisões mais informadas.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <MonthlySpendingChart projectPlan={projectPlan} />
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                        <BarChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Gráfico de Cenários de Financiamento e Venda
                    </h3>
                    
                    <div className="flex justify-center mb-4 border-b border-slate-200">
                      {profitScenarios.map(scenario => (
                        <button 
                            key={scenario.name} 
                            onClick={() => setActiveProfitScenario(scenario.name)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeProfitScenario === scenario.name ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {scenario.name} ({scenario.margin}%)
                        </button>
                      ))}
                    </div>

                    <div className="flex h-64">
                         <div className="flex flex-col justify-between text-xs text-slate-500 text-right pr-2">
                            <span>{formatCurrency(maxProfit)}</span>
                            {hasNegativeValues && <span>{formatCurrency(0)}</span>}
                            <span>{hasNegativeValues ? formatCurrency(minProfit) : formatCurrency(0)}</span>
                         </div>
                         <div className="flex-1 flex justify-around border-l border-slate-200 relative">
                            {hasNegativeValues && <div className="absolute w-full border-t border-dashed border-slate-400" style={{ top: `${zeroLinePercent}%`}}></div>}
                            {activeChartData.map((dataPoint, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end px-2">
                                    <div className="relative w-full flex justify-center items-end" style={{ height: `${zeroLinePercent}%`}}>
                                        {financingLevels.map((level, j) => {
                                            const profit = dataPoint.profits[level.percent];
                                            const height = (profit / maxProfit) * 100;
                                            return (
                                                <div key={j} className={`w-1/4 mx-1 group rounded-t-sm ${level.color} hover:${level.hoverColor} transition-all`} style={{ height: `${height}%` }}>
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block p-1.5 text-xs text-white bg-slate-800 rounded-md shadow-lg z-10 whitespace-nowrap">
                                                       {formatCurrencyFull(profit)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {hasNegativeValues && (
                                        <div className="relative w-full flex justify-center items-start" style={{ height: `${100 - zeroLinePercent}%`}}>
                                        {financingLevels.map((level, j) => {
                                            const profit = dataPoint.profits[level.percent];
                                            if (profit >= 0) return <div key={j} className="w-1/4 mx-1"></div>;
                                            const height = (Math.abs(profit) / Math.abs(minProfit)) * 100;
                                            return (
                                                <div key={j} className={`w-1/4 mx-1 group rounded-b-sm ${level.color} hover:${level.hoverColor} transition-all`} style={{ height: `${height}%` }}>
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block p-1.5 text-xs text-white bg-slate-800 rounded-md shadow-lg z-10 whitespace-nowrap">
                                                       {formatCurrencyFull(profit)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-500 mt-1 text-center">{dataPoint.timingName}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                     <div className="flex justify-center items-center space-x-4 mt-4 text-xs">
                        {financingLevels.map(level => (
                            <div key={level.percent} className="flex items-center">
                                <span className={`w-3 h-3 rounded-sm mr-1.5 ${level.color}`}></span>
                                <span>{level.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-700 mb-2">Matriz de Lucratividade Detalhada (Base: 50% Financiado)</h3>
                <p className="text-sm text-slate-500 mb-4">A tabela abaixo mostra os valores detalhados para o cenário com 50% de financiamento, que serve de base para o gráfico.</p>
                 <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Cenário de Lucro</th>
                                {salesTimings.map(timing => (
                                    <th key={timing.name} className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">{timing.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {profitScenarios.map(scenario => {
                                const profitMargin = scenario.margin / 100;
                                const denominator = 1 - (totalTaxesBDI + profitMargin);
                                if (denominator <= 0) return null;

                                const bdiRate = (((1 + totalIndirect) / denominator) - 1);
                                const finalPrice = financials.directCost * (1 + bdiRate);
                                const profitValue = finalPrice * profitMargin;

                                return (
                                    <tr key={scenario.name} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-base text-slate-900">
                                            <div className="font-bold">{scenario.name}</div>
                                            <div className="text-sm text-slate-500">Margem: {scenario.margin}% | Venda: {formatCurrencyFull(finalPrice)}</div>
                                        </td>
                                        {salesTimings.map(timing => {
                                            const financedAmount = financials.directCost * (50 / 100);
                                            const interestCost = (financedAmount * bankInterestRate * (timing.interestDurationMonths / 12));
                                            const netProfit = profitValue - interestCost;
                                            return (
                                                <td key={timing.name} className="px-4 py-3 text-right text-base text-slate-600 whitespace-nowrap">
                                                    <span className={`font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrencyFull(netProfit)}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialScenariosSection;