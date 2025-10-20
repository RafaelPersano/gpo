import React, { useState } from 'react';
import jsPDF from 'jspdf';

interface DownloadPdfButtonProps {
  buttonText: string;
  fileName: string;
  footerText: string;
  icon: React.ReactNode;
  generatePdfContent: (pdf: jsPDF) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({ 
  buttonText,
  fileName,
  footerText,
  icon,
  generatePdfContent,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A função de geração de conteúdo é responsável por adicionar todas as páginas necessárias.
      await generatePdfContent(pdf);

      // O primeiro PDF é adicionado pela função de conteúdo ou é uma página em branco que precisamos remover.
      // O jsPDF sempre começa com uma página, que será a primeira a ser deletada se o conteúdo adicionar suas próprias páginas.
      if ((pdf.internal as any).getNumberOfPages() > 0) {
        pdf.deletePage(1);
      }
      
      const pageCount = (pdf.internal as any).getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 15;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor('#64748b'); // slate-500
          pdf.text(footerText, margin, pageHeight - 10);
          pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error(`Erro ao gerar o PDF '${fileName}':`, error);
      alert(`Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes e tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading || disabled}
      className={`inline-flex items-center px-4 py-2 font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        'Gerando PDF...'
      ) : (
        <>
          {icon}
          {buttonText}
        </>
      )}
    </button>
  );
};

export default DownloadPdfButton;
