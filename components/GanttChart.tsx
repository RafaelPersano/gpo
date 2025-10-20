

import React from 'react';
import type { ConstructionTask } from '../types.ts';

interface GanttChartProps {
  tasks: ConstructionTask[];
  isForPdf?: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, isForPdf = false }) => {
  if (!tasks || tasks.length === 0) {
    return <p>Nenhuma tarefa para exibir no gráfico.</p>;
  }

  const parseDate = (dateStr: string) => new Date(dateStr + 'T00:00:00');

  const allDates = tasks.flatMap(task => [parseDate(task.startDate), parseDate(task.endDate)]);
  const projectStartDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const projectEndDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  const projectSpansMultipleYears = projectStartDate.getFullYear() !== projectEndDate.getFullYear();

  const formatDateForGantt = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    if (projectSpansMultipleYears) {
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    }
    return `${day}/${month}`;
  };

  const totalDurationDays = (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24) + 1;
  
  const getDaysDiff = (date1: Date, date2: Date) => {
    return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  };

  const getMonthMarkers = () => {
      const markers = [];
      let currentDate = new Date(projectStartDate);
      currentDate.setDate(1);

      while(currentDate <= projectEndDate) {
          const offsetDays = getDaysDiff(projectStartDate, currentDate);
          const offsetPercent = (offsetDays / totalDurationDays) * 100;
          markers.push({
              name: currentDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
              offset: Math.max(0, offsetPercent)
          });
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
      return markers;
  }
  const monthMarkers = getMonthMarkers();

  const colors = [
    'bg-sky-600', 'bg-teal-600', 'bg-indigo-600', 'bg-rose-600', 
    'bg-amber-600', 'bg-lime-600', 'bg-violet-600', 'bg-emerald-600',
  ];

  return (
    <div className="font-sans">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Gráfico de Gantt</h2>
        <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg overflow-x-auto">
            <div className="relative h-8" style={{ width: '100%' }}>
                {monthMarkers.map((marker, index) => (
                    <div key={index} className="absolute top-0 h-full flex items-center" style={{ left: `${marker.offset}%`}}>
                        <span className="text-xs font-semibold uppercase text-slate-400">{marker.name}</span>
                        <div className="h-full border-l border-slate-200 ml-2"></div>
                    </div>
                ))}
                <div className="absolute bottom-0 w-full border-b border-slate-200"></div>
            </div>
            
            <div className="relative mt-4">
                {tasks.map((task, index) => {
                    const taskStartDate = parseDate(task.startDate);
                    const taskEndDate = parseDate(task.endDate);

                    const offsetDays = getDaysDiff(projectStartDate, taskStartDate);
                    const durationDays = getDaysDiff(taskStartDate, taskEndDate) + 1;

                    const offsetPercent = (offsetDays / totalDurationDays) * 100;
                    const widthPercent = (durationDays / totalDurationDays) * 100;
                    
                    const barColor = colors[index % colors.length];

                    const startDateFormatted = formatDateForGantt(taskStartDate);
                    const endDateFormatted = formatDateForGantt(taskEndDate);
                    const dateLabel = `${startDateFormatted} - ${endDateFormatted}`;
                    
                    const isBarShort = widthPercent < (isForPdf ? 25 : 15);

                    return (
                        <div key={task.id} className="flex items-center py-3">
                            <div className={`flex-none pr-4 text-sm font-medium text-slate-700 ${isForPdf ? 'w-40' : 'w-48 truncate'}`}>{task.taskName}</div>
                            <div className="flex-grow relative h-8 bg-slate-100 rounded-md">
                                <div
                                    className="absolute h-full group"
                                    style={{
                                        left: `${offsetPercent}%`,
                                        width: `${widthPercent}%`,
                                    }}
                                >
                                    <div className={`h-full rounded-md ${barColor} transition-all duration-300 ${!isForPdf ? 'hover:brightness-110' : ''}`}></div>
                                    {!isForPdf && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg z-10 whitespace-nowrap">
                                            {task.startDate} a {task.endDate}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                                        </div>
                                    )}
                                    {!isBarShort && (
                                      <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden">
                                        <span className="text-xs md:text-sm text-white font-bold whitespace-nowrap px-2">
                                          {dateLabel}
                                        </span>
                                      </div>
                                    )}
                                </div>
                                {isBarShort && (
                                  <div 
                                    className="absolute h-full flex items-center pointer-events-none"
                                    style={{ left: `calc(${offsetPercent}% + ${widthPercent}% + 8px)`}}
                                  >
                                    <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                                      {dateLabel}
                                    </span>
                                  </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default GanttChart;