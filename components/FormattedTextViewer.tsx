import React from 'react';

interface FormattedTextViewerProps {
  text: string;
}

const FormattedTextViewer: React.FC<FormattedTextViewerProps> = ({ text }) => {
  const sectionTitles = [
    'Introdução',
    'Escopo do Projeto Detalhado',
    'Cronograma Previsto',
    'Resumo do Orçamento',
    'Próximos Passos',
    'Encerramento'
  ].map(t => t.toLowerCase());

  const renderBlocks = () => {
    const blocks: { type: 'p' | 'h3' | 'ul' | 'empty'; content: string | string[] }[] = [];
    let currentList: string[] = [];
    const lines = text.split('\n');

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push({ type: 'ul', content: [...currentList] });
        currentList = [];
      }
    };

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isTitle = sectionTitles.includes(trimmedLine.replace(/:$/, '').toLowerCase());

      if (trimmedLine.startsWith('* ')) {
        currentList.push(trimmedLine.substring(2));
      } else {
        flushList();
        if (isTitle) {
          blocks.push({ type: 'h3', content: trimmedLine });
        } else if (trimmedLine) {
          blocks.push({ type: 'p', content: trimmedLine });
        } else {
          blocks.push({ type: 'empty', content: '' });
        }
      }
    });
    flushList(); 

    return blocks.map((block, index) => {
      switch (block.type) {
        case 'h3':
          return <h3 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3 pb-2 border-b border-slate-200">{block.content}</h3>;
        case 'p':
          return <p key={index} className="text-slate-700 leading-relaxed">{block.content}</p>;
        case 'ul':
          return (
            <ul key={index} className="list-disc list-inside space-y-2 my-4 pl-4 text-slate-700">
              {(block.content as string[]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
        case 'empty':
          return <div key={index} className="h-2"></div>;
        default:
          return null;
      }
    });
  };

  return <div className="font-serif">{renderBlocks()}</div>;
};

export default FormattedTextViewer;
