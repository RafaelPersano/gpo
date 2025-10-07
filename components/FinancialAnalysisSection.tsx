import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon.tsx';

interface Financials {
    directCost: number;
    finalPrice: number;
    profitValue: number;
    roi: number;
    ebitda: number;
    bdiBreakdown: {
      indirectCosts: Record<string, string>;
      taxes: Record<string, string>;
      netProfit: string;
    };
}

interface FinancialAnalysisSectionProps {
  financials: Financials;
  isForPdf?: boolean;
}

const FinancialAnalysisSection: React.FC<FinancialAnalysisSectionProps> = ({ financials, isForPdf = false }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const parse = (val: string) => parseFloat(val) || 0;

    // FIX: Provided an initial value of 0 to `reduce` calls. This ensures the accumulator `sum` is correctly typed as `number` instead of `unknown`, resolving downstream `toFixed` errors.
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalIndirect = Object.values(financials.bdiBreakdown.indirectCosts).reduce((sum, val) => sum + parse(String(val)), 0);
    // FIX: Added initial value 0 to `reduce` to fix typing issue where accumulator could be `unknown`.
    const totalTaxes = Object.values(financials.bdiBreakdown.taxes).reduce((sum, val) => sum + parse(String(val)), 0);

    const renderBdiRow = (label: string, value: string) => (
        <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">{label}:</span>
            <span className="font-semibold text-slate-800">{String(value)}%</span>
        </div>
    );

    return (
        <div className={isForPdf ? 'bg-white' : ''}>
            {!isForPdf && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Análise Financeira e BDI</h2>
                <p className="text-slate-600 mb-6">Detalhamento dos indicadores financeiros e da composição do preço de venda do projeto.</p>
              </>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BDI Breakdown */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">
                        Composição do BDI (Benefícios e Despesas Indiretas)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mb-2">Custos Indiretos</h4>
                            {renderBdiRow("Administração Central", financials.bdiBreakdown.indirectCosts.admin)}
                            {renderBdiRow("Seguros", financials.bdiBreakdown.indirectCosts.insurance)}
                            {renderBdiRow("Garantias", financials.bdiBreakdown.indirectCosts.guarantee)}
                            {renderBdiRow("Riscos e Imprevistos", financials.bdiBreakdown.indirectCosts.risk)}
                            <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 rounded-b-md">
                                <span className="text-slate-700">Subtotal Indiretos:</span>
                                <span className="text-slate-900">{totalIndirect.toFixed(2)}%</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mt-4 mb-2">Impostos</h4>
                             {Object.entries(financials.bdiBreakdown.taxes).map(([key, value]) => 
                                renderBdiRow(key.toUpperCase(), String(value))
                             )}
                            <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 rounded-b-md">
                                <span className="text-slate-700">Subtotal Impostos:</span>
                                <span className="text-slate-900">{totalTaxes.toFixed(2)}%</span>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mt-4 mb-2">Margem</h4>
                            {renderBdiRow("Lucro Líquido", financials.bdiBreakdown.netProfit)}
                        </div>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm text-center">
                        <h3 className="text-sm font-semibold text-blue-800 uppercase">Retorno sobre Investimento (ROI)</h3>
                        <p className="text-4xl font-extrabold text-blue-900 my-1">{financials.roi.toFixed(1)}%</p>
                        <p className="text-xs text-blue-700">(Lucro Líquido / Custo Direto)</p>
                    </div>
                     <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm text-center">
                        <h3 className="text-sm font-semibold text-green-800 uppercase">Lucro Operacional (EBITDA)</h3>
                        <p className="text-4xl font-extrabold text-green-900 my-1">{formatCurrency(financials.ebitda)}</p>
                        <p className="text-xs text-green-700">(Preço de Venda - Custo Direto)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalysisSection;