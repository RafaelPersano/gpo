import React, { useState, useMemo } from 'react';
import { cubData, brazilianStates, cubStandardTypes, CubStandardCode, availableStates } from '../data/cubData.ts';
import { RulerIcon } from './icons/RulerIcon.tsx';
import { SpreadsheetIcon } from './icons/SpreadsheetIcon.tsx';

const UnitCostCalculator: React.FC = () => {
  const [selectedState, setSelectedState] = useState<keyof typeof cubData>('SP');
  const [standard, setStandard] = useState<CubStandardCode>('R1-N');
  const [area, setArea] = useState<string>('150');

  const calculation = useMemo(() => {
    const areaValue = parseFloat(area);
    if (!selectedState || !standard || !area || isNaN(areaValue) || areaValue <= 0) {
      return {
        unitCost: 0,
        totalCost: 0,
        dataAvailable: false,
      };
    }

    const stateData = cubData[selectedState];
    if (!stateData) {
      return { unitCost: 0, totalCost: 0, dataAvailable: false };
    }

    const unitCost = stateData[standard] || 0;
    const totalCost = unitCost * areaValue;

    return { unitCost, totalCost, dataAvailable: true };
  }, [selectedState, standard, area]);

  const exportToCsv = () => {
    if (!calculation.dataAvailable || calculation.totalCost === 0) return;

    const headers = ['Estado', 'Padrão Construtivo', 'Código', 'CUB/m² (R$)', 'Área (m²)', 'Custo Total Estimado (R$)'];
    
    const selectedStandardInfo = cubStandardTypes.find(s => s.code === standard);
    const stateName = brazilianStates[selectedState as keyof typeof brazilianStates];

    const rowData = [
      `"${stateName}"`,
      `"${selectedStandardInfo?.description || 'N/A'}"`,
      `"${standard}"`,
      `"${calculation.unitCost.toFixed(2).replace('.', ',')}"`,
      `"${area.replace('.', ',')}"`,
      `"${calculation.totalCost.toFixed(2).replace('.', ',')}"`
    ];

    const csvContent = [headers.join(';'), rowData.join(';')].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estimativa_custo_${selectedState}_${area}m2.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const groupedStandards = cubStandardTypes.reduce((acc, s) => {
    if (!acc[s.category]) {
      acc[s.category] = [];
    }
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof cubStandardTypes>);

  return (
    <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
        <RulerIcon className="w-6 h-6 mr-3 text-blue-600" />
        Calculadora de Custo de Obra por m² (CUB)
      </h3>
      <p className="text-slate-600 mb-8">
        Obtenha uma estimativa rápida do custo da sua construção com base no Custo Unitário Básico (CUB/m²) oficial do seu estado. Os valores são referenciais (dados de Março/2023, exceto onde indicado). <strong className="text-slate-700">O padrão 'Médio' é uma média calculada entre os padrões 'Baixo' e 'Alto'.</strong>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="state-select" className="block text-sm font-medium text-slate-700">1. Estado</label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value as keyof typeof cubData)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {Object.entries(brazilianStates).map(([uf, name]) => (
                  <option key={uf} value={uf} disabled={!availableStates.includes(uf)}>
                    {name}{!availableStates.includes(uf) ? ' (dados indisponíveis)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="area-input" className="block text-sm font-medium text-slate-700">2. Área da Construção</label>
              <div className="relative mt-1">
                  <input
                      type="number"
                      id="area-input"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full h-10 p-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                      placeholder="150"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 pointer-events-none">m²</span>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="standard-select" className="block text-sm font-medium text-slate-700">3. Padrão da Construção</label>
            <select
              id="standard-select"
              value={standard}
              onChange={(e) => setStandard(e.target.value as CubStandardCode)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {Object.entries(groupedStandards).map(([category, standards]) => (
                <optgroup label={category} key={category}>
                  {standards.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.description}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 uppercase">Custo Total Estimado</p>
                <p className="text-4xl font-extrabold text-blue-600 my-1">
                    {formatCurrency(calculation.totalCost)}
                </p>
                <p className="text-sm text-slate-500">
                    {formatCurrency(calculation.unitCost)} / m²
                </p>
            </div>
            <button
                onClick={exportToCsv}
                disabled={!calculation.dataAvailable || calculation.totalCost === 0}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                <SpreadsheetIcon className="w-5 h-5 mr-2" />
                Exportar Estimativa
            </button>
        </div>
      </div>
    </div>
  );
};

export default UnitCostCalculator;