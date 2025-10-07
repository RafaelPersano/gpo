
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ConstructionPlan, ProjectDetails } from '../types.ts';

import BudgetSection from './BudgetSection.tsx';
import GanttChart from './GanttChart.tsx';
import PlanTable from './PlanTable.tsx';
import MaterialDeliverySchedule from './MaterialDeliverySchedule.tsx';
import PaymentSchedule from './PaymentSchedule.tsx';
import AbcCurve from './AbcCurve.tsx';
import ProjectEvolutionChart from './ProjectEvolutionChart.tsx';

interface DownloadEngineeringPdfButtonProps {
  projectPlan: ConstructionPlan;
  planViewImage: string | null;
  descriptiveMemorial: string | null;
  projectDetails: ProjectDetails | null;
  icon: React.ReactNode;
}

const DownloadEngineeringPdfButton: React.FC<DownloadEngineeringPdfButtonProps> = ({ projectPlan, planViewImage, descriptiveMemorial, projectDetails, icon }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsLoading(true);
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1200px';
    document.body.appendChild(tempContainer);

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        
        const tempRoot = ReactDOM.createRoot(tempContainer);

        const renderAndCapture = async (component: React.ReactElement, title: string) => {
            return new Promise<void>(async (resolve) => {
                tempRoot.render(
                    <div style={{ padding: '20px', background: 'white', width: '1200px' }}>
                        {component}
                    </div>
                );
                
                await new Promise(r => setTimeout(r, 500)); 

                const element = tempContainer.firstChild as HTMLElement;
                if (element) {
                    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                    const imgData = canvas.toDataURL('image/png');
                    const imgProps = pdf.getImageProperties(imgData);
                    const ratio = imgProps.height / imgProps.width;
                    const imgWidth = pageWidth - margin * 2;
                    const imgHeight = imgWidth * ratio;
                    
                    pdf.addPage();
                    let yPos = margin;

                    pdf.setFontSize(16);
                    pdf.setTextColor('#1e293b');
                    pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 10;
                    
                    pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
                }
                resolve();
            });
        };
        
        pdf.setFontSize(22);
        pdf.setTextColor('#1e293b');
        pdf.text('Plano de Obra - Relatório Técnico', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
        pdf.setFontSize(14);
        pdf.setTextColor('#475569');
        pdf.text(`Período: ${new Date(projectPlan.projectStartDate).toLocaleDateString('pt-BR')} a ${new Date(projectPlan.projectEndDate).toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
        
        await renderAndCapture(<BudgetSection budget={projectPlan.budget} tasks={projectPlan.tasks} />, "Resumo do Orçamento");
        await renderAndCapture(<AbcCurve tasks={projectPlan.tasks} isForPdf={true} />, "Curva ABC de Custos");
        await renderAndCapture(<ProjectEvolutionChart tasks={projectPlan.tasks} projectStartDate={projectPlan.projectStartDate} projectEndDate={projectPlan.projectEndDate} isForPdf={true} />, "Evolução da Obra (Curva S)");

        if (projectDetails && projectDetails.roomDimensions) {
            pdf.addPage();
            let yPos = margin;
            pdf.setFontSize(16);
            pdf.setTextColor('#1e293b');
            pdf.text('Quadro de Áreas', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Table Header
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('Ambiente', margin, yPos);
            pdf.text('Área (m²)', pageWidth - margin, yPos, { align: 'right' });
            yPos += 7;
            pdf.setDrawColor('#cbd5e1');
            pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2);

            // Table Body
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            projectDetails.roomDimensions.forEach(room => {
                if (yPos > pageHeight - margin - 5) {
                    pdf.addPage();
                    yPos = margin;
                }
                pdf.text(room.name, margin, yPos);
                pdf.text(room.area.toFixed(2).replace('.', ','), pageWidth - margin, yPos, { align: 'right' });
                yPos += 7;
            });
            
            // Table Footer
            yPos += 3;
            pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);

            if (projectDetails.unitArea && projectDetails.totalArea && projectDetails.numberOfUnits > 1 && projectDetails.unitArea !== projectDetails.totalArea) {
                pdf.text('Área por Unidade', margin, yPos);
                pdf.text(`${projectDetails.unitArea.toFixed(2).replace('.', ',')} m²`, pageWidth - margin, yPos, { align: 'right' });
                yPos += 7;
            }
            
            pdf.text('Área Total Construída', margin, yPos);
            pdf.text(`${projectDetails.totalArea.toFixed(2).replace('.', ',')} m²`, pageWidth - margin, yPos, { align: 'right' });
        }


        if (descriptiveMemorial) {
            pdf.addPage();
            let yPos = margin;
            pdf.setFontSize(16);
            pdf.setTextColor('#1e293b');
            pdf.text('Memorial Descritivo', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            const lines = descriptiveMemorial.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                    yPos += 4;
                } else {
                    const isTitle = /^\d+\.\s/.test(trimmedLine);
                    pdf.setFont('helvetica', isTitle ? 'bold' : 'normal');
                    pdf.setFontSize(isTitle ? 12 : 10);
                    
                    const textLines = pdf.splitTextToSize(trimmedLine, pageWidth - margin * 2);
                    const textHeight = textLines.length * (isTitle ? 6 : 5);
                    if (yPos + textHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPos = margin;
                    }
                    if (isTitle) yPos += 4;
                    pdf.text(textLines, margin, yPos);
                    yPos += textHeight;
                }
            });
        }
        
        if (planViewImage) {
            pdf.addPage();
            let yPos = margin;
            pdf.setFontSize(16);
            pdf.setTextColor('#1e293b');
            pdf.text("Planta Baixa", pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;
            
            const imgProps = pdf.getImageProperties(planViewImage);
            const ratio = imgProps.height / imgProps.width;
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = imgWidth * ratio;
            pdf.addImage(planViewImage, 'JPEG', margin, yPos, imgWidth, imgHeight);
        }

        await renderAndCapture(<PlanTable tasks={projectPlan.tasks} onTaskUpdate={() => {}} isForPdf={true} />, "Plano de Tarefas Detalhado");
        await renderAndCapture(<GanttChart tasks={projectPlan.tasks} isForPdf={true} />, "Gráfico de Gantt");
        await renderAndCapture(<MaterialDeliverySchedule deliveries={projectPlan.materialDeliveries} />, "Cronograma de Entrega de Materiais");
        await renderAndCapture(<PaymentSchedule schedule={projectPlan.paymentSchedule} />, "Cronograma de Pagamentos");

        pdf.deletePage(1); // Remove the blank first page

        const pageCount = pdf.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor('#64748b');
            pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            pdf.text('Relatório Técnico de Engenharia | GPO', margin, pageHeight - 10);
        }

        pdf.save('plano-de-obra-engenharia.pdf');

    } catch (error) {
        console.error("Erro ao gerar PDF técnico:", error);
        alert("Ocorreu um erro ao gerar o PDF. Por favor, verifique o console para mais detalhes e tente novamente.");
    } finally {
        if (tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
        setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        'Gerando PDF...'
      ) : (
        <>
          {icon}
          Relatório Técnico
        </>
      )}
    </button>
  );
};

export default DownloadEngineeringPdfButton;
