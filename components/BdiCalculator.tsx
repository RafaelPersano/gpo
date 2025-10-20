import React, { useMemo } from 'react';
import { CalculatorIcon } from './icons/CalculatorIcon';

interface BdiCalculatorProps {
  directCost: number;
  indirectCosts: Record<string, string>;
  setIndirectCosts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  taxes: Record<string, string>;
  setTaxes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  profit: number;
  setProfit: (newProfit: number) => void;
}

const BdiCalculator: React.FC<BdiCalculatorProps> = ({ 
    directCost, 
    indirectCosts, setIndirectCosts, 
    taxes, setTaxes, 
    profit, setProfit 
}) => {

  const handleIndirectCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndirectCosts(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxes(prev => ({ ...prev, [name]: value }));
  };

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
        setProfit(value);
    }
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const calculation = useMemo(() => {
    const parse = (val: string) => parseFloat(val) / 100 || 0;

    const totalIndirect = Object.values(indirectCosts).reduce<number>((sum, val) => sum + parse(String(val)), 0);
    const totalTaxes = Object.values(taxes).reduce<number>((sum, val) => sum + parse(String(val)), 0);
    const profitMargin = profit / 100 || 0;

    const numerator = 1 + totalIndirect;
    const denominator = 1 - (totalTaxes + profitMargin);
    
    if (denominator <= 0) {
      return { bdiRate: Infinity, bdiValue: Infinity, finalPrice: Infinity };
    }

    const bdiRate = ((numerator / denominator) - 1);
    const bdiValue = directCost * bdiRate;
    const finalPrice = directCost + bdiValue;
    
    return { bdiRate: bdiRate * 100, bdiValue, finalPrice };

  }, [indirectCosts, taxes, profit, directCost]);
  
  const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="relative mt-1">
            <input
                type="number"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-8"
                placeholder="0"
                step="0.1"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
        </div>
    </div>
  );


  return (
    <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Calculadora de BDI</h2>
        <p className="text-slate-600 mb-6">Ajuste os componentes do BDI (Benefícios e Despesas Indiretas) para recalcular o preço final de venda da sua obra em tempo real.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                <CalculatorIcon className="w-5 h-5 mr-2 text-blue-600" />
                Componentes do BDI (%)
            </h3>
            
            <div className="space-y-6">
                {/* Indirect Costs */}
                <div>
                    <h4 className="font-semibold text-slate-600 border-b border-slate-200 pb-2 mb-3">Custos Indiretos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputField label="Adm. Central" name="admin" value={indirectCosts.admin} onChange={handleIndirectCostChange} />
                        <InputField label="Seguros" name="insurance" value={indirectCosts.insurance} onChange={handleIndirectCostChange} />
                        <InputField label="Garantias" name="guarantee" value={indirectCosts.guarantee} onChange={handleIndirectCostChange} />
                        <InputField label="Riscos/Imprev." name="risk" value={indirectCosts.risk} onChange={handleIndirectCostChange} />
                    </div>
                </div>

                {/* Taxes */}
                <div>
                    <h4 className="font-semibold text-slate-600 border-b border-slate-200 pb-2 mb-3">Impostos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InputField label="IRPJ" name="irpj" value={taxes.irpj} onChange={handleTaxChange} />
                        <InputField label="CSLL" name="csll" value={taxes.csll} onChange={handleTaxChange} />
                        <InputField label="PIS/Pasep" name="pis" value={taxes.pis} onChange={handleTaxChange} />
                        <InputField label="COFINS" name="cofins" value={taxes.cofins} onChange={handleTaxChange} />
                        <InputField label="INSS" name="inss" value={taxes.inss} onChange={handleTaxChange} />
                        <InputField label="ISS" name="iss" value={taxes.iss} onChange={handleTaxChange} />
                    </div>
                </div>

                {/* Profit */}
                 <div>
                    <h4 className="font-semibold text-slate-600 border-b border-slate-200 pb-2 mb-3">Lucro</h4>
                    <div className="max-w-xs">
                        <InputField label="Lucro Previsto" name="profit" value={String(profit)} onChange={handleProfitChange} />
                    </div>
                </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Resultados</h3>
            <div className="space-y-4">
                <div className="p-3 bg-white rounded-md border">
                    <p className="text-sm text-slate-500">Custo Direto da Obra</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(directCost)}</p>
                </div>
                <div className="p-3 bg-white rounded-md border">
                    <p className="text-sm text-slate-500">Taxa BDI Calculada</p>
                    <p className="text-xl font-bold text-blue-700">
                        {isFinite(calculation.bdiRate) ? `${calculation.bdiRate.toFixed(2)}%` : 'Inválido'}
                    </p>
                </div>
                 <div className="p-3 bg-white rounded-md border">
                    <p className="text-sm text-slate-500">Valor do BDI</p>
                    <p className="text-xl font-bold text-blue-700">
                        {isFinite(calculation.bdiValue) ? formatCurrency(calculation.bdiValue) : 'Inválido'}
                    </p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg border border-green-200 text-center">
                    <p className="text-sm font-semibold text-green-800 uppercase">Preço Final de Venda</p>
                    <p className="text-3xl font-extrabold text-green-900 mt-1">
                        {isFinite(calculation.finalPrice) ? formatCurrency(calculation.finalPrice) : 'Inválido'}
                    </p>
                </div>
                {calculation.bdiRate === Infinity && 
                    <p className="text-xs text-red-600 text-center">A soma de impostos e lucro não pode ser 100% ou mais.</p>
                }
            </div>
          </div>
        </div>
    </div>
  );
};

export default BdiCalculator;