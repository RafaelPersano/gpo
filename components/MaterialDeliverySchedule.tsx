

import React from 'react';
import type { MaterialDelivery } from '../types.ts';

interface MaterialDeliveryScheduleProps {
  deliveries: MaterialDelivery[];
}

const statusColorMap: { [key: string]: string } = {
  'Pendente': 'bg-yellow-200 text-yellow-800',
  'Pedido': 'bg-blue-200 text-blue-800',
  'Entregue': 'bg-green-200 text-green-800',
};

const MaterialDeliverySchedule: React.FC<MaterialDeliveryScheduleProps> = ({ deliveries }) => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Cronograma de Entrega de Materiais</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Material</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Data de Entrega</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Tarefa Relacionada (ID)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {deliveries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-base font-medium text-slate-900">{item.materialName}</td>
                <td className="px-4 py-3 text-base text-slate-600">{item.supplier}</td>
                <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">{formatDate(item.deliveryDate)}</td>
                <td className="px-4 py-3 text-base text-slate-600 text-center">{item.relatedTaskId}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[item.status] || 'bg-gray-200 text-gray-800'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialDeliverySchedule;