

import React from 'react';
import type { ConstructionTask } from '../types.ts';

interface AbcCurveProps {
  tasks: ConstructionTask[];
  isForPdf?: boolean;
}

const AbcCurve: React.FC<AbcCurveProps> = ({ tasks, isForPdf = false }) => {
  const tasksWithTotalCost = tasks.map(t => ({
    ...t,
    totalCost: t.costMaterials + t.costLabor,
  })).filter(t => t.totalCost > 0);

  const grandTotal = tasksWithTotalCost.reduce((sum, t) => sum + t.totalCost, 0);

  if (grandTotal === 0) {
    return <p>Não há custos para analisar na Curva ABC.</p>;
  }

  const sortedTasks = tasksWithTotalCost.sort((a, b) => b.totalCost - a.totalCost);

  let cumulativeCost = 0;
  const classifiedTasks = sortedTasks.map(t => {
    cumulativeCost += t.totalCost;
    const cumulativePercent = (cumulativeCost / grandTotal) * 100;
    const weight = (t.totalCost / grandTotal) * 100;
    let abcClass: 'A' | 'B' | 'C' = 'C';
    if (cumulativePercent <= 80) {
      abcClass = 'A';
    } else if (cumulativePercent <= 95) {
      abcClass = 'B';
    }
    return { ...t, weight, cumulativePercent, abcClass };
  });

  const classSummary = classifiedTasks.reduce((acc, task) => {
    acc[task.abcClass].count += 1;
    acc[task.abcClass].cost += task.totalCost;
    return acc;
  }, {
    A: { count: 0, cost: 0 },
    B: { count: 0, cost: 0 },
    C: { count: 0, cost: 0 },
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const classColors = {
    A: 'bg-red-500',
    B: 'bg-yellow-500',
    C: 'bg-blue-500',
  };

  const classTextColors = {
    A: 'text-red-800 bg-red-100 border-red-200',
    B: 'text-yellow-800 bg-yellow-100 border-yellow-200',
    C: 'text-blue-800 bg-blue-100 border-blue-200',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Curva ABC de Custos</h2>
      <p className="text-slate-600 mb-6">Esta análise classifica as tarefas por ordem de impacto financeiro, ajudando a priorizar a gestão de custos.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-lg border ${classTextColors.A}`}>
          <h3 className="font-bold text-lg">Classe A (Vital)</h3>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(classSummary.A.cost)}</p>
          <p className="text-sm mt-1">{classSummary.A.count} tarefas representam <strong>{((classSummary.A.cost / grandTotal) * 100).toFixed(1)}%</strong> do custo total.</p>
        </div>
        <div className={`p-6 rounded-lg border ${classTextColors.B}`}>
          <h3 className="font-bold text-lg">Classe B (Importante)</h3>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(classSummary.B.cost)}</p>
          <p className="text-sm mt-1">{classSummary.B.count} tarefas representam <strong>{((classSummary.B.cost / grandTotal) * 100).toFixed(1)}%</strong> do custo total.</p>
        </div>
        <div className={`p-6 rounded-lg border ${classTextColors.C}`}>
          <h3 className="font-bold text-lg">Classe C (Trivial)</h3>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(classSummary.C.cost)}</p>
          <p className="text-sm mt-1">{classSummary.C.count} tarefas representam <strong>{((classSummary.C.cost / grandTotal) * 100).toFixed(1)}%</strong> do custo total.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Classe</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Item (Tarefa)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Custo</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Peso (%)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Acumulado (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {classifiedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-base text-slate-900 font-bold">
                  <span className={`px-3 py-1 text-xs text-white rounded-full ${classColors[task.abcClass]}`}>{task.abcClass}</span>
                </td>
                <td className="px-4 py-3 text-base text-slate-800">{task.taskName}</td>
                <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap">{formatCurrency(task.totalCost)}</td>
                <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap">{task.weight.toFixed(2)}%</td>
                <td className="px-4 py-3 text-base text-slate-600 text-right whitespace-nowrap">{task.cumulativePercent.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AbcCurve;