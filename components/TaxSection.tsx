
import React, { useMemo, useState } from 'react';
import type { ConstructionPlan } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface Financials {
  finalPrice: number;
  directCost: number;
  indirectCostsValue: number;
  netProfitValue: number;
}

interface TaxSectionProps {
  financials: Financials;
  projectPlan: ConstructionPlan;
  isForPdf?: boolean;
}

const TaxSection: React.FC<TaxSectionProps> = ({ financials, projectPlan, isForPdf = false }) => {
    const [desoneracao, setDesoneracao] = useState<'inss' | 'cprb'>('inss');
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const analysisResults = useMemo(() => {
        const receitaBruta = financials.finalPrice;
        const custoMaoDeObra = projectPlan.budget.labor;

        // --- Simples Nacional ---
        const simplesTiers = [
            { limit: 180000, rate: 0.045, deduction: 0 }, { limit: 360000, rate: 0.09, deduction: 8100 },
            { limit: 720000, rate: 0.102, deduction: 12420 }, { limit: 1800000, rate: 0.14, deduction: 39780 },
            { limit: 3600000, rate: 0.22, deduction: 183780 }, { limit: 4800000, rate: 0.33, deduction: 828000 }
        ];
        const receitaAnualEstimada = receitaBruta > 4800000 ? receitaBruta : Math.min(receitaBruta * 2, 4800000); // Simple annualization for demo
        const tier = simplesTiers.find(t => receitaAnualEstimada <= t.limit) || simplesTiers[simplesTiers.length - 1];
        const aliquotaEfetiva = receitaAnualEstimada > 0
            ? ((receitaAnualEstimada * tier.rate) - tier.deduction) / receitaAnualEstimada
            : 0;
        const impostoSimples = receitaBruta * aliquotaEfetiva;
        const inssFolha = custoMaoDeObra * 0.20; // Anexo IV paga INSS patronal por fora
        const totalSimples = impostoSimples + inssFolha;

        // --- Lucro Presumido ---
        const irpjPresumido = (receitaBruta * 0.08) * 0.15;
        const csllPresumido = (receitaBruta * 0.12) * 0.09;
        const pisCofinsPresumido = receitaBruta * 0.0365;
        const issPresumido = receitaBruta * 0.05; // Assuming 5%
        const cprb = receitaBruta * 0.045;
        const inssPresumido = desoneracao === 'inss' ? inssFolha : cprb;
        const totalPresumido = irpjPresumido + csllPresumido + pisCofinsPresumido + issPresumido + inssPresumido;
        
        // --- Lucro Real ---
        const lucroReal = financials.finalPrice - financials.directCost - financials.indirectCostsValue;
        const irpjReal = lucroReal > 0 ? lucroReal * 0.15 : 0; // Simplified, ignoring additional
        const csllReal = lucroReal > 0 ? lucroReal * 0.09 : 0;
        const pisCofinsReal = receitaBruta * 0.0925; // Simplified, ignoring credits
        const issReal = receitaBruta * 0.05;
        const inssReal = desoneracao === 'inss' ? inssFolha : cprb;
        const totalReal = irpjReal + csllReal + pisCofinsReal + issReal + inssReal;
        
        // --- RET (Regime Especial de Tributação) ---
        const retFederal = receitaBruta * 0.04;
        const issRet = receitaBruta * 0.05; // ISS is municipal and not included in RET
        const inssRet = desoneracao === 'inss' ? inssFolha : cprb; // INSS is also separate
        const totalRET = retFederal + issRet + inssRet;
        
        const results = [
            { name: 'Simples Nacional', total: totalSimples, profit: receitaBruta - financials.directCost - financials.indirectCostsValue - totalSimples },
            { name: 'Lucro Presumido', total: totalPresumido, profit: receitaBruta - financials.directCost - financials.indirectCostsValue - totalPresumido },
            { name: 'Lucro Real', total: totalReal, profit: receitaBruta - financials.directCost - financials.indirectCostsValue - totalReal },
            { name: 'RET (Incorporação)', total: totalRET, profit: receitaBruta - financials.directCost - financials.indirectCostsValue - totalRET },
        ];

        const bestOption = results.reduce((best, current) => (current.profit > best.profit ? current : best), results[0]);

        return {
            simples: { total: totalSimples, details: { DAS: impostoSimples, 'INSS Patronal': inssFolha }, profit: results[0].profit },
            presumido: { total: totalPresumido, details: { IRPJ: irpjPresumido, CSLL: csllPresumido, 'PIS/COFINS': pisCofinsPresumido, ISS: issPresumido, 'INSS/CPRB': inssPresumido }, profit: results[1].profit },
            real: { total: totalReal, details: { IRPJ: irpjReal, CSLL: csllReal, 'PIS/COFINS': pisCofinsReal, ISS: issReal, 'INSS/CPRB': inssReal }, profit: results[2].profit },
            ret: { total: totalRET, details: { 'RET (Unificado)': retFederal, ISS: issRet, 'INSS/CPRB': inssRet }, profit: results[3].profit },
            bestOption,
        };
    }, [financials, projectPlan, desoneracao]);

    const RegimeCard: React.FC<{ title: string; data: { total: number; details: Record<string, number>, profit: number }; isActive?: boolean }> = ({ title, data, isActive = false }) => (
        <div className={`bg-white p-6 rounded-lg border-2 shadow-sm transition-all h-full flex flex-col ${isActive ? 'border-green-500 scale-105' : 'border-slate-200'}`}>
            <h4 className="font-bold text-lg text-slate-800">{title}</h4>
            <div className="mt-4 space-y-2 text-sm flex-grow">
                {Object.entries(data.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span className="text-slate-600">{key}:</span>
                        <span className="font-medium text-slate-700">{formatCurrency(Number(value))}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Total de Impostos:</span>
                    <span className="text-blue-600">{formatCurrency(data.total)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 text-green-700 bg-green-50 p-2 rounded-md">
                    <span>Lucro Líquido:</span>
                    <span>{formatCurrency(data.profit)}</span>
                </div>
            </div>
        </div>
    );

    return (
    <div className={isForPdf ? 'bg-white' : ''}>
        {!isForPdf && (
            <>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Calculadora Comparativa de Regimes Tributários</h2>
                <p className="text-slate-600 mb-8">Simule a carga tributária do seu projeto nos principais regimes para a construção civil e encontre a opção mais lucrativa.</p>
            </>
        )}
        
        {!isForPdf && (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-700">Opção de Desoneração da Folha (Lucro Presumido/Real/RET)</h4>
                <div className="mt-2 flex gap-6">
                    <div className="flex items-center">
                        <input id="inss" name="desoneracao" type="radio" value="inss" checked={desoneracao === 'inss'} onChange={() => setDesoneracao('inss')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="inss" className="ml-3 block text-sm font-medium text-slate-700">INSS (20% sobre a folha)</label>
                    </div>
                    <div className="flex items-center">
                        <input id="cprb" name="desoneracao" type="radio" value="cprb" checked={desoneracao === 'cprb'} onChange={() => setDesoneracao('cprb')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="cprb" className="ml-3 block text-sm font-medium text-slate-700">CPRB (4.5% sobre receita bruta)</label>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RegimeCard title="RET (Incorporação)" data={analysisResults.ret} isActive={analysisResults.bestOption.name === 'RET (Incorporação)'} />
            <RegimeCard title="Lucro Presumido" data={analysisResults.presumido} isActive={analysisResults.bestOption.name === 'Lucro Presumido'} />
            <RegimeCard title="Simples Nacional" data={analysisResults.simples} isActive={analysisResults.bestOption.name === 'Simples Nacional'} />
            <RegimeCard title="Lucro Real" data={analysisResults.real} isActive={analysisResults.bestOption.name === 'Lucro Real'} />
        </div>

        <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <TrendingUpIcon className="w-12 h-12 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-green-900">Regime Tributário Mais Vantajoso</h3>
                    <p className="text-green-800">
                        Com base na simulação, o regime de <strong>{analysisResults.bestOption.name}</strong> oferece o maior lucro líquido de <strong>{formatCurrency(analysisResults.bestOption.profit)}</strong>.
                    </p>
                </div>
            </div>
        </div>
        
        {!isForPdf && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-md">
                <h4 className="font-bold flex items-center gap-2"><ShieldIcon className="w-5 h-5"/>O que é o RET?</h4>
                <p className="mt-1">O <strong>Regime Especial de Tributação (RET)</strong> é um benefício fiscal para incorporadoras que unifica impostos federais em uma alíquota de 4%. Requer a criação de uma SPE e Patrimônio de Afetação. Saiba mais na aba <strong>Base de Conhecimento</strong>.</p>
            </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
            <strong>Aviso Legal:</strong> Esta é uma simulação simplificada e não substitui a consultoria de um contador. Os valores podem variar conforme a legislação municipal, estadual e federal, além de créditos e deduções específicas não consideradas.
        </p>
    </div>
    );
};

export default TaxSection;
