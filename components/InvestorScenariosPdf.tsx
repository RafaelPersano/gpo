import React, { useMemo } from 'react';
import type { ConstructionPlan } from '../types.ts';

interface Financials {
    directCost: number;
    projectDetails: {
      numberOfUnits: number;
    };
    bdiBreakdown: {
        indirectCosts: Record<string, string>;
        taxes: Record<string, string>;
    };
}

interface InvestorScenariosPdfProps {
    financials: Financials;
    projectPlan: ConstructionPlan;
}

const InvestorScenariosPdf: React.FC<InvestorScenariosPdfProps> = ({ financials, projectPlan }) => {
    const bankInterestRate = 0.15; // 15% a.a.

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const projectDurationMonths = useMemo(() => {
        const start = new Date(projectPlan.projectStartDate + 'T00:00:00');
        const end = new Date(projectPlan.projectEndDate + 'T00:00:00');
        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += end.getMonth();
        return months <= 0 ? 1 : months + 1;
    }, [projectPlan.projectStartDate, projectPlan.projectEndDate]);

    const profitScenarios = [
        { name: 'Cenário Pessimista', margin: 15 },
        { name: 'Cenário Realista', margin: 22 },
        { name: 'Cenário Otimista', margin: 30 },
    ];

    const salesTimings = [
        { name: 'Venda na Planta', interestDurationMonths: projectDurationMonths / 2 },
        { name: 'Venda na Entrega', interestDurationMonths: projectDurationMonths },
        { name: 'Venda 6 Meses Pós-Entrega', interestDurationMonths: projectDurationMonths + 6 },
    ];
    
    const financingLevels = [0, 50, 100];

    const parse = (val: string) => parseFloat(val) / 100 || 0;
    // FIX: Provided an initial value of 0 to `reduce` to ensure the accumulator `sum` is correctly typed as `number` instead of `unknown`.
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalIndirect = Object.values(financials.bdiBreakdown.indirectCosts).reduce((sum, val) => sum + parse(String(val)), 0);
    // FIX: Provided an initial value of 0 to `reduce` to ensure the accumulator `sum` is correctly typed as `number` instead of `unknown`.
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalTaxesBDI = Object.values(financials.bdiBreakdown.taxes).reduce((sum, val) => sum + parse(String(val)), 0);

    const renderScenarioMatrix = (financingPercent: number) => {
        const financedAmount = financials.directCost * (financingPercent / 100);

        return (
            <div key={financingPercent} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                    Análise com {financingPercent}% de Financiamento do Custo Direto
                </h3>
                 <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px 0' }}>
                    <strong>Valor Financiado:</strong> {formatCurrency(financedAmount)} | <strong>Taxa de Juros Anual (Base):</strong> {bankInterestRate * 100}%
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Cenário de Lucratividade</th>
                            {salesTimings.map(timing => (
                                <th key={timing.name} style={{ padding: '8px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>{timing.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {profitScenarios.map(scenario => {
                            const profitMargin = scenario.margin / 100;
                            const denominator = 1 - (totalTaxesBDI + profitMargin);
                            if (denominator <= 0) return null;

                            const bdiRate = (((1 + totalIndirect) / denominator) - 1);
                            const finalPrice = financials.directCost * (1 + bdiRate);
                            const profitBeforeInterest = finalPrice * profitMargin;
                            const ebitda = finalPrice - financials.directCost;
                            const numberOfUnits = financials.projectDetails.numberOfUnits > 0 ? financials.projectDetails.numberOfUnits : 1;
                            const pricePerUnit = finalPrice / numberOfUnits;

                            return (
                                <tr key={scenario.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px', fontSize: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{scenario.name} ({scenario.margin}%)</div>
                                    </td>
                                    {salesTimings.map(timing => {
                                        const durationYears = timing.interestDurationMonths / 12;
                                        const interestCost = financedAmount * bankInterestRate * durationYears;
                                        const finalNetProfit = profitBeforeInterest - interestCost;
                                        return (
                                            <td key={timing.name} style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>
                                                <div style={{ fontWeight: 'bold', color: finalNetProfit >= 0 ? '#15803d' : '#b91c1c' }}>{formatCurrency(finalNetProfit)}</div>
                                                <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>EBITDA: {formatCurrency(ebitda)}</div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                  Venda: {formatCurrency(finalPrice)}
                                                  {numberOfUnits > 1 && ` (${formatCurrency(pricePerUnit)}/unid)`}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>Juros: {formatCurrency(interestCost)}</div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
                Matriz de Cenários para Investimento
            </h2>
            <p style={{ fontSize: '12px', textAlign: 'center', color: '#475569', marginBottom: '24px' }}>
                Simulações de lucro líquido final com base em diferentes margens de lucro, momentos de venda e níveis de financiamento.
                <br />
                <strong>Custo Direto Base da Obra:</strong> {formatCurrency(financials.directCost)}.
            </p>
            {financingLevels.map(level => renderScenarioMatrix(level))}
        </div>
    );
};

export default InvestorScenariosPdf;