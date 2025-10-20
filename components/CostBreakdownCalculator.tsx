import React, { useState, useMemo } from 'react';
import { costBreakdownData } from '../data/costBreakdownData';
import { PieChartIcon } from './icons/PieChartIcon';
import { SpreadsheetIcon } from './icons/SpreadsheetIcon';
import PieChart from './PieChart';

const CostBreakdownCalculator: React.FC = () => {
    const [totalCost, setTotalCost] = useState<string>('207254.00');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const calculation = useMemo(() => {
        const costValue = parseFloat(totalCost);
        if (isNaN(costValue) || costValue <= 0) {
            return {
                breakdown: costBreakdownData.map(phase => ({
                    ...phase,
                    percentage: `${phase.minPercent.toFixed(2)}%`,
                    cost: 'R$ 0,00',
                    avgPercent: phase.minPercent
                })),
                isValid: false
            };
        }

        const breakdown = costBreakdownData.map(phase => {
            const cost = costValue * (phase.minPercent / 100);
            return {
                ...phase,
                percentage: `${phase.minPercent.toFixed(2)}%`.replace('.',','),
                cost: formatCurrency(cost),
                avgPercent: phase.minPercent
            };
        });

        return { breakdown, isValid: true };
    }, [totalCost]);

    const pieChartData = useMemo(() => {
        return calculation.breakdown.map(item => ({
            label: item.phase,
            value: item.avgPercent,
            color: item.color,
        }));
    }, [calculation.breakdown]);

    const exportToCsv = () => {
        if (!calculation.isValid) return;

        const headers = ['Etapa', 'Percentual (%)', 'Custo Estimado (R$)'];
        
        const costValue = parseFloat(totalCost);
        const rows = calculation.breakdown.map(phase => {
             const cost = (costValue * (phase.minPercent / 100)).toFixed(2).replace('.', ',');
            return [
                `"${phase.phase}"`,
                `"${phase.minPercent.toFixed(2).replace('.', ',')}"`,
                `"${cost}"`
            ].join(';');
        });

        const csvContent = [headers.join(';'), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `distribuicao_custo_obra.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                <PieChartIcon className="w-6 h-6 mr-3 text-blue-600" />
                Calculadora de Custo por Etapa da Obra
            </h3>
            <p className="text-slate-600 mb-8">
                Insira o custo total estimado da sua obra para ver a distribuição de valores em cada fase, com base em percentuais para uma <strong className="text-slate-700">Residência Padrão Normal (Ref. CUB/SP - Set/2021)</strong>.
            </p>

            <div className="mb-6 max-w-sm">
                <label htmlFor="total-cost-input" className="block text-sm font-medium text-slate-700 mb-1">Custo Total da Obra</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">R$</span>
                    <input
                        type="number"
                        id="total-cost-input"
                        value={totalCost}
                        onChange={(e) => setTotalCost(e.target.value)}
                        className="w-full h-12 p-3 pl-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                        placeholder="207254.00"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Results Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Etapa da Obra</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Custo Estimado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {calculation.breakdown.map((item) => (
                                <tr key={item.phase} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-base text-slate-900">
                                      <div className="font-medium">{item.phase}</div>
                                      <div className="text-sm text-slate-500">{item.percentage}</div>
                                    </td>
                                    <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap font-semibold">{item.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chart */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
                    <h4 className="text-lg font-bold text-slate-700 text-center mb-4">Distribuição Percentual</h4>
                     <PieChart data={pieChartData} />
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={exportToCsv}
                    disabled={!calculation.isValid}
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <SpreadsheetIcon className="w-5 h-5 mr-2" />
                    Exportar Análise de Custos
                </button>
            </div>
        </div>
    );
};

export default CostBreakdownCalculator;