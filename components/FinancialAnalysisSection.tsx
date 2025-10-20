import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface Financials {
    directCost: number;
    finalPrice: number;
    grossMarginValue: number;
    indirectCostsValue: number;
    ebitda: number;
    taxesOnRevenueValue: number;
    netProfitValue: number;
    roi: number;
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
    const totalIndirect = Object.values(financials.bdiBreakdown.indirectCosts).reduce<number>((sum, val) => sum + parse(String(val)), 0);
    const totalTaxes = Object.values(financials.bdiBreakdown.taxes).reduce<number>((sum, val) => sum + parse(String(val)), 0);

    const PnlRow: React.FC<{label: string, value: number, className?: string, isSubtle?: boolean}> = ({ label, value, className = '', isSubtle = false }) => (
        <div className={`flex justify-between items-center py-2 ${isSubtle ? 'text-sm' : ''} ${className}`}>
            <span className={isSubtle ? 'text-slate-500' : 'text-slate-600'}>{label}:</span>
            <span className={`font-semibold ${isSubtle ? 'text-slate-700' : 'text-slate-800'}`}>{formatCurrency(value)}</span>
        </div>
    );

    const renderBdiRow = (label: string, value: string) => (
        <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
            <span className="text-slate-600">{label}:</span>
            <span className="font-semibold text-slate-800">{value}%</span>
        </div>
    );

    return (
        <div className={isForPdf ? 'bg-white' : ''}>
            {!isForPdf && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Análise Financeira Detalhada</h2>
                <p className="text-slate-600 mb-6">Detalhamento dos indicadores financeiros e da composição do preço de venda do projeto.</p>
              </>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">
                        Demonstrativo de Resultados do Projeto (Estimado)
                    </h3>
                    <div className="space-y-1">
                        <PnlRow label="(+) Preço de Venda (Receita)" value={financials.finalPrice} className="text-base font-bold text-green-700" />
                        <PnlRow label="(-) Custo Direto da Obra" value={financials.directCost} isSubtle />
                        <div className="!my-2 border-t border-slate-300"></div>
                        <PnlRow label="(=) Lucro Bruto" value={financials.grossMarginValue} className="text-base font-bold" />
                        <div className="!my-2 border-t border-dashed border-slate-300"></div>
                        <PnlRow label="(-) Despesas Indiretas (Adm.)" value={financials.indirectCostsValue} isSubtle />
                        <div className="!my-2 border-t border-slate-300"></div>
                        <PnlRow label="(=) EBITDA (Lucro Operacional)" value={financials.ebitda} className="text-base font-bold" />
                        <div className="!my-2 border-t border-dashed border-slate-300"></div>
                        <PnlRow label="(-) Impostos sobre Faturamento" value={financials.taxesOnRevenueValue} isSubtle />
                        <div className="!my-3 border-t-2 border-slate-400"></div>
                        <PnlRow label="(=) Lucro Líquido Estimado" value={financials.netProfitValue} className="text-lg font-extrabold text-blue-800 bg-blue-50 p-3 rounded-md" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm text-center">
                        <h3 className="text-sm font-semibold text-blue-800 uppercase">Retorno sobre Investimento (ROI)</h3>
                        <p className="text-4xl font-extrabold text-blue-900 my-1">{financials.roi.toFixed(1)}%</p>
                        <p className="text-xs text-blue-700">(Lucro Líquido / Custo Direto)</p>
                    </div>
                     <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm text-center">
                        <h3 className="text-sm font-semibold text-green-800 uppercase">Lucro Operacional (EBITDA)</h3>
                        <p className="text-4xl font-extrabold text-green-900 my-1">{formatCurrency(financials.ebitda)}</p>
                        <p className="text-xs text-green-700">(Lucro Bruto - Despesas Indiretas)</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-700 mb-4">
                    Composição do BDI (Benefícios e Despesas Indiretas)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mb-2">Custos Indiretos</h4>
                        {renderBdiRow("Administração Central", financials.bdiBreakdown.indirectCosts.admin)}
                        {renderBdiRow("Seguros", financials.bdiBreakdown.indirectCosts.insurance)}
                        {renderBdiRow("Garantias", financials.bdiBreakdown.indirectCosts.guarantee)}
                        {renderBdiRow("Riscos e Imprevistos", financials.bdiBreakdown.indirectCosts.risk)}
                        <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 rounded-b-md text-sm">
                            <span className="text-slate-700">Subtotal:</span>
                            <span className="text-slate-900">{totalIndirect.toFixed(2)}%</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mb-2">Impostos</h4>
                        {Object.entries(financials.bdiBreakdown.taxes).map(([key, value]) => 
                            renderBdiRow(key.toUpperCase(), String(value))
                        )}
                        <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 rounded-b-md text-sm">
                            <span className="text-slate-700">Subtotal:</span>
                            <span className="text-slate-900">{totalTaxes.toFixed(2)}%</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-500 text-sm uppercase tracking-wide mb-2">Margem</h4>
                        {renderBdiRow("Lucro Líquido", financials.bdiBreakdown.netProfit)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalysisSection;