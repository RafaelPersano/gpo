import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ConstructionPlan } from '../types.ts';

import DownloadPdfButton from './DownloadPdfButton.tsx';
import BudgetSection from './BudgetSection.tsx';
import GanttChart from './GanttChart.tsx';
import PlanTable from './PlanTable.tsx';
import MaterialDeliverySchedule from './MaterialDeliverySchedule.tsx';
import PaymentSchedule from './PaymentSchedule.tsx';
import AbcCurve from './AbcCurve.tsx';
import ProjectEvolutionChart from './ProjectEvolutionChart.tsx';

interface DownloadEngineeringPdfButtonProps {
  projectPlan: ConstructionPlan;
  icon: React.ReactNode;
}

const DownloadEngineeringPdfButton: React.FC<DownloadEngineeringPdfButtonProps> = ({ projectPlan, icon }) => {

  const generatePdfContent = async (pdf: jsPDF) => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1200px';
    document.body.appendChild(tempContainer);

    try {
        const tempRoot = ReactDOM.createRoot(tempContainer);
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;

        const renderAndCapture = async (component: React.ReactElement, title: string) => {
            await new Promise<void>((resolve) => {
                tempRoot.render(
                    <div style={{ padding: '10px', background: 'white' }}>
                        {component}
                    </div>
                );
                // Pequeno atraso para garantir a renderização completa antes da captura
                setTimeout(resolve, 500);
            });

            const element = tempContainer.firstChild as HTMLElement;
            if (element) {
                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
                
                pdf.addPage();
                pdf.setFontSize(16);
                pdf.setTextColor('#1e293b');
                pdf.text(title, pageWidth / 2, margin, { align: 'center' });
                pdf.addImage(imgData, 'PNG', margin, margin + 10, pageWidth - margin * 2, imgHeight);
            }
        };
        
        // Adiciona a página de título
        pdf.addPage();
        pdf.setFontSize(22);
        pdf.setTextColor('#1e293b');
        pdf.text('Plano de Obra - Relatório Técnico', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
        pdf.setFontSize(14);
        pdf.setTextColor('#475569');
        pdf.text(`Período: ${new Date(projectPlan.projectStartDate).toLocaleDateString('pt-BR')} a ${new Date(projectPlan.projectEndDate).toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
        
        // Renderiza e captura todos os componentes técnicos
        await renderAndCapture(<BudgetSection budget={projectPlan.budget} tasks={projectPlan.tasks} />, "Resumo do Orçamento");
        await renderAndCapture(<AbcCurve tasks={projectPlan.tasks} isForPdf={true} />, "Curva ABC de Custos");
        await renderAndCapture(<ProjectEvolutionChart tasks={projectPlan.tasks} projectStartDate={projectPlan.projectStartDate} projectEndDate={projectPlan.projectEndDate} isForPdf={true} />, "Evolução da Obra (Curva S)");
        await renderAndCapture(<PlanTable tasks={projectPlan.tasks} onTaskUpdate={() => {}} isForPdf={true} />, "Plano de Tarefas Detalhado");
        await renderAndCapture(<GanttChart tasks={projectPlan.tasks} isForPdf={true} />, "Gráfico de Gantt");
        await renderAndCapture(<MaterialDeliverySchedule deliveries={projectPlan.materialDeliveries} />, "Cronograma de Entrega de Materiais");
        await renderAndCapture(<PaymentSchedule schedule={projectPlan.paymentSchedule} />, "Cronograma de Pagamentos");

    } finally {
        // Limpeza do container temporário
        if (tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
    }
  };

  return (
    <DownloadPdfButton
      buttonText="Relatório Técnico"
      fileName="plano-de-obra-engenharia.pdf"
      footerText="Relatório Técnico de Engenharia"
      icon={icon}
      generatePdfContent={generatePdfContent}
      className="bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500"
    />
  );
};

export default DownloadEngineeringPdfButton;
