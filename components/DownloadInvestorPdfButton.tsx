
import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ConstructionPlan } from '../types.ts';
import DownloadPdfButton from './DownloadPdfButton.tsx';
import FinancialAnalysisSection from './FinancialAnalysisSection.tsx';
import InvestmentMatrix from './InvestmentMatrix.tsx';
import TaxSection from './TaxSection.tsx';

type ProjectImages = Record<string, string>;

interface DownloadInvestorPdfButtonProps {
  projectPlan: ConstructionPlan;
  financials: any;
  proposalText: string | null;
  projectImages: ProjectImages | null;
  responsibleProfessional: string;
  clientName: string;
  icon: React.ReactNode;
  projectDurationInDays: number;
}

const DownloadInvestorPdfButton: React.FC<DownloadInvestorPdfButtonProps> = ({ 
    projectPlan, financials, proposalText, projectImages, responsibleProfessional, clientName, icon, projectDurationInDays 
}) => {

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
        const margin = 20;

        const renderAndCapture = async (component: React.ReactElement) => {
            await new Promise<void>(resolve => {
                tempRoot.render(<div style={{ padding: '20px', background: 'white', width: '1200px' }}>{component}</div>);
                setTimeout(resolve, 500);
            });
            const element = tempContainer.firstChild as HTMLElement;
            const canvas = await html2canvas(element, { scale: 2 });
            return canvas.toDataURL('image/png');
        };

        const addImageToPdf = (imgData: string, title: string) => {
            pdf.addPage();
            let yPos = margin;
            pdf.setFontSize(18);
            pdf.setTextColor('#1e293b');
            pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
            pdf.addImage(imgData, 'PNG', margin, yPos, pageWidth - margin * 2, imgHeight);
        };

        // 1. Página de Título
        pdf.addPage();
        let yPos = margin;
        pdf.setFontSize(22);
        pdf.setTextColor('#1e293b');
        pdf.text('Proposta de Investimento e Análise Financeira', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        if (projectImages?.facade) {
            const imgProps = pdf.getImageProperties(projectImages.facade);
            const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
            if (yPos + imgHeight + 10 < pageHeight - margin) {
                pdf.addImage(projectImages.facade, 'JPEG', margin, yPos, pageWidth - margin * 2, imgHeight);
                yPos += imgHeight + 15;
            }
        }
        const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Preço Final de Venda:', margin, yPos);
        pdf.text(financials.salePriceString, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor('#475569');
        pdf.text('Impostos Estimados:', margin, yPos);
        pdf.text(formatCurrency(financials.taxesOnRevenueValue), pageWidth - margin, yPos, { align: 'right' });
        yPos += 7;
        pdf.text('Lucro Líquido Estimado:', margin, yPos);
        pdf.text(formatCurrency(financials.netProfitValue), pageWidth - margin, yPos, { align: 'right' });
        yPos += 15;
        pdf.setDrawColor('#cbd5e1');
        pdf.line(margin, yPos - 7, pageWidth - margin, yPos - 7);
        if (clientName) {
            pdf.setFontSize(14);
            pdf.setTextColor('#1e293b');
            pdf.text(`Cliente: ${clientName}`, margin, yPos);
            yPos += 10;
        }
        if (responsibleProfessional) {
            pdf.setFontSize(12);
            pdf.setTextColor('#475569');
            pdf.text(`Profissional Responsável: ${responsibleProfessional}`, margin, yPos);
        }

        // 2. Página de Visualizações
        if (projectImages && Object.keys(projectImages).length > 0) {
            pdf.addPage();
            yPos = margin;
            pdf.setFontSize(18);
            pdf.text('Visualizações do Projeto', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;
            const imgWidth = (pageWidth - margin * 2 - 10) / 2;
            let currentX = margin;
            for (const [key, src] of Object.entries(projectImages)) {
                const imgProps = pdf.getImageProperties(src);
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                if (yPos + imgHeight + 15 > pageHeight - margin) {
                    pdf.addPage();
                    yPos = margin;
                }
                pdf.addImage(src, 'JPEG', currentX, yPos, imgWidth, imgHeight);
                pdf.setFontSize(10);
                pdf.text(key.charAt(0).toUpperCase() + key.slice(1), currentX, yPos + imgHeight + 5);
                currentX = (currentX === margin) ? (currentX + imgWidth + 10) : margin;
                if (currentX === margin) yPos += imgHeight + 15;
            }
        }

        // 3. Renderiza e adiciona componentes de análise
        const financialAnalysisImg = await renderAndCapture(<FinancialAnalysisSection financials={financials} isForPdf={true} />);
        addImageToPdf(financialAnalysisImg, 'Análise Financeira e BDI');
        const investmentMatrixImg = await renderAndCapture(<InvestmentMatrix financials={financials} isForPdf={true} projectDurationInDays={projectDurationInDays} />);
        addImageToPdf(investmentMatrixImg, 'Matriz de Cenários de Investimento');
        const taxAnalysisImg = await renderAndCapture(<TaxSection financials={financials} projectPlan={projectPlan} isForPdf={true} />);
        addImageToPdf(taxAnalysisImg, 'Análise Tributária na Construção Civil');
        
        // 4. Adiciona o Texto da Proposta
        const proposalTextWithoutPlaceholders = proposalText?.replace(/\[.*?\]/g, '').replace(/Análise Financeira e BDI\s*\n*/g, '').replace(/Matriz de Cenários de Investimento\s*\n*/g, '').replace(/Análise Tributária na Construção Civil\s*\n*/g, '');
        if (proposalTextWithoutPlaceholders) {
            pdf.addPage();
            yPos = margin;
            pdf.setFontSize(18);
            pdf.text('Proposta Comercial Detalhada', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;
            const proposalLines = proposalTextWithoutPlaceholders.split('\n');
            const sectionTitles = ['Introdução', 'Escopo do Projeto Detalhado', 'Cronograma Previsto', 'Resumo do Orçamento', 'Próximos Passos', 'Encerramento'].map(t => t.toLowerCase());
            proposalLines.forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine && yPos > margin + 5) { yPos += 5; return; }
                const isTitle = sectionTitles.includes(trimmedLine.replace(/:$/, '').toLowerCase());
                let textLines: string[], textHeight: number;
                if (isTitle) {
                    textHeight = 20;
                    if (yPos + textHeight > pageHeight - margin) { pdf.addPage(); yPos = margin; }
                    yPos += 6; pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16);
                    pdf.text(trimmedLine, margin, yPos); yPos += 8;
                } else if (trimmedLine.startsWith('* ')) {
                    const bulletText = trimmedLine.substring(2);
                    textLines = pdf.splitTextToSize(bulletText, pageWidth - (margin * 2) - 5);
                    textHeight = textLines.length * 5 + 2;
                    if (yPos + textHeight > pageHeight - margin) { pdf.addPage(); yPos = margin; }
                    pdf.setFontSize(14); pdf.text('•', margin, yPos + 1);
                    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
                    pdf.text(textLines, margin + 5, yPos); yPos += textHeight;
                } else {
                    textLines = pdf.splitTextToSize(trimmedLine, pageWidth - (margin * 2));
                    textHeight = textLines.length * 5 + 2;
                    if (yPos + textHeight > pageHeight - margin) { pdf.addPage(); yPos = margin; }
                    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
                    pdf.text(textLines, margin, yPos); yPos += textHeight;
                }
            });
        }
    } finally {
        document.body.removeChild(tempContainer);
    }
  };

  return (
    <DownloadPdfButton
      buttonText="Proposta (Investidor)"
      fileName="proposta-investidores.pdf"
      footerText="Proposta para Investidores"
      icon={icon}
      generatePdfContent={generatePdfContent}
      className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
    />
  );
};

export default DownloadInvestorPdfButton;