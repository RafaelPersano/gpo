import React from 'react';
import { SliderIcon } from './icons/SliderIcon.tsx';

interface Financials {
    directCost: number;
    finalPrice: number;
    taxesOnRevenueValue: number;
    netProfitValue: number;
    bdiRate: number;
    salePriceString: string;
    costString: string;
}

interface PricingSectionProps {
  financials: Financials;
  netProfitMargin: number;
  onMarginChange: (newMargin: number) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ financials, netProfitMargin, onMarginChange }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Precificação do Projeto</h2>
            <p className="text-slate-600 mb-6">Ajuste a margem de lucro líquido para definir o preço de venda final do projeto. Todos os valores e a proposta serão atualizados automaticamente.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                        <SliderIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Controle de Lucratividade
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="profit-margin-slider" className="flex justify-between text-sm font-medium text-slate-700">
                                <span>Margem de Lucro Líquida</span>
                                <span className="font-bold text-blue-600">{netProfitMargin.toFixed(1)}%</span>
                            </label>
                            <input
                                id="profit-margin-slider"
                                type="range"
                                min="5"
                                max="40"
                                step="0.5"
                                value={netProfitMargin}
                                onChange={(e) => onMarginChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                        </div>
                         <div>
                            <label htmlFor="profit-margin-input" className="sr-only">Valor da margem de lucro</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="profit-margin-input"
                                    min="5"
                                    max="40"
                                    step="0.5"
                                    value={netProfitMargin}
                                    onChange={(e) => onMarginChange(parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-8"
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Resultado Final</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-white rounded-md border">
                            <p className="text-sm text-slate-500">Custo Direto da Obra</p>
                            <p className="text-xl font-bold text-slate-800">{financials.costString}</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg border border-green-200 text-center">
                            <p className="text-sm font-semibold text-green-800 uppercase">Preço Final de Venda</p>
                            <p className="text-3xl font-extrabold text-green-900 mt-1">{financials.salePriceString}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingSection;