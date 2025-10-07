
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ConstructionPlan } from '../types.ts';
import FinancialAnalysisSection from './FinancialAnalysisSection.tsx';
import InvestorScenariosPdf from './InvestorScenariosPdf.tsx';

interface DownloadInvestorPdfButtonProps {
  projectPlan: ConstructionPlan;
  financials: any;
  proposalText: string | null;
  descriptiveMemorial: string | null;
  projectImage: string | null;
  planViewImage: string | null;
  interiorKitchenImage: string | null;
  interiorLivingImage: string | null;
  responsibleProfessional: string;
  clientName: string;
  icon: React.ReactNode;
}

const DownloadInvestorPdfButton: React.FC<DownloadInvestorPdfButtonProps> = ({ 
    projectPlan, financials, proposalText, descriptiveMemorial, projectImage, 
    planViewImage, interiorKitchenImage, interiorLivingImage,
    responsibleProfessional, clientName, icon 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsLoading(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    const addPageIfNeeded = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // 1. Add Title Page
    pdf.setFontSize(22);
    pdf.setTextColor('#1e293b');
    pdf.text('Proposta de Investimento e Análise Financeira', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    if (projectImage) {
        const imgProps = pdf.getImageProperties(projectImage);
        const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
        if (yPos + imgHeight + 10 < pageHeight - margin) {
            pdf.addImage(projectImage, 'JPEG', margin, yPos, pageWidth - margin * 2, imgHeight);
            yPos += imgHeight + 10;
        }
    }

    if (clientName) {
        pdf.setFontSize(14);
        pdf.text(`Cliente: ${clientName}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
    }
    
    if (responsibleProfessional) {
        pdf.setFontSize(12);
        pdf.text(`Profissional Responsável: ${responsibleProfessional}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
    }
    
    // 2. Add Project Visualizations Page
    const images = [
        { src: interiorKitchenImage, title: "Cozinha" },
        { src: interiorLivingImage, title: "Sala de Estar" },
        { src: planViewImage, title: "Planta Baixa" }
    ].filter(img => img.src);

    if (images.length > 0) {
        pdf.addPage();
        yPos = margin;
        pdf.setFontSize(18);
        pdf.text('Visualizações do Projeto', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        const imgWidth = (pageWidth - (margin * 2) - 10) / 2; // side-by-side with 10mm gap
        let xPos = margin;
        
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const imgProps = pdf.getImageProperties(img.src!);
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            if (yPos + imgHeight + 15 > pageHeight - margin && i % 2 === 0) {
                pdf.addPage();
                yPos = margin;
                pdf.setFontSize(18);
                pdf.text('Visualizações do Projeto (cont.)', pageWidth / 2, yPos, { align: 'center' });
                yPos += 10;
            }

            pdf.setFontSize(12);
            pdf.setTextColor('#475569');
            pdf.text(img.title, xPos, yPos);
            yPos += 5;
            pdf.addImage(img.src!, 'JPEG', xPos, yPos, imgWidth, imgHeight);

            if ((i + 1) % 2 === 0) { // After every second image, move to next row
                xPos = margin;
                yPos += imgHeight + 10;
            } else { // Move to second column
                xPos += imgWidth + 10;
                yPos -= 5; // Reset yPos for the second column
            }
        }
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1200px'; 
    document.body.appendChild(tempContainer);
    const tempRoot = ReactDOM.createRoot(tempContainer);

    // 3. Add Financial Analysis Page
    await new Promise<void>(async (resolve) => {
        tempRoot.render(
            <div style={{ padding: '20px', background: 'white', width: '1200px' }}>
                <FinancialAnalysisSection financials={financials} isForPdf={true} />
            </div>
        );
        
        await new Promise(r => setTimeout(r, 500)); 

        const element = tempContainer.firstChild as HTMLElement;
        if (element) {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
            
            pdf.addPage();
            yPos = margin;

            pdf.setFontSize(18);
            pdf.text('Análise Financeira e BDI', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            pdf.addImage(imgData, 'PNG', margin, yPos, pageWidth - margin * 2, imgHeight);
        }
        resolve();
    });
    
     // 4. Add Scenario Analysis
    await new Promise<void>(async (resolve) => {
        tempRoot.render(
            <div style={{ padding: '20px', background: 'white', width: '1200px' }}>
                <InvestorScenariosPdf financials={financials} projectPlan={projectPlan} />
            </div>
        );
        
        await new Promise(r => setTimeout(r, 500)); 

        const element = tempContainer.firstChild as HTMLElement;
        if (element) {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pageWidth - margin * 2)) / imgProps.width;
            
            pdf.addPage();
            yPos = margin;
            
            // The title is inside the component, so we just add the image.
            pdf.addImage(imgData, 'PNG', margin, yPos, pageWidth - margin * 2, imgHeight);
        }
        resolve();
    });

    // 5. Add Descriptive Memorial
    if (descriptiveMemorial) {
        pdf.addPage();
        yPos = margin;
        pdf.setFontSize(18);
        pdf.text('Memorial Descritivo', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        const lines = descriptiveMemorial.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                addPageIfNeeded(4);
                yPos += 4;
            } else {
                const isTitle = /^\d+\.\s/.test(trimmedLine);
                if(isTitle) {
                     addPageIfNeeded(10);
                     yPos += 4; // Extra space before titles
                }
                pdf.setFont('helvetica', isTitle ? 'bold' : 'normal');
                pdf.setFontSize(isTitle ? 12 : 10);
                
                const textLines = pdf.splitTextToSize(trimmedLine, pageWidth - margin * 2);
                const textHeight = textLines.length * (isTitle ? 6 : 5);
                addPageIfNeeded(textHeight);

                pdf.text(textLines, margin, yPos);
                yPos += textHeight;
            }
        });
    }

    // 6. Add Proposal Text
    const cleanedProposal = proposalText?.replace(/\[TABELA_BDI_ROI_PLACEHOLDER\]/g, '').replace(/Análise Financeira e BDI\n\n/g, '');

    if (cleanedProposal) {
        pdf.addPage();
        yPos = margin;
        pdf.setFontSize(18);
        pdf.text('Proposta Comercial', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
    
        const proposalLines = cleanedProposal.split('\n');

        const sectionTitles = [
            'Introdução', 'Escopo do Projeto Detalhado', 'Cronograma Previsto', 
            'Resumo do Orçamento', 'Próximos Passos', 'Encerramento'
        ].map(t => t.toLowerCase());
    
        proposalLines.forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                addPageIfNeeded(5);
                yPos += 5;
                return;
            }

            const isTitle = sectionTitles.includes(trimmedLine.replace(/:$/, '').toLowerCase());

            if (isTitle) {
                addPageIfNeeded(20);
                yPos += 6;
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.text(trimmedLine, margin, yPos);
                yPos += 8;
            } else if (trimmedLine.startsWith('* ')) {
                const bulletText = trimmedLine.substring(2);
                const textLines = pdf.splitTextToSize(bulletText, pageWidth - (margin * 2) - 5);
                const textHeight = textLines.length * 5;
                addPageIfNeeded(textHeight + 2);
                
                pdf.setFontSize(14);
                pdf.text('•', margin, yPos + 1);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                pdf.text(textLines, margin + 5, yPos);
                yPos += textHeight + 2;
            } else {
                const textLines = pdf.splitTextToSize(trimmedLine, pageWidth - (margin * 2));
                const textHeight = textLines.length * 5;
                addPageIfNeeded(textHeight + 2);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                pdf.text(textLines, margin, yPos);
                yPos += textHeight + 2;
            }
        });
    }

    // Add page numbers and footer
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor('#64748b');
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Proposta para Investidores', margin, pageHeight - 10);
    }

    // Cleanup
    document.body.removeChild(tempContainer);
    
    pdf.save('proposta-investidores.pdf');
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        'Gerando PDF...'
      ) : (
        <>
          {icon}
          Proposta (Investidor)
        </>
      )}
    </button>
  );
};

export default DownloadInvestorPdfButton;
