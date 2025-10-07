
import React, { useState, useEffect } from 'react';
import FormattedTextViewer from './FormattedTextViewer.tsx';
import FinancialAnalysisSection from './FinancialAnalysisSection.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { SaveIcon } from './icons/SaveIcon.tsx';
import { RefreshCwIcon } from './icons/RefreshCwIcon.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import type { RoomDimension } from '../types.ts';
import { RulerIcon } from './icons/RulerIcon.tsx';

// --- Internal Component for Room Dimensions ---
const RoomDimensions: React.FC<{ dimensions: RoomDimension[] }> = ({ dimensions }) => {
    if (!dimensions || dimensions.length === 0) {
        return (
             <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-center text-center">
                <p className="text-sm text-slate-500">Dimensionamento dos ambientes não disponível.</p>
             </div>
        );
    }
  
    return (
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 aspect-square flex flex-col">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
          <RulerIcon className="w-5 h-5 mr-2 text-blue-600" />
          Dimensionamento (Unidade)
        </h3>
        <ul className="space-y-2 flex-grow">
          {dimensions.map((dim, index) => (
            <li key={index} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-200 last:border-b-0">
              <span className="text-slate-600">{dim.name}</span>
              <span className="font-semibold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                {dim.area.toFixed(1).replace('.', ',')} m²
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
};

interface ProposalSectionProps {
  proposalText: string;
  onTextChange: (newText: string | null) => void;
  projectImage: string | null;
  planViewImage: string | null;
  interiorKitchenImage: string | null;
  interiorLivingImage: string | null;
  onRegenerateImage: () => void;
  isGeneratingImage: boolean;
  financials: any; // Simplified type for financials object
}

const ProposalSection: React.FC<ProposalSectionProps> = ({ 
    proposalText, onTextChange, 
    projectImage, planViewImage,
    interiorKitchenImage, interiorLivingImage,
    onRegenerateImage, isGeneratingImage, financials 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(proposalText);
  const isMultiUnit = financials.projectDetails.numberOfUnits > 1;

  useEffect(() => {
    if (!isEditing) {
      setEditText(proposalText);
    }
  }, [proposalText, isEditing]);

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
  
  const proposalParts = proposalText.split('[TABELA_BDI_ROI_PLACEHOLDER]');
  
  const ImageDisplay: React.FC<{src: string | null, alt: string, label: string, onRegen?: () => void, aspectRatio?: string}> = ({ src, alt, label, onRegen, aspectRatio = 'aspect-video' }) => (
    <div className={`relative rounded-lg overflow-hidden border border-slate-200 group flex items-center justify-center bg-slate-100 ${aspectRatio}`}>
        {isGeneratingImage && !src ? (
             <div className="text-center p-4">
                <LoadingSpinner size="md" />
                <p className="text-sm text-slate-500 mt-2">{label}...</p>
            </div>
        ) : src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
            <p className="text-sm text-slate-500 p-4">{alt} indisponível</p>
        )}
        {onRegen && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                    onClick={onRegen} 
                    disabled={isGeneratingImage}
                    className="inline-flex items-center px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-blue-500 disabled:bg-slate-200/80 disabled:cursor-not-allowed transition-all"
                >
                    {isGeneratingImage ? (
                        <><RefreshCwIcon className="w-5 h-5 mr-2 animate-spin" /> Gerando...</>
                    ) : (
                        <><RefreshCwIcon className="w-5 h-5 mr-2" /> Nova Fachada</>
                    )}
                </button>
            </div>
        )}
         <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-tr-lg">
            {alt}
        </div>
    </div>
  );


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Proposta Comercial e Ilustrações</h2>
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

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="lg:col-span-2">
                 <ImageDisplay 
                    src={projectImage} 
                    alt={isMultiUnit ? "Vista do Condomínio" : "Fachada Externa"} 
                    label={isMultiUnit ? "Gerando vista do condomínio" : "Gerando fachada do projeto"} 
                    onRegen={onRegenerateImage} 
                />
            </div>
            <ImageDisplay 
                src={interiorKitchenImage} 
                alt="Cozinha (Unidade)" 
                label="Gerando visualização da cozinha" 
            />
            <ImageDisplay 
                src={interiorLivingImage} 
                alt="Sala de Estar (Unidade)" 
                label="Gerando visualização da sala" 
            />
            <ImageDisplay 
                src={planViewImage} 
                alt="Planta Baixa (Unidade)" 
                label="Gerando planta baixa da unidade" 
                aspectRatio="aspect-square" 
            />
            <RoomDimensions dimensions={financials.projectDetails.roomDimensions || []} />
       </div>
      
      {isEditing ? (
        <div>
          <p className="text-slate-600 mb-4 text-sm">
            Ajuste o texto da proposta abaixo. As alterações serão refletidas no PDF final.
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
         <div>
            <p className="text-slate-600 mb-6 text-sm">
                Abaixo está um rascunho da proposta comercial gerado pela IA. Clique em "Editar" para fazer ajustes. Os valores são atualizados dinamicamente ao alterar a margem de lucro.
            </p>
            <div className="p-4 md:p-6 border border-slate-200 rounded-md bg-slate-50/50">
                <FormattedTextViewer text={proposalParts[0]} />
                {proposalParts.length > 1 && financials && (
                    <>
                        <div className="my-6">
                            <FinancialAnalysisSection financials={financials} />
                        </div>
                        <FormattedTextViewer text={proposalParts[1]} />
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ProposalSection;