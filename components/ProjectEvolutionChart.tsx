

import React from 'react';
import type { ConstructionTask } from '../types.ts';

interface ProjectEvolutionChartProps {
  tasks: ConstructionTask[];
  projectStartDate: string;
  projectEndDate: string;
  isForPdf?: boolean;
}

const ProjectEvolutionChart: React.FC<ProjectEvolutionChartProps> = ({ tasks, projectStartDate, projectEndDate, isForPdf = false }) => {
  const parseDate = (dateStr: string) => new Date(dateStr + 'T00:00:00');

  const getDaysDiff = (date1: Date, date2: Date) => {
    return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  };

  const costByDate: { [date: string]: number } = {};
  tasks.forEach(task => {
    const cost = task.costMaterials + task.costLabor;
    costByDate[task.endDate] = (costByDate[task.endDate] || 0) + cost;
  });

  const sortedDates = Object.keys(costByDate).sort();
  let cumulativeCost = 0;
  const dataPoints = sortedDates.map(date => {
    cumulativeCost += costByDate[date];
    return {
      date: parseDate(date),
      cumulativeCost: cumulativeCost,
    };
  });
  
  if (dataPoints.length === 0) {
    return <p>Não há dados de custo para gerar o gráfico de evolução.</p>;
  }

  const startDate = parseDate(projectStartDate);
  const endDate = parseDate(projectEndDate);
  const totalDuration = getDaysDiff(startDate, endDate);
  const maxCost = dataPoints[dataPoints.length - 1].cumulativeCost;

  const points = dataPoints.map(p => {
    const x = (getDaysDiff(startDate, p.date) / totalDuration) * 100;
    const y = 100 - (p.cumulativeCost / maxCost) * 100;
    return `${x},${y}`;
  });

  const pathData = `M0,100 ${points.join(' ')}`;

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };
  
  const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
  }

  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(p => ({
      value: formatCurrency(maxCost * p),
      pos: 100 - (p * 100)
  }));
  
  const xAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(p => ({
      value: formatDate(new Date(startDate.getTime() + totalDuration * p * (1000 * 3600 * 24))),
      pos: p * 100
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Evolução da Obra (Curva S)</h2>
      <p className="text-slate-600 mb-6">Este gráfico mostra o desembolso financeiro acumulado ao longo do tempo, ajudando a planejar o fluxo de caixa.</p>

      <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg border border-slate-200">
        <div className="flex">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between h-64 text-right pr-4">
            {yAxisLabels.map(label => (
                <span key={label.value} className="text-xs text-slate-500" style={{position: 'relative', top: label.pos === 100 ? '-0.5em' : label.pos === 0 ? '0.5em': 0}}>{label.value}</span>
            ))}
          </div>
          
          <div className="flex-1">
            {/* Chart Area */}
            <div className="relative h-64">
              {/* Grid Lines */}
              {yAxisLabels.map(label => (
                  <div key={label.pos} className="absolute w-full border-t border-dashed border-slate-200" style={{top: `${label.pos}%`}}></div>
              ))}
              <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" className="absolute top-0 left-0">
                <path d={pathData} stroke="#0ea5e9" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            {/* X-Axis */}
            <div className="flex justify-between mt-2 pl-2">
                {xAxisLabels.map(label => (
                    <span key={label.value} className="text-xs text-slate-500" style={{position: 'relative', left: label.pos === 100 ? '-1em' : label.pos === 0 ? '1em' : 0}}>{label.value}</span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEvolutionChart;