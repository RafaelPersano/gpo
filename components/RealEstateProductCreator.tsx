
import React, { useState, useMemo } from 'react';
import { BuildingIcon } from './icons/BuildingIcon';
import { XIcon } from './icons/XIcon';

interface Typology {
    id: number;
    percent: string;
    area: string;
}

const RealEstateProductCreator: React.FC = () => {
    const [totalUnits, setTotalUnits] = useState('200');
    const [typologies, setTypologies] = useState<Typology[]>([
        { id: 1, percent: '50', area: '50' },
        { id: 2, percent: '25', area: '35' },
        { id: 3, percent: '25', area: '45' },
    ]);
    const [costPerSqm, setCostPerSqm] = useState('2331.52'); // CUB/SP R1-N as default
    const [salePricePerSqm, setSalePricePerSqm] = useState('8000');
    
    const handleAddTypology = () => {
        setTypologies([...typologies, { id: Date.now(), percent: '', area: '' }]);
    };
    
    const handleRemoveTypology = (id: number) => {
        setTypologies(typologies.filter(t => t.id !== id));
    };

    const handleTypologyChange = (id: number, field: 'percent' | 'area', value: string) => {
        setTypologies(typologies.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const calculationResults = useMemo(() => {
        const totalUnitsNum = parseInt(totalUnits, 10);
        const costPerSqmNum = parseFloat(costPerSqm);
        const salePricePerSqmNum = parseFloat(salePricePerSqm);

        const totalPercent = typologies.reduce((sum, t) => sum + (parseFloat(t.percent) || 0), 0);
        
        if (isNaN(totalUnitsNum) || totalUnitsNum <= 0 || isNaN(costPerSqmNum) || costPerSqmNum <= 0 || isNaN(salePricePerSqmNum) || salePricePerSqmNum <= 0) {
            return { typologyDetails: [], totals: {}, totalPercent, isValid: false };
        }

        let preliminaryUnits = typologies.map((t, index) => {
            const percent = parseFloat(t.percent) || 0;
            const area = parseFloat(t.area) || 0;
            const numUnits = totalUnitsNum * (percent / 100);
            return {
                ...t,
                index,
                percentNum: percent,
                areaNum: area,
                numUnits,
                numUnitsRounded: Math.round(numUnits),
            };
        });

        // Adjust for rounding errors
        let roundedUnitsSum = preliminaryUnits.reduce((sum, t) => sum + t.numUnitsRounded, 0);
        let diff = totalUnitsNum - roundedUnitsSum;
        
        // Sort by the remainder to add/subtract from the most "deserving" typologies
        preliminaryUnits.sort((a, b) => (b.numUnits - b.numUnitsRounded) - (a.numUnits - a.numUnitsRounded));

        for (let i = 0; i < Math.abs(diff); i++) {
            if (diff > 0) {
                preliminaryUnits[i].numUnitsRounded++;
            } else if (diff < 0) {
                preliminaryUnits[i].numUnitsRounded--;
            }
        }
        
        preliminaryUnits.sort((a,b) => a.index - b.index);

        const typologyDetails = preliminaryUnits.map(t => {
            const unitCost = t.areaNum * costPerSqmNum;
            const salePrice = t.areaNum * salePricePerSqmNum;
            const grossProfit = salePrice - unitCost;
            return {
                name: `Apto ${t.area}m²`,
                percent: t.percentNum,
                numUnits: t.numUnitsRounded,
                unitCost,
                salePrice,
                grossProfit,
            };
        });

        const totals = {
            totalArea: typologyDetails.reduce((sum, t) => sum + (t.numUnits * (parseFloat(typologies.find(ty => `Apto ${ty.area}m²` === t.name)?.area || '0') || 0)), 0),
            totalCost: typologyDetails.reduce((sum, t) => sum + (t.numUnits * t.unitCost), 0),
            totalVgv: typologyDetails.reduce((sum, t) => sum + (t.numUnits * t.salePrice), 0),
            totalGrossProfit: typologyDetails.reduce((sum, t) => sum + (t.numUnits * t.grossProfit), 0),
        };

        return { typologyDetails, totals, totalPercent, isValid: true };

    }, [totalUnits, typologies, costPerSqm, salePricePerSqm]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                    <BuildingIcon className="w-6 h-6 mr-3 text-blue-600" />
                    Estudo de Viabilidade Imobiliária
                </h3>
                <p className="text-slate-600">
                    Faça um estudo de viabilidade rápido para um empreendimento. Defina o mix de unidades e os preços para estimar custos, VGV e lucro.
                </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Total de Unidades</label>
                    <input type="number" value={totalUnits} onChange={e => setTotalUnits(e.target.value)} className="mt-1 w-full h-10 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Custo de Obra por m²</label>
                    <input type="number" value={costPerSqm} onChange={e => setCostPerSqm(e.target.value)} className="mt-1 w-full h-10 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Preço de Venda por m² (Alvo)</label>
                    <input type="number" value={salePricePerSqm} onChange={e => setSalePricePerSqm(e.target.value)} className="mt-1 w-full h-10 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700 mb-2">Mix de Tipologias</h4>
                <div className="space-y-3">
                {typologies.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500">% do Mix</label>
                            <input type="number" value={t.percent} onChange={e => handleTypologyChange(t.id, 'percent', e.target.value)} className="w-full h-9 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500">Área (m²)</label>
                            <input type="number" value={t.area} onChange={e => handleTypologyChange(t.id, 'area', e.target.value)} className="w-full h-9 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <button onClick={() => handleRemoveTypology(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full mt-4">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                </div>
                <button onClick={handleAddTypology} className="mt-4 px-3 py-1.5 text-sm font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">+ Adicionar Tipologia</button>
                 {calculationResults.totalPercent !== 100 && (
                    <p className="mt-2 text-sm text-red-600 font-semibold">A soma dos percentuais deve ser 100%. Soma atual: {calculationResults.totalPercent.toFixed(1)}%</p>
                )}
            </div>

            {/* Results */}
            {calculationResults.isValid && calculationResults.totalPercent === 100 && (
                <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Resultados da Simulação</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 bg-white">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">Tipologia</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-500">% do Mix</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-500">Nº de Unidades</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500">Custo por Unidade</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500">Preço de Venda (Alvo)</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500">Lucro Bruto por Unidade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {calculationResults.typologyDetails.map(item => (
                                <tr key={item.name}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{item.percent}%</td>
                                    <td className="px-4 py-3 text-center text-slate-600 font-bold">{item.numUnits}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitCost)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.salePrice)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(item.grossProfit)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200"><p className="text-sm text-slate-600">Área Privativa Total</p><p className="font-bold text-lg text-slate-800">{formatNumber(calculationResults.totals.totalArea)} m²</p></div>
                        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200"><p className="text-sm text-slate-600">Custo Total da Obra</p><p className="font-bold text-lg text-slate-800">{formatCurrency(calculationResults.totals.totalCost)}</p></div>
                        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200"><p className="text-sm text-slate-600">Valor Geral de Vendas (VGV)</p><p className="font-bold text-lg text-slate-800">{formatCurrency(calculationResults.totals.totalVgv)}</p></div>
                        <div className="bg-green-100 p-4 rounded-lg border border-green-200"><p className="text-sm text-green-700">Lucro Bruto Total</p><p className="font-bold text-lg text-green-800">{formatCurrency(calculationResults.totals.totalGrossProfit)}</p></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealEstateProductCreator;
