

import React, { useState } from 'react';
import type { ConstructionTask } from '../types.ts';

interface PlanTableProps {
  tasks: ConstructionTask[];
  onTaskUpdate: (task: ConstructionTask) => void;
  isForPdf?: boolean;
}

const statusColorMap: { [key: string]: string } = {
  'Não Iniciado': 'bg-gray-200 text-gray-800',
  'Em Andamento': 'bg-blue-200 text-blue-800',
  'Concluído': 'bg-green-200 text-green-800',
  'Atrasado': 'bg-red-200 text-red-800',
};

const PlanTable: React.FC<PlanTableProps> = ({ tasks, onTaskUpdate, isForPdf = false }) => {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  const handleDateChange = (taskId: number, field: 'startDate' | 'endDate', value: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, [field]: value };
    onTaskUpdate(updatedTask);
    
    // Validation
    const startDate = new Date(updatedTask.startDate + 'T00:00:00');
    const endDate = new Date(updatedTask.endDate + 'T00:00:00');

    const errorKeyStart = `${taskId}-startDate`;
    const errorKeyEnd = `${taskId}-endDate`;
    const newErrors = { ...errors };

    if (endDate < startDate) {
      newErrors[errorKeyStart] = 'A data de início deve ser anterior à data de término.';
      newErrors[errorKeyEnd] = 'A data de término não pode ser anterior à data de início.';
    } else {
      delete newErrors[errorKeyStart];
      delete newErrors[errorKeyEnd];
    }
    setErrors(newErrors);
  };
  
  const totalMaterials = tasks.reduce((sum, task) => sum + task.costMaterials, 0);
  const totalLabor = tasks.reduce((sum, task) => sum + task.costLabor, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Plano de Tarefas</h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Tarefa</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Responsável</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Início</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Término</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">C. Material</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">C. M. Obra</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tasks.map((task) => (
              <tr key={task.id} className={!isForPdf ? "hover:bg-slate-50" : ""}>
                <td className="px-4 py-3 text-base text-slate-900">
                  <div className="font-bold">{task.taskName}</div>
                  <div className="text-sm text-slate-500">{task.phase}</div>
                </td>
                <td className="px-4 py-3 text-base text-slate-600">{task.assignee}</td>
                <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">
                  {isForPdf ? (
                    <span>{formatDate(task.startDate)}</span>
                  ) : (
                    <input
                      type="date"
                      value={task.startDate}
                      onChange={(e) => handleDateChange(task.id, 'startDate', e.target.value)}
                      className={`p-1 rounded-md bg-transparent border-2 ${
                        errors[`${task.id}-startDate`] ? 'border-red-500' : 'border-transparent focus:border-blue-500'
                      }`}
                      title={errors[`${task.id}-startDate`] || 'Data de início'}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">
                  {isForPdf ? (
                    <span>{formatDate(task.endDate)}</span>
                  ) : (
                    <input
                      type="date"
                      value={task.endDate}
                      onChange={(e) => handleDateChange(task.id, 'endDate', e.target.value)}
                      className={`p-1 rounded-md bg-transparent border-2 ${
                        errors[`${task.id}-endDate`] ? 'border-red-500' : 'border-transparent focus:border-blue-500'
                      }`}
                      title={errors[`${task.id}-endDate`] || 'Data de término'}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">{formatCurrency(task.costMaterials)}</td>
                <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">{formatCurrency(task.costLabor)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[task.status] || 'bg-gray-200 text-gray-800'}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-slate-800">Total</td>
                <td className="px-4 py-3 text-base font-bold text-slate-800 whitespace-nowrap">{formatCurrency(totalMaterials)}</td>
                <td className="px-4 py-3 text-base font-bold text-slate-800 whitespace-nowrap">{formatCurrency(totalLabor)}</td>
                <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PlanTable;