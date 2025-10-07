
import React from 'react';
import { PercentIcon } from './icons/PercentIcon.tsx';

interface TaxSectionProps {
  totalBudget: number;
}

const taxTiers = [
  { limit: 180000, rate: 0.045, deduction: 0 },
  { limit: 360000, rate: 0.09, deduction: 8100 },
  { limit: 720000, rate: 0.102, deduction: 12420 },
  { limit: 1800000, rate: 0.14, deduction: 39780 },
];

const TaxSection: React.FC<TaxSectionProps> = ({ totalBudget }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Find the correct tax tier
    const tier = taxTiers.find(t => totalBudget <= t.limit);

    let calculationResult;

    if (tier) {
        // Formula Simples Nacional: ((RBT12 * Alíquota) - Parcela a Deduzir) / RBT12 = Alíquota Efetiva
        const effectiveRate = ((totalBudget * tier.rate) - tier.deduction) / totalBudget;
        const taxAmount = totalBudget * effectiveRate;
        
        calculationResult = {
            tier,
            effectiveRate,
            taxAmount,
            message: null
        };
    } else {
         calculationResult = {
            tier: { limit: Infinity, rate: 0.14, deduction: 39780 }, // Assuming last tier logic applies beyond limit for estimation
            effectiveRate: 0,
            taxAmount: 0,
            message: "O valor da obra excede a faixa máxima da tabela do Simples Nacional fornecida (R$ 1.800.000,00). O cálculo pode não ser preciso e um regime tributário diferente pode ser aplicável."
         }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Estimativa de Impostos (Simples Nacional)</h2>
            <p className="text-slate-600 mb-6">Abaixo está uma simulação do imposto a ser pago sobre o valor total da obra, com base na tabela do Simples Nacional para construção civil (Anexo IV).</p>
            
            <div className="max-w-2xl mx-auto">
                {/* Calculation Result */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                        <PercentIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Cálculo para este Projeto
                    </h3>
                    <div className="space-y-3 text-slate-600">
                        <div className="flex justify-between">
                            <span>Valor Total da Obra (Base):</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(totalBudget)}</span>
                        </div>
                         {calculationResult.tier && (
                            <div className="flex justify-between items-center bg-blue-50 p-2 rounded-md">
                                <span>Faixa de Faturamento:</span>
                                <span className="font-semibold text-blue-800 text-sm">Até {calculationResult.tier.limit === Infinity ? 'Acima de R$1.8M' : formatCurrency(calculationResult.tier.limit)}</span>
                            </div>
                         )}
                        <div className="flex justify-between">
                            <span>Alíquota Nominal:</span>
                            <span className="font-semibold text-slate-800">{(calculationResult.tier.rate * 100).toFixed(2)}%</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Parcela a Deduzir:</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(calculationResult.tier.deduction)}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2"></div>
                         <div className="flex justify-between">
                            <span className="font-bold">Alíquota Efetiva:</span>
                            <span className="font-bold text-slate-800">{(calculationResult.effectiveRate * 100).toFixed(4)}%</span>
                        </div>
                         <div className="flex justify-between text-lg mt-2 p-3 bg-green-50 rounded-lg">
                            <span className="font-extrabold text-green-800">Valor Estimado do Imposto:</span>
                            <span className="font-extrabold text-green-900">{formatCurrency(calculationResult.taxAmount)}</span>
                        </div>
                    </div>
                     {calculationResult.message && <p className="mt-4 text-sm text-amber-700 bg-amber-100 p-3 rounded-md">{calculationResult.message}</p>}
                     <p className="mt-4 text-xs text-slate-500">
                        <strong>Aviso:</strong> Este é um cálculo simplificado para fins de estimativa. A apuração real do Simples Nacional depende do faturamento acumulado da empresa nos últimos 12 meses. Consulte seu contador para obter os valores exatos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TaxSection;
