

import React from 'react';
import type { Budget, ConstructionTask } from '../types.ts';

interface BudgetSectionProps {
  budget: Budget;
  tasks: ConstructionTask[];
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ budget, tasks }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        }).format(value);
    };

    const totalCalculated = budget.materials + budget.labor + (budget.managerFee || 0);
    const materialPercent = (budget.materials / budget.total) * 100;
    const laborPercent = (budget.labor / budget.total) * 100;
    const managerFeePercent = budget.managerFee ? (budget.managerFee / budget.total) * 100 : 0;
    
    const costsByPhase = tasks.reduce((acc, task) => {
      if (!acc[task.phase]) {
        acc[task.phase] = { materials: 0, labor: 0 };
      }
      acc[task.phase].materials += task.costMaterials;
      acc[task.phase].labor += task.costLabor;
      return acc;
    }, {} as Record<string, { materials: number; labor: number }>);
    
    const phaseCostsArray = Object.keys(costsByPhase).map((phase) => ({
        phase,
        materials: costsByPhase[phase].materials,
        labor: costsByPhase[phase].labor,
    }));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Resumo do Orçamento</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Budget Card */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-blue-800 uppercase">Verba Total</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(budget.total)}</p>
                </div>

                 {/* Manager Fee Card */}
                 <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase">Taxa do Gestor</h3>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{formatCurrency(budget.managerFee || 0)}</p>
                    {budget.managerFee > 0 && (
                        <>
                            <div className="w-full bg-purple-200 rounded-full h-2.5 mt-3">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${managerFeePercent}%` }}></div>
                            </div>
                            <p className="text-right text-sm text-purple-700 mt-1">{managerFeePercent.toFixed(1)}% do total</p>
                        </>
                    )}
                </div>
                
                {/* Materials Budget Card */}
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-green-800 uppercase">Custo de Materiais</h3>
                    <p className="text-3xl font-bold text-green-900 mt-1">{formatCurrency(budget.materials)}</p>
                    <div className="w-full bg-green-200 rounded-full h-2.5 mt-3">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${materialPercent}%` }}></div>
                    </div>
                    <p className="text-right text-sm text-green-700 mt-1">{materialPercent.toFixed(1)}% do total</p>
                </div>

                {/* Labor Budget Card */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-yellow-800 uppercase">Custo de Mão de Obra</h3>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">{formatCurrency(budget.labor)}</p>
                    <div className="w-full bg-yellow-200 rounded-full h-2.5 mt-3">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${laborPercent}%` }}></div>
                    </div>
                    <p className="text-right text-sm text-yellow-700 mt-1">{laborPercent.toFixed(1)}% do total</p>
                </div>
            </div>
            
            {totalCalculated.toFixed(2) !== budget.total.toFixed(2) && (
                <div className="mt-6 p-4 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-sm">
                    <strong>Atenção:</strong> A soma dos custos (materiais: <strong>{formatCurrency(budget.materials)}</strong>, mão de obra: <strong>{formatCurrency(budget.labor)}</strong>, taxa do gestor: <strong>{formatCurrency(budget.managerFee || 0)}</strong>) é <strong>{formatCurrency(totalCalculated)}</strong>, que difere ligeiramente da verba total informada. Isso pode ocorrer devido a arredondamentos da IA.
                </div>
            )}

            <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Custos Detalhados por Fase</h2>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Fase do Projeto</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Custo de Materiais</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Custo de Mão de Obra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {phaseCostsArray.map(({ phase, materials, labor }) => (
                                <tr key={phase} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-base font-medium text-slate-900">{phase}</td>
                                    <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap">{formatCurrency(materials)}</td>
                                    <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap">{formatCurrency(labor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BudgetSection;