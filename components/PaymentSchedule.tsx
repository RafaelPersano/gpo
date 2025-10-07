
import React from 'react';
import type { PaymentInstallment } from '../types.ts';

interface PaymentScheduleProps {
  schedule: PaymentInstallment[];
}

const statusColorMap: { [key: string]: string } = {
  'Pendente': 'bg-red-200 text-red-800',
  'Pago': 'bg-green-200 text-green-800',
};

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ schedule }) => {
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

  const laborPayments = schedule.filter(item => item.category === 'Mão de Obra');
  const materialPayments = schedule.filter(item => item.category === 'Material');

  const renderPaymentTable = (title: string, payments: PaymentInstallment[]) => {
    if (payments.length === 0) return null;
    
    const totalAmount = payments.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="flex-1 min-w-[300px]">
            <h3 className="text-xl font-bold text-slate-700 mb-3">{title}</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-50">
                    <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {payments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-base font-medium text-slate-900">{item.description}</td>
                        <td className="px-4 py-3 text-base text-slate-600 whitespace-nowrap">{formatDate(item.dueDate)}</td>
                        <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[item.status] || 'bg-gray-200 text-gray-800'}`}>
                            {item.status}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-base text-slate-800 font-semibold text-right whitespace-nowrap">{formatCurrency(item.amount)}</td>
                    </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-100">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-slate-800">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap text-base">{formatCurrency(totalAmount)}</td>
                    </tr>
                </tfoot>
                </table>
            </div>
        </div>
    );
  };


  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Cronograma de Pagamentos</h2>
      <div className="flex flex-wrap gap-8">
        {renderPaymentTable('Mão de Obra & Gestão', laborPayments)}
        {renderPaymentTable('Materiais', materialPayments)}
      </div>
    </div>
  );
};

export default PaymentSchedule;