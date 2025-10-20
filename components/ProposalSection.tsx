import React, { useState, useEffect } from 'react';
import FormattedTextViewer from './FormattedTextViewer';
import FinancialAnalysisSection from './FinancialAnalysisSection';
import InvestmentMatrix from './InvestmentMatrix';
import TaxSection from './TaxSection';
import { EditIcon } from './icons/EditIcon';
import { SaveIcon } from './icons/SaveIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import type { ConstructionPlan } from '../types';

type ProjectImages = Record<string, string>;

interface ProposalSectionProps {
  proposalText: string;
  onTextChange: (newText: string | null) => void;
  projectImages: ProjectImages | null;
  onRegenerateImage: () => void;
  isGeneratingImage: boolean;
  financials: any; 
  projectPlan: ConstructionPlan;
  projectDurationInDays: number;
}

const imageLabels: Record<string, string> = {
    facade: 'Fachada',
    kitchen: 'Cozinha',
    livingRoom: 'Sala de Estar',
    bedroom: 'Quarto',
    bathroom: 'Banheiro'
};

const ProposalSection: React.FC<ProposalSectionProps> = ({ proposalText, onTextChange, projectImages, onRegenerateImage, isGeneratingImage, financials, projectPlan, projectDurationInDays }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(proposalText);
  const [activeImageKey, setActiveImageKey] = useState<string>('facade');

  useEffect(() => {
    if (!isEditing) {
      setEditText(proposalText);
    }
  }, [proposalText, isEditing]);
  
  useEffect(() => {
    if (projectImages && !projectImages[activeImageKey]) {
        setActiveImageKey(Object.keys(projectImages)[0] || 'facade');
    }
  }, [projectImages, activeImageKey]);


  const handleSave = () => {
    onTextChange(editText);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditText(proposalText);
    setIsEditing(false);
  }

  const handleStartEditing = () => {
    setEditText(proposalText); 
    setIsEditing(true);
  }
  
  const renderProposalContent = () => {
    const parts = proposalText.split(/(\[TABELA_BDI_ROI_PLACEHOLDER\]|\[MATRIZ_INVESTIMENTO_PLACEHOLDER\]|\[ANALISE_TRIBUTARIA_PLACEHOLDER\])/g);

    return parts.map((part, index) => {
        if (part === '[TABELA_BDI_ROI_PLACEHOLDER]') {
            return <div key={index} className="my-6"><FinancialAnalysisSection financials={financials} /></div>;
        }
        if (part === '[MATRIZ_INVESTIMENTO_PLACEHOLDER]') {
            return <div key={index} className="my-6"><InvestmentMatrix financials={financials} projectDurationInDays={projectDurationInDays} /></div>;
        }
         if (part === '[ANALISE_TRIBUTARIA_PLACEHOLDER]') {
            return <div key={index} className="my-6"><TaxSection financials={financials} projectPlan={projectPlan} /></div>;
        }
        return <FormattedTextViewer key={index} text={part} />;
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Proposta Comercial e Visualizações</h2>
            {!isEditing && (
            <button
                onClick={handleStartEditing}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <EditIcon className="w-5 h-5 mr-2" />
                Editar Texto
            </button>
            )}
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:p-6">
            <div className="relative mb-6 rounded-lg overflow-hidden border border-slate-200 group">
                {projectImages && projectImages[activeImageKey] ? (
                     <img src={projectImages[activeImageKey]} alt={`Visualização do projeto: ${imageLabels[activeImageKey]}`} className="w-full h-auto aspect-video object-cover" />
                ) : (
                    <div className="w-full aspect-video bg-slate-200 flex items-center justify-center">
                        <p className="text-slate-500">{isGeneratingImage ? 'Gerando imagem...' : 'Imagem indisponível'}</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        onClick={onRegenerateImage} 
                        disabled={isGeneratingImage}
                        className="inline-flex items-center px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-blue-500 disabled:bg-slate-200/80 disabled:cursor-not-allowed transition-all"
                    >
                        {isGeneratingImage ? (
                            <>
                                <RefreshCwIcon className="w-5 h-5 mr-2 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <RefreshCwIcon className="w-5 h-5 mr-2" />
                                Gerar Novas Ilustrações
                            </>
                        )}
                    </button>
                </div>
            </div>

            {projectImages && Object.keys(projectImages).length > 0 && (
                 <div className="flex flex-wrap justify-center gap-2">
                    {Object.keys(imageLabels).map(key => 
                        projectImages[key] && (
                            <button
                                key={key}
                                onClick={() => setActiveImageKey(key)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeImageKey === key ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {imageLabels[key]}
                            </button>
                        )
                    )}
                 </div>
            )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-slate-600 mb-4 text-sm">
            Ajuste o texto da proposta abaixo. As alterações serão refletidas no PDF final. Placeholders como [MATRIZ_INVESTIMENTO_PLACEHOLDER] serão substituídos pelas tabelas correspondentes.
          </p>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y font-serif"
            aria-label="Texto da Proposta Comercial"
          />
          <div className="flex justify-end gap-4 mt-4">
             <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
             >
                Cancelar
             </button>
             <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
             >
                <SaveIcon className="w-5 h-5 mr-2" />
                Salvar Alterações
             </button>
          </div>
        </div>
      ) : (
         <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-600 mb-6 text-sm">
                Abaixo está um rascunho da proposta comercial gerado pela IA. Clique em "Editar Texto" para fazer ajustes. Os valores são atualizados dinamicamente ao alterar a margem de lucro.
            </p>
            <div className="p-4 md:p-6 border border-slate-200 rounded-md bg-slate-50/50">
                {renderProposalContent()}
            </div>
        </div>
      )}
    </div>
  );
};

export default ProposalSection;