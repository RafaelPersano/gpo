import React, { useMemo, useState } from 'react';

interface Financials {
    directCost: number;
    finalPrice: number;
    netProfitValue: number;
    bdiBreakdown: {
      indirectCosts: Record<string, string>;
      taxes: Record<string, string>;
      netProfit: string;
    };
    ebitda: number;
}

interface InvestmentMatrixProps {
  financials: Financials;
  projectDurationInDays: number;
  isForPdf?: boolean;
}

const InvestmentMatrix: React.FC<InvestmentMatrixProps> = ({ financials, projectDurationInDays, isForPdf = false }) => {
    const [annualInterestRate, setAnnualInterestRate] = useState<string>('15');
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const matrixCalculations = useMemo(() => {
        const { directCost, bdiBreakdown } = financials;
        if (!directCost || !bdiBreakdown) return [];

        const calculateFinancialsForMargin = (marginPercent: number) => {
            const parse = (val: string) => parseFloat(val) / 100 || 0;
            
            const totalIndirect = Object.values(bdiBreakdown.indirectCosts).reduce<number>((sum, val) => sum + parse(String(val)), 0);
            const totalTaxesBDI = Object.values(bdiBreakdown.taxes).reduce<number>((sum, val) => sum + parse(String(val)), 0);
            const profitMargin = marginPercent / 100;
            const denominator = 1 - (totalTaxesBDI + profitMargin);

            if (denominator <= 0) return { salePrice: 0, netProfit: 0, ebitda: 0 };

            const bdiRate = (((1 + totalIndirect) / denominator) - 1);
            const salePrice = directCost * (1 + bdiRate);
            const netProfit = salePrice * profitMargin;
            const grossMargin = salePrice - directCost;
            const indirectCostsValue = directCost * totalIndirect;
            const ebitda = grossMargin - indirectCostsValue;

            return { salePrice, netProfit, ebitda };
        };

        const profitabilityScenarios = [
            { label: 'Cenário Pessimista (15%)', ...calculateFinancialsForMargin(15) },
            { label: 'Cenário Realista (22%)', ...calculateFinancialsForMargin(22) },
            { label: 'Cenário Otimista (30%)', ...calculateFinancialsForMargin(30) },
        ];

        const financingLevels = [
            { title: 'Análise com 0% de Financiamento do Custo Direto', rate: 0.0 },
            { title: 'Análise com 50% de Financiamento do Custo Direto', rate: 0.5 },
            { title: 'Análise com 100% de Financiamento do Custo Direto', rate: 1.0 },
        ];
        
        const parsedRate = parseFloat(annualInterestRate) / 100;
        const ANNUAL_INTEREST_RATE = !isNaN(parsedRate) && parsedRate >= 0 ? parsedRate : 0.15;
        const projectDurationInMonths = projectDurationInDays > 0 ? projectDurationInDays / 30.44 : 8; // Default to 8 months if duration is 0

        const saleTimings = [
            { label: 'VENDA NA PLANTA', months: projectDurationInMonths * 0.5 },
            { label: 'VENDA NA ENTREGA', months: projectDurationInMonths },
            { label: 'VENDA 6 MESES PÓS-ENTREGA', months: projectDurationInMonths + 6 },
        ];

        const results = financingLevels.map(fin => {
            const financedAmount = directCost * fin.rate;
            const scenarios = profitabilityScenarios.map(prof => {
                const cells = saleTimings.map(time => {
                    const monthlyRate = ANNUAL_INTEREST_RATE / 12;
                    // Juros compostos: P * ((1 + r)^t - 1)
                    const interest = financedAmount * (Math.pow(1 + monthlyRate, time.months) - 1);
                    const finalProfit = prof.netProfit - interest;
                    const roi = directCost > 0 ? (finalProfit / directCost) * 100 : 0;
                    return { interest, finalProfit, roi };
                });
                return { ...prof, cells };
            });
            return { ...fin, financedAmount, scenarios, saleTimings };
        });

        return results;
    }, [financials, projectDurationInDays, annualInterestRate]);

    const ResultCell: React.FC<{data: any}> = ({ data }) => (
        <td className="px-4 py-3 text-right">
            <div className="font-bold text-lg text-green-700">{formatCurrency(data.finalProfit)}</div>
            <div className="text-sm font-semibold text-blue-700">{data.roi.toFixed(1)}% ROI</div>
            <div className="text-xs text-red-600">Juros: {formatCurrency(data.interest)}</div>
        </td>
    );

    return (
        <div className={isForPdf ? 'bg-white' : ''}>
            {!isForPdf && (
                <>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Matriz de Cenários de Investimento</h2>
                    <p className="text-slate-600 mb-6">Esta análise projeta o lucro do construtor com base na sua margem, nível de financiamento do custo direto e momento da venda.</p>
                </>
            )}

            {!isForPdf && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-sm">
                    <label htmlFor="interest-rate-input" className="block text-sm font-medium text-slate-700">
                        Simular Taxa de Juros Anual do Financiamento
                    </label>
                    <div className="relative mt-1">
                        <input
                            type="number"
                            id="interest-rate-input"
                            value={annualInterestRate}
                            onChange={(e) => setAnnualInterestRate(e.target.value)}
                            className="w-full h-10 p-2 pr-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="15"
                            min="0"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 pointer-events-none">%</span>
                    </div>
                </div>
            )}

            <div className="space-y-12">
                {matrixCalculations.map((finLevel, idx) => (
                    <div key={idx} className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                             <h3 className="text-lg font-bold text-slate-800">{finLevel.title}</h3>
                             <p className="text-sm text-slate-600">Valor Financiado: {formatCurrency(finLevel.financedAmount)} | Taxa de Juros Anual (Simulada): {annualInterestRate}%</p>
                        </div>
                        <table className="min-w-full">
                             <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Cenário de Lucratividade</th>
                                    {finLevel.saleTimings.map(time => (
                                         <th key={time.label} className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">{time.label}</th>
                                    ))}
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-200">
                                {finLevel.scenarios.map(profScenario => (
                                    <tr key={profScenario.label} className={!isForPdf ? "hover:bg-slate-50" : ""}>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800">{profScenario.label}</div>
                                            <div className="text-xs text-slate-500">Venda: {formatCurrency(profScenario.salePrice)}</div>
                                            <div className="text-xs text-slate-500">EBITDA: {formatCurrency(profScenario.ebitda)}</div>
                                        </td>
                                        {profScenario.cells.map((cell, cellIdx) => (
                                            <ResultCell key={cellIdx} data={cell} />
                                        ))}
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                ))}
            </div>
             <p className="mt-4 text-xs text-slate-500">
                <strong>Notas:</strong> EBITDA = Preço de Venda - Custo Direto - Custos Indiretos. O custo do financiamento é uma estimativa de <strong>juros compostos</strong> sobre o valor financiado durante o período até a venda. O ROI é calculado como (Lucro Líquido Final / Custo Direto Total).
            </p>
        </div>
    );
};

export default InvestmentMatrix;
