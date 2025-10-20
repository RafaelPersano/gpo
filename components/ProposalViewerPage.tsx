import React, { useState, useEffect, useMemo } from 'react';
import * as db from '../services/supabaseService';
import { ConstructionPlan, MarketingMaterials } from '../types';

import LoadingSpinner from './LoadingSpinner';
import FormattedTextViewer from './FormattedTextViewer';
import FinancialAnalysisSection from './FinancialAnalysisSection';
import InvestmentMatrix from './InvestmentMatrix';
import TaxSection from './TaxSection';
import Footer from './Footer';

interface FullProject {
    projectData: any;
    plan: ConstructionPlan;
    marketingMaterials: MarketingMaterials;
    proposalText: string;
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error);
};

const ProposalViewerPage: React.FC<{ projectId: number }> = ({ projectId }) => {
    const [project, setProject] = useState<FullProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Esta lógica é duplicada do App.tsx para garantir cálculos financeiros consistentes.
    const directCost = useMemo(() => {
        if (!project?.plan) return 0;
        return project.plan.tasks.reduce((sum, task) => sum + task.costMaterials + task.costLabor, 0);
    }, [project]);

    const projectDurationInDays = useMemo(() => {
        if (!project?.plan?.projectStartDate || !project?.plan?.projectEndDate) return 0;
        const start = new Date(project.plan.projectStartDate + 'T00:00:00');
        const end = new Date(project.plan.projectEndDate + 'T00:00:00');
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, [project]);

    const financials = useMemo(() => {
        if (!project?.plan) return null;
        
        // Usando BDI/Impostos fixos para consistência, já que não são armazenados por projeto.
        const bdiIndirectCosts = { admin: '2', insurance: '1', guarantee: '0.5', risk: '1.5' };
        const bdiTaxes = { irpj: '1.2', csll: '1.08', pis: '0.65', cofins: '3', iss: '5', inss: '4.5' };
        const netProfitMargin = 22; // Margem padrão

        const directCostCalc = directCost;
        const parse = (val: string) => parseFloat(val) / 100 || 0;
        
        const totalIndirect = Object.values(bdiIndirectCosts).reduce<number>((sum, val) => sum + parse(String(val)), 0);
        const totalTaxesBDI = Object.values(bdiTaxes).reduce<number>((sum, val) => sum + parse(String(val)), 0);
        const profitMargin = netProfitMargin / 100;
        const denominator = 1 - (totalTaxesBDI + profitMargin);
        
        let finalPrice = 0;
        let bdiRate = 0;
        if (denominator > 0 && directCostCalc > 0) {
            bdiRate = (((1 + totalIndirect) / denominator) - 1);
            finalPrice = directCostCalc * (1 + bdiRate);
        }

        const grossMarginValue = finalPrice - directCostCalc;
        const indirectCostsValue = directCostCalc * totalIndirect;
        const ebitda = grossMarginValue - indirectCostsValue;
        const taxesOnRevenueValue = finalPrice * totalTaxesBDI;
        const netProfitValue = finalPrice * profitMargin;
        const roi = directCostCalc > 0 ? (netProfitValue / directCostCalc) * 100 : 0;
        
        const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

        return {
            directCost: directCostCalc,
            finalPrice,
            bdiRate: bdiRate * 100,
            grossMarginValue,
            indirectCostsValue,
            taxesOnRevenueValue,
            netProfitValue,
            ebitda,
            roi,
            salePriceString: formatCurrency(finalPrice),
            bdiBreakdown: {
              indirectCosts: bdiIndirectCosts,
              taxes: bdiTaxes,
              netProfit: netProfitMargin.toString()
            }
        };
    }, [project, directCost]);

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            setError(null);
            try {
                const fullProjectData = await db.fetchFullProject(projectId);
                setProject(fullProjectData as FullProject);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const renderProposalContent = () => {
      if (!project || !financials) return null;
      const { proposalText, plan } = project;
      const parts = proposalText.split(/(\[TABELA_BDI_ROI_PLACEHOLDER\]|\[MATRIZ_INVESTIMENTO_PLACEHOLDER\]|\[ANALISE_TRIBUTARIA_PLACEHOLDER\])/g);

      return parts.map((part, index) => {
          if (part === '[TABELA_BDI_ROI_PLACEHOLDER]') {
              return <div key={index} className="my-6"><FinancialAnalysisSection financials={financials} isForPdf /></div>;
          }
          if (part === '[MATRIZ_INVESTIMENTO_PLACEHOLDER]') {
              return <div key={index} className="my-6"><InvestmentMatrix financials={financials} projectDurationInDays={projectDurationInDays} isForPdf /></div>;
          }
           if (part === '[ANALISE_TRIBUTARIA_PLACEHOLDER]') {
              return <div key={index} className="my-6"><TaxSection financials={financials} projectPlan={plan} isForPdf /></div>;
          }
          return <FormattedTextViewer key={index} text={part} />;
      });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div></div>;
    }

    if (!project || !financials) {
        return <div className="flex justify-center items-center h-screen"><p>Projeto não encontrado.</p></div>;
    }

    const projectName = project.marketingMaterials?.commercialNames[0] || 'Projeto de Construção';
    const facadeImage = project.projectData?.marketing_materials?.stamped_facade_image;

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center py-4">
                        <a href="/" className="text-2xl font-bold text-slate-800 flex items-center">
                            GPO<span className="text-blue-500">.</span>
                        </a>
                        <span className="text-sm text-slate-500">Proposta Comercial</span>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    {facadeImage && (
                         <div className="w-full aspect-video bg-slate-200">
                             <img src={facadeImage} alt={`Visualização do ${projectName}`} className="w-full h-auto object-cover" />
                         </div>
                    )}
                     <div className="p-6 md:p-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                            {projectName}
                        </h1>
                        <p className="mt-2 text-slate-600">Proposta para: <strong>{project.projectData.client_name || 'Cliente'}</strong></p>
                        
                        <div className="mt-8 p-4 md:p-6 border-2 border-slate-200 rounded-lg bg-slate-50">
                            {renderProposalContent()}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProposalViewerPage;
