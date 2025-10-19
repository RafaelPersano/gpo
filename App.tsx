
import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './services/supabaseClient.ts';
import * as db from './services/supabaseService.ts';
import * as XLSX from 'xlsx';

import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Sidebar from './components/Sidebar.tsx';
import InputSection from './components/InputSection.tsx';
import PlanTable from './components/PlanTable.tsx';
import BudgetSection from './components/BudgetSection.tsx';
import MaterialDeliverySchedule from './components/MaterialDeliverySchedule.tsx';
import PaymentSchedule from './components/PaymentSchedule.tsx';
import GanttChart from './components/GanttChart.tsx';
import AbcCurve from './components/AbcCurve.tsx';
import ProjectEvolutionChart from './components/ProjectEvolutionChart.tsx';
import ProposalSection from './components/ProposalSection.tsx';
import MarketingPage from './components/MarketingPage.tsx';
import BdiCalculator from './components/BdiCalculator.tsx';
import UnitCostCalculator from './components/UnitCostCalculator.tsx';
import CostBreakdownCalculator from './components/CostBreakdownCalculator.tsx';
import DownloadEngineeringPdfButton from './components/DownloadEngineeringPdfButton.tsx';
import DownloadInvestorPdfButton from './components/DownloadInvestorPdfButton.tsx';
import MarketingSection from './components/MarketingSection.tsx';
import Login from './components/Login.tsx';
import GenerationProgress from './components/GenerationProgress.tsx';
import PricingModal from './components/PricingModal.tsx';
import PricingSection from './components/PricingSection.tsx';
import FinancialAnalysisSection from './components/FinancialAnalysisSection.tsx';
import ProjectManager from './components/ProjectManager.tsx';
import InvestmentMatrix from './components/InvestmentMatrix.tsx';
// FIX: Changed import from TaxAnalysisCivil to TaxSection and updated file path.
import TaxSection from './components/TaxSection.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ConfigurationErrorModal from './components/ConfigurationErrorModal.tsx';
import Spreadsheet from './components/Spreadsheet.tsx';
import ExcelGenerator from './components/ExcelGenerator.tsx';


import { generateFullProjectReport, generateProjectImages } from './services/geminiService.ts';
import type { ConstructionPlan, MarketingMaterials, ConstructionTask, Tab } from './types.ts';

import { SpreadsheetIcon } from './components/icons/SpreadsheetIcon.tsx';
import { CogIcon } from './components/icons/CogIcon.tsx';
import { DollarSignIcon } from './components/icons/DollarSignIcon.tsx';
import { WandIcon } from './components/icons/WandIcon.tsx';


interface StampData {
  projectName: string;
  budgetString: string;
  costString: string;
  salePriceString: string;
  profitString: string;
  roiString: string;
  ebitdaString: string;
}

type ProjectImages = Record<string, string>;

interface UserProfileInfo {
  fullName: string | null;
  email: string | null;
}

const PROGRESS_STEPS = [
  'Analisando a descrição do projeto...',
  'Gerando o cronograma de tarefas detalhado...',
  'Calculando a distribuição do orçamento...',
  'Elaborando a proposta comercial e financeira...',
  'Criando o kit de marketing e a imagem do projeto...',
  'Salvando projeto no banco de dados...',
  'Finalizando os relatórios completos...'
];

const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Ocorreu um erro inesperado. Verifique o console para mais detalhes.';
};

const createInitialSpreadsheetData = (): string[][] => {
    const initialData: string[][] = Array(50).fill(null).map(() => Array(15).fill(''));
    initialData[0] = [
      'Etapa', 'Descrição da Tarefa', 'Unidade', 'Quantidade', 'Custo Unitário', 'Custo Total',
      'Data de Início', 'Data de Término', 'Responsável', 'Status', 'Notas', '', '', '', ''
    ];
    initialData[1] = [
      '1.1', 'Limpeza do Terreno', 'm²', '250', '5.00', '1250.00',
      '2024-08-01', '2024-08-03', 'Equipe A', 'Não Iniciado', 'Verificar necessidade de remoção de árvores.', '', '', '', ''
    ];
    return initialData;
};

const transformPlanToSpreadsheetData = (plan: ConstructionPlan): string[][] => {
    const data: string[][] = [];
    const formatCurrency = (value: number) => String(value?.toFixed(2) || '0.00').replace('.', ',');

    data.push(['Plano de Obra - Gerado por GPO.ai', '', '', '', '', '', '', '', '']);
    data.push(['Data de Início Geral:', plan.projectStartDate, '', 'Data de Término Geral:', plan.projectEndDate]);
    data.push([]);

    data.push(['RESUMO DO ORÇAMENTO', '']);
    data.push(['Verba Total', `R$ ${formatCurrency(plan.budget.total)}`]);
    data.push(['Custo de Materiais', `R$ ${formatCurrency(plan.budget.materials)}`]);
    data.push(['Custo de Mão de Obra', `R$ ${formatCurrency(plan.budget.labor)}`]);
    data.push(['Taxa do Gestor', `R$ ${formatCurrency(plan.budget.managerFee)}`]);
    data.push([]);

    data.push(['CRONOGRAMA DE TAREFAS']);
    data.push(['ID', 'Fase', 'Tarefa', 'Descrição', 'Início', 'Término', 'Status', 'Custo Material', 'Custo Mão de Obra', 'Custo Total']);
    plan.tasks.forEach(task => {
        data.push([
            String(task.id),
            task.phase,
            task.taskName,
            task.description,
            task.startDate,
            task.endDate,
            task.status,
            `R$ ${formatCurrency(task.costMaterials)}`,
            `R$ ${formatCurrency(task.costLabor)}`,
            `R$ ${formatCurrency(task.costMaterials + task.costLabor)}`
        ]);
    });
    data.push([]);

    data.push(['ENTREGA DE MATERIAIS']);
    data.push(['ID', 'Material', 'Fornecedor', 'Data de Entrega', 'Status', 'ID Tarefa Rel.']);
    plan.materialDeliveries.forEach(item => {
        data.push([
            String(item.id),
            item.materialName,
            item.supplier,
            item.deliveryDate,
            item.status,
            String(item.relatedTaskId)
        ]);
    });
    data.push([]);

    data.push(['CRONOGRAMA DE PAGAMENTOS']);
    data.push(['ID', 'Descrição', 'Vencimento', 'Categoria', 'Status', 'Valor']);
    plan.paymentSchedule.forEach(item => {
        data.push([
            String(item.id),
            item.description,
            item.dueDate,
            item.category,
            item.status,
            `R$ ${formatCurrency(item.amount)}`
        ]);
    });

    const maxCols = Math.max(...data.map(row => row.length), 10);
    return data.map(row => row.concat(Array(maxCols - row.length).fill('')));
};


const App: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [userProfileInfo, setUserProfileInfo] = useState<UserProfileInfo>({ fullName: null, email: null });
  const isAuthenticated = !!session;
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [userInput, setUserInput] = useState('');
  const [clientName, setClientName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [projectManagerFee, setProjectManagerFee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responsibleProfessional, setResponsibleProfessional] = useState('');
  const [payMaterialsWithCard, setPayMaterialsWithCard] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigErrorModal, setShowConfigErrorModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const [projectPlan, setProjectPlan] = useState<ConstructionPlan | null>(null);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);
  const [marketingMaterials, setMarketingMaterials] = useState<MarketingMaterials | null>(null);
  
  const [netProfitMargin, setNetProfitMargin] = useState(22);
  const [baseProjectImages, setBaseProjectImages] = useState<ProjectImages | null>(null);
  const [stampedProjectImages, setStampedProjectImages] = useState<ProjectImages | null>(null);
  
  const [originalProposalText, setOriginalProposalText] = useState<string | null>(null);
  const [editedProposalText, setEditedProposalText] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<string[][]>(createInitialSpreadsheetData());

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [initialView, setInitialView] = useState<'create' | 'excel'>('excel');

  const [bdiIndirectCosts, setBdiIndirectCosts] = useState({
    admin: '2', insurance: '1', guarantee: '0.5', risk: '1.5',
  });
  const [bdiTaxes, setBdiTaxes] = useState({
    irpj: '1.2', csll: '1.08', pis: '0.65', cofins: '3', iss: '5', inss: '4.5',
  });
  
  const handleApiError = (error: unknown, context: string) => {
    const errorMessage = getErrorMessage(error);
    const lowerMessage = errorMessage.toLowerCase();
    const isConfigError = 
        lowerMessage.includes('recursão infinita') || 
        lowerMessage.includes('infinite recursion') ||
        lowerMessage.includes('função de segurança') ||
        lowerMessage.includes('could not find function') ||
        lowerMessage.includes('schema cache') ||
        lowerMessage.includes('does not exist');

    if (isConfigError) {
        setShowConfigErrorModal(true);
    } else {
        setError(errorMessage);
    }
    console.error(`Erro ${context}:`, error);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchUserProfile = async () => {
        try {
            const profile = await db.fetchUserProfile();
            setUserRole(profile?.role || 'user');
            setTokenBalance(profile?.token_balance ?? 0);
            setUserProfileInfo({
                fullName: profile?.full_name || null,
                email: profile?.email || null
            });
        } catch (error) {
            handleApiError(error, 'ao buscar perfil do usuário');
            setUserRole('user');
            setTokenBalance(0);
            setUserProfileInfo({ fullName: null, email: null });
        }
    };
    
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
            setShowApp(true);
            fetchUserProfile();
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
            setShowApp(true);
            fetchUserProfile();
        } else {
            setUserRole(null);
            setTokenBalance(null);
            setUserProfileInfo({ fullName: null, email: null });
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isSupabaseConfigured) {
        fetchProjects();
    } else {
        setProjects([]);
        resetStateToNewProject();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isLoading && currentStepIndex < PROGRESS_STEPS.length - 1) {
        const intervalDuration = 2500;
        interval = window.setInterval(() => {
            setCurrentStepIndex((prevIndex) => {
                if (prevIndex < PROGRESS_STEPS.length - 1) {
                    return prevIndex + 1;
                }
                clearInterval(interval);
                return prevIndex;
            });
        }, intervalDuration);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isLoading, currentStepIndex]);
  
  useEffect(() => {
    if (projectPlan) {
        setSpreadsheetData(transformPlanToSpreadsheetData(projectPlan));
    } else {
        setSpreadsheetData(createInitialSpreadsheetData());
    }
  }, [projectPlan]);

  const addStampAndLogoToImage = (base64Image: string, stampData: StampData | null): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            
            ctx.drawImage(img, 0, 0);

            if (stampData) {
                const padding = canvas.width * 0.02;
                const stampWidth = canvas.width * 0.35;
                const lineHeight = canvas.width * 0.015;
                const stampHeight = (lineHeight * 1.6) * 8;
                const stampX = padding;
                const stampY = padding;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(stampX, stampY, stampWidth, stampHeight);
                
                let currentY = stampY + padding / 2;
                
                ctx.font = `bold ${lineHeight * 1.1}px Inter, sans-serif`;
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.fillText(stampData.projectName, stampX + padding/2, currentY);
                currentY += lineHeight * 2;
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(stampX + padding/2, currentY - lineHeight * 0.5);
                ctx.lineTo(stampX + stampWidth - padding/2, currentY - lineHeight * 0.5);
                ctx.stroke();

                const drawLine = (label: string, value: string) => {
                    ctx.font = `normal ${lineHeight * 0.9}px Inter, sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(label, stampX + padding/2, currentY);

                    ctx.font = `bold ${lineHeight * 0.9}px Inter, sans-serif`;
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'right';
                    ctx.fillText(value, stampX + stampWidth - padding/2, currentY);
                    
                    ctx.textAlign = 'left';
                    currentY += lineHeight * 1.6;
                };

                drawLine('Verba:', stampData.budgetString);
                drawLine('Custo Direto:', stampData.costString);
                drawLine('Preço de Venda:', stampData.salePriceString);
                drawLine('Lucro Líquido (Est.):', stampData.profitString);
                drawLine('ROI (Retorno):', stampData.roiString);
                drawLine('EBITDA (Lucro Op.):', stampData.ebitdaString);
            }

            ctx.font = `bold ${canvas.width * 0.05}px Inter, sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            const logoPadding = canvas.width * 0.02;
            const gpoText = 'GPO';
            const dotText = '.';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(gpoText, canvas.width - logoPadding - ctx.measureText(dotText).width + 1, canvas.height - logoPadding + 1);
            ctx.fillText(dotText, canvas.width - logoPadding + 1, canvas.height - logoPadding + 1);
            ctx.fillStyle = 'white';
            ctx.fillText(gpoText, canvas.width - logoPadding - ctx.measureText(dotText).width, canvas.height - logoPadding);
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(dotText, canvas.width - logoPadding, canvas.height - logoPadding);

            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (err) => reject(err);
    });
  };

  const fetchProjects = async () => {
    try {
        const userProjects = await db.fetchProjects();
        setProjects(userProjects || []);
    } catch (err) {
        handleApiError(err, 'ao buscar projetos');
    }
  };

  const resetStateToNewProject = () => {
      setSelectedProjectId(null);
      setUserInput('');
      setClientName('');
      setTotalBudget('');
      setProjectManagerFee('');
      setStartDate('');
      setEndDate('');
      setResponsibleProfessional('');
      setPayMaterialsWithCard(false);
      setProjectPlan(null);
      setOriginalProposalText(null);
      setEditedProposalText(null);
      setProjectSummary(null);
      setMarketingMaterials(null);
      setBaseProjectImages(null);
      setStampedProjectImages(null);
      setNetProfitMargin(22);
      setError(null);
      setSpreadsheetData(createInitialSpreadsheetData());
      setActiveTab('overview');
  };

  const handleNewProject = () => {
      resetStateToNewProject();
  };

  const handleSelectProject = async (projectId: number) => {
      setIsLoading(true);
      setError(null);
      try {
          const { projectData, plan, marketingMaterials, projectSummary, proposalText } = await db.fetchFullProject(projectId);
          
          resetStateToNewProject();

          setSelectedProjectId(projectData.id);
          setUserInput(projectData.user_input);
          setClientName(projectData.client_name || '');
          setTotalBudget(String(projectData.total_budget_input || ''));
          setStartDate(projectData.start_date_input ? new Date(projectData.start_date_input).toISOString().split('T')[0] : '');
          setEndDate(projectData.end_date_input ? new Date(projectData.end_date_input).toISOString().split('T')[0] : '');
          setResponsibleProfessional(projectData.responsible_professional || '');
          
          setProjectPlan(plan);
          setOriginalProposalText(proposalText);
          setEditedProposalText(null);
          setProjectSummary(projectSummary);
          setMarketingMaterials(marketingMaterials);
          
          if (projectSummary) {
              setIsGeneratingImage(true);
              generateProjectImages(projectSummary)
                  .then(baseImages => {
                      setBaseProjectImages(baseImages);
                  })
                  .catch(err => {
                      console.warn("Image generation failed", err);
                  })
                  .finally(() => setIsGeneratingImage(false));
          }
          setActiveTab('overview');
          
      } catch (err) {
          handleApiError(err, 'ao carregar projeto');
          resetStateToNewProject(); 
      } finally {
          setIsLoading(false);
      }
  };

  const handleGenerate = async () => {
    if (isSupabaseConfigured && tokenBalance !== null && tokenBalance <= 0) {
        setError('Você não tem tokens suficientes para gerar um novo projeto. Por favor, escolha um plano para continuar.');
        setShowPricingModal(true);
        return;
    }

    setIsLoading(true);
    setCurrentStepIndex(0);
    setError(null);
    setProjectPlan(null);
    setOriginalProposalText(null);
    setEditedProposalText(null);
    setProjectSummary(null);
    setMarketingMaterials(null);
    setBaseProjectImages(null);
    setStampedProjectImages(null);
    setNetProfitMargin(22);
    setActiveTab('overview');

    try {
      if (isSupabaseConfigured) {
        const newBalance = await db.decrementToken();
        setTokenBalance(newBalance);
      }

      const budget = parseFloat(totalBudget);
      if (isNaN(budget) || budget <= 0) throw new Error("Por favor, insira uma verba total válida.");
      const fee = projectManagerFee ? parseFloat(projectManagerFee) : null;
      if (fee !== null && (isNaN(fee) || fee < 0)) throw new Error("A taxa do gestor, se informada, deve ser um número válido.");
      
      const report = await generateFullProjectReport(
        userInput, budget, fee, startDate, endDate, payMaterialsWithCard, responsibleProfessional, clientName
      );
      
      setProjectPlan(report.plan);
      setOriginalProposalText(report.proposalText);
      setProjectSummary(report.projectSummary);
      setMarketingMaterials(report.marketingMaterials);
      
      if (isSupabaseConfigured) {
        setCurrentStepIndex(5);
        const projectInputs = {
            userInput, clientName, totalBudget: budget, startDate, endDate, responsibleProfessional
        };
        const newProject = await db.saveFullProject(
            projectInputs, report.plan, report.projectSummary, report.proposalText, report.marketingMaterials
        );
        
        await fetchProjects();
        setSelectedProjectId(newProject.id);
      }

      setIsGeneratingImage(true);
      generateProjectImages(report.projectSummary)
        .then(baseImages => {
            setBaseProjectImages(baseImages);
        })
        .catch(err => {
          console.warn("Image generation failed", err);
        })
        .finally(() => setIsGeneratingImage(false));

    } catch (err) {
      handleApiError(err, 'ao gerar plano');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePurchasePlan = async (tokensToAdd: number) => {
    try {
        const newBalance = await db.addTokens(tokensToAdd);
        setTokenBalance(newBalance);
        setShowPricingModal(false);
        setError(null);
    } catch (err) {
        handleApiError(err, 'ao adicionar tokens');
    }
  };

  const handleRegenerateImage = async () => {
      if (!projectSummary) return;
      setIsGeneratingImage(true);
      try {
          const newBaseImages = await generateProjectImages(projectSummary);
          setBaseProjectImages(newBaseImages);
      } catch (err) {
          console.warn("Image regeneration failed", err);
          setError("Falha ao gerar nova imagem.");
      } finally {
          setIsGeneratingImage(false);
      }
  };
  
  const directCost = useMemo(() => {
    if (!projectPlan) return 0;
    return projectPlan.tasks.reduce((sum, task) => sum + task.costMaterials + task.costLabor, 0);
  }, [projectPlan]);

  const projectDurationInDays = useMemo(() => {
    if (!projectPlan?.projectStartDate || !projectPlan?.projectEndDate) return 0;
    const start = new Date(projectPlan.projectStartDate + 'T00:00:00');
    const end = new Date(projectPlan.projectEndDate + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  }, [projectPlan]);

  const financials = useMemo(() => {
    if (!projectPlan) return null;

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
        grossMarginValue,
        indirectCostsValue,
        taxesOnRevenueValue,
        netProfitValue,
        bdiRate: bdiRate * 100,
        ebitda,
        roi,
        budgetString: formatCurrency(projectPlan.budget.total),
        costString: formatCurrency(directCostCalc),
        salePriceString: formatCurrency(finalPrice),
        profitString: formatCurrency(netProfitValue),
        roiString: `${roi.toFixed(1)}%`,
        ebitdaString: formatCurrency(ebitda),
        projectName: marketingMaterials?.commercialNames[0] || 'Projeto de Construção',
        bdiBreakdown: {
          indirectCosts: bdiIndirectCosts,
          taxes: bdiTaxes,
          netProfit: netProfitMargin.toString()
        }
    };
  }, [projectPlan, netProfitMargin, marketingMaterials, directCost, bdiIndirectCosts, bdiTaxes]);

  useEffect(() => {
    if (baseProjectImages && baseProjectImages.facade && financials) {
        const stampDataForImage: StampData = {
            projectName: financials.projectName,
            budgetString: financials.budgetString,
            costString: financials.costString,
            salePriceString: financials.salePriceString,
            profitString: financials.profitString,
            roiString: financials.roiString,
            ebitdaString: financials.ebitdaString,
        };
        addStampAndLogoToImage(baseProjectImages.facade, stampDataForImage)
            .then(stampedFacade => {
                setStampedProjectImages({ ...baseProjectImages, facade: stampedFacade });
            })
            .catch(err => {
                console.warn("Failed to add stamp to image", err);
                setStampedProjectImages(baseProjectImages);
            });
    } else if (baseProjectImages) {
        setStampedProjectImages(baseProjectImages);
    }
  }, [baseProjectImages, financials]);

  const updateProposalWithNewPricing = (template: string | null, newFinancials: typeof financials, plan: ConstructionPlan | null): string => {
    if (!template || !newFinancials || !plan) return template || '';

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const newBudgetSummary = `O valor total do investimento para este projeto é de ${formatCurrency(newFinancials.finalPrice)}. Este valor contempla os seguintes custos: Custo de Materiais (${formatCurrency(plan.budget.materials)}), Custo de Mão de Obra (${formatCurrency(plan.budget.labor)}) e Taxa de Gestão (${formatCurrency(plan.budget.managerFee)}).`;
    
    const regex = /(Resumo do Orçamento\n\n)(?:[\s\S]*?)(?=\n\nAnálise Financeira e BDI|\n\nPróximos Passos|\n\nEncerramento)/;

    if (regex.test(template)) {
        return template.replace(regex, `$1${newBudgetSummary}`);
    }

    return template;
  };
  
  const displayProposalText = useMemo(() => {
    if (editedProposalText !== null) {
        return editedProposalText;
    }
    return updateProposalWithNewPricing(originalProposalText, financials, projectPlan);
  }, [originalProposalText, editedProposalText, financials, projectPlan]);
  
  const handleNetProfitMarginChange = (newMargin: number) => {
    if (editedProposalText !== null) {
        if (window.confirm('Alterar a margem de lucro irá redefinir as edições manuais feitas na proposta. Deseja continuar?')) {
            setEditedProposalText(null);
        } else {
            return;
        }
    }
    setNetProfitMargin(newMargin);
  };

  const handleTaskUpdate = async (updatedTask: ConstructionTask) => {
    if (projectPlan) {
        const originalTasks = [...projectPlan.tasks];
        const updatedTasks = projectPlan.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        setProjectPlan({ ...projectPlan, tasks: updatedTasks });
        
        try {
            if (isSupabaseConfigured) {
              await db.updateTask(updatedTask);
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(`Falha ao salvar a alteração da tarefa: ${errorMessage}. A alteração foi desfeita.`);
            setProjectPlan({ ...projectPlan, tasks: originalTasks });
        }
    }
  };

  const handleExportToCsv = () => {
    if (!projectPlan || !financials) return;

    const wb = XLSX.utils.book_new();

    const tasksData = projectPlan.tasks.map(task => ({
        'ID': task.id, 'Fase': task.phase, 'Nome da Tarefa': task.taskName, 'Descrição': task.description, 'Responsável': task.assignee, 'Data de Início': task.startDate, 'Data de Término': task.endDate, 'Status': task.status, 'Dependências': task.dependencies, 'Custo Materiais (R$)': task.costMaterials, 'Custo Mão de Obra (R$)': task.costLabor, 'Custo Total (R$)': task.costMaterials + task.costLabor, 'Notas': task.notes,
    }));
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    wsTasks['!cols'] = Object.keys(tasksData[0] || {}).map(key => ({ wch: Math.max(key.length, ...tasksData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2 }));
    XLSX.utils.book_append_sheet(wb, wsTasks, 'Plano de Tarefas');
    
    const budgetData = [['Categoria', 'Valor (R$)'], ['Verba Total', projectPlan.budget.total], ['Custo de Materiais', projectPlan.budget.materials], ['Custo de Mão de Obra', projectPlan.budget.labor], ['Taxa do Gestor', projectPlan.budget.managerFee]];
    const wsBudget = XLSX.utils.aoa_to_sheet(budgetData);
    wsBudget['!cols'] = [{wch: 20}, {wch: 20}];
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Resumo do Orçamento');

    const materialsData = projectPlan.materialDeliveries.map(item => ({
        'ID': item.id, 'Material': item.materialName, 'Fornecedor': item.supplier, 'Data de Entrega': item.deliveryDate, 'ID Tarefa Relacionada': item.relatedTaskId, 'Status': item.status,
    }));
    if (materialsData.length > 0) {
        const wsMaterials = XLSX.utils.json_to_sheet(materialsData);
        wsMaterials['!cols'] = Object.keys(materialsData[0] || {}).map(key => ({ wch: Math.max(key.length, ...materialsData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2 }));
        XLSX.utils.book_append_sheet(wb, wsMaterials, 'Entrega de Materiais');
    }

    const paymentsData = projectPlan.paymentSchedule.map(item => ({
        'ID': item.id, 'Descrição': item.description, 'Vencimento': item.dueDate, 'Categoria': item.category, 'Status': item.status, 'Valor (R$)': item.amount,
    }));
    if (paymentsData.length > 0) {
        const wsPayments = XLSX.utils.json_to_sheet(paymentsData);
        wsPayments['!cols'] = Object.keys(paymentsData[0] || {}).map(key => ({ wch: Math.max(key.length, ...paymentsData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2 }));
        XLSX.utils.book_append_sheet(wb, wsPayments, 'Cronograma de Pagamentos');
    }

    const financialsData = [
        ['Métrica', 'Valor'], ['Custo Direto Total', financials.directCost], ['Taxa BDI Aplicada (%)', financials.bdiRate], ['Preço Final de Venda', financials.finalPrice], ['Lucro Bruto', financials.grossMarginValue], ['Despesas Indiretas', financials.indirectCostsValue], ['EBITDA (Lucro Operacional)', financials.ebitda], ['Impostos sobre Faturamento', financials.taxesOnRevenueValue], ['Lucro Líquido Estimado', financials.netProfitValue], ['ROI (Retorno sobre Investimento) (%)', financials.roi],
    ];
    const wsFinancials = XLSX.utils.aoa_to_sheet(financialsData);
    wsFinancials['!cols'] = [{wch: 35}, {wch: 20}];
    XLSX.utils.book_append_sheet(wb, wsFinancials, 'Análise Financeira');

    const bdiData: (string | number)[][] = [['Tipo', 'Componente', 'Valor (%)']];
    Object.entries(financials.bdiBreakdown.indirectCosts).forEach(([key, value]) => bdiData.push(['Custo Indireto', key, String(value)]));
    Object.entries(financials.bdiBreakdown.taxes).forEach(([key, value]) => bdiData.push(['Imposto', key, String(value)]));
    bdiData.push(['Margem', 'Lucro Líquido', financials.bdiBreakdown.netProfit]);
    const wsBdi = XLSX.utils.aoa_to_sheet(bdiData);
    wsBdi['!cols'] = [{wch: 20}, {wch: 25}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, wsBdi, 'Composição do BDI');

    XLSX.writeFile(wb, 'plano_de_obra_completo.xlsx');
};
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
    setShowApp(false);
    setIsGuest(false);
    setUserRole(null);
  };

  const handleGoToApp = () => {
      setShowApp(true);
  }

  const handleGoToHome = () => {
      setShowApp(false);
      setIsGuest(false);
      handleNewProject();
  }

  const handleEnterDemoMode = () => {
    setIsGuest(true);
    setShowApp(true);
  };
  
  const renderContent = () => {
    if (!showApp) {
        return <MarketingPage onStart={handleGoToApp} isBackendConfigured={isSupabaseConfigured} />;
    }

    if (isAuthenticated || isGuest) {
        return (
            <div className="flex flex-row">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
                <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen">
                    {isSupabaseConfigured && isAuthenticated && (
                        <ProjectManager
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onSelectProject={handleSelectProject}
                            onNewProject={handleNewProject}
                        />
                    )}

                    {isLoading && (
                      <div className="text-center p-12">
                          <GenerationProgress steps={PROGRESS_STEPS} currentStepIndex={currentStepIndex} />
                      </div>
                    )}
                    
                    {error && <div className="container mx-auto mt-8 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-center max-w-4xl">{error}</div>}

                    {!isLoading && !error && (
                        <>
                            {projectPlan && financials ? (
                                // --- STATE 1: PROJECT IS LOADED ---
                                <div id="results" className="max-w-7xl mx-auto space-y-8">
                                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-xl">
                                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{marketingMaterials?.commercialNames[0] || 'Detalhes do Projeto'}</h2>
                                                {isGeneratingImage && <p className="text-sm text-slate-500 animate-pulse mt-1">Gerando imagens do projeto...</p>}
                                            </div>
                                            <div className="flex items-center flex-wrap gap-3">
                                                <button onClick={handleExportToCsv} className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700"><SpreadsheetIcon className="w-5 h-5 mr-2" />Planilha (Excel)</button>
                                                <DownloadEngineeringPdfButton projectPlan={projectPlan} icon={<CogIcon className="w-5 h-5 mr-2" />} />
                                                <DownloadInvestorPdfButton projectPlan={projectPlan} financials={financials} proposalText={displayProposalText} projectImages={stampedProjectImages} responsibleProfessional={responsibleProfessional} clientName={clientName} icon={<DollarSignIcon className="w-5 h-5 mr-2" />} projectDurationInDays={projectDurationInDays} />
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {activeTab === 'overview' && (<>
                                                <BudgetSection budget={projectPlan.budget} tasks={projectPlan.tasks} />
                                                <PricingSection financials={financials} netProfitMargin={netProfitMargin} onMarginChange={handleNetProfitMarginChange} />
                                                <GanttChart tasks={projectPlan.tasks} />
                                                <ProjectEvolutionChart tasks={projectPlan.tasks} projectStartDate={projectPlan.projectStartDate} projectEndDate={projectPlan.projectEndDate} />
                                            </>)}
                                            {activeTab === 'proposal' && marketingMaterials && (<>
                                                <ProposalSection proposalText={displayProposalText} onTextChange={setEditedProposalText} projectImages={stampedProjectImages} onRegenerateImage={handleRegenerateImage} isGeneratingImage={isGeneratingImage} financials={financials} projectPlan={projectPlan} projectDurationInDays={projectDurationInDays} />
                                                <MarketingSection materials={marketingMaterials} projectImages={stampedProjectImages} />
                                            </>)}
                                            {activeTab === 'tables' && (<div className="space-y-12">
                                                <PlanTable tasks={projectPlan.tasks} onTaskUpdate={handleTaskUpdate} />
                                                <MaterialDeliverySchedule deliveries={projectPlan.materialDeliveries} />
                                                <PaymentSchedule schedule={projectPlan.paymentSchedule} />
                                            </div>)}
                                            {activeTab === 'analysis' && (<div className="space-y-12">
                                                <FinancialAnalysisSection financials={financials} />
                                                <InvestmentMatrix financials={financials} projectDurationInDays={projectDurationInDays} />
                                                <TaxSection financials={financials} projectPlan={projectPlan} />
                                                <AbcCurve tasks={projectPlan.tasks} />
                                                <BdiCalculator directCost={directCost} indirectCosts={bdiIndirectCosts} setIndirectCosts={setBdiIndirectCosts} taxes={bdiTaxes} setTaxes={setBdiTaxes} profit={netProfitMargin} setProfit={handleNetProfitMarginChange} />
                                                <UnitCostCalculator />
                                                <CostBreakdownCalculator />
                                            </div>)}
                                            {activeTab === 'spreadsheet' && <Spreadsheet data={spreadsheetData} onDataChange={setSpreadsheetData} />}
                                            {activeTab === 'excel' && <ExcelGenerator />}
                                            {activeTab === 'admin' && userRole === 'admin' && <AdminPanel />}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // --- STATE 2: NO PROJECT LOADED (Initial View) ---
                                <div className="space-y-8">
                                     <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
                                        <div className="bg-white p-3 md:p-4 rounded-full border border-slate-200 shadow-lg flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-8">
                                            <button onClick={() => setInitialView('create')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${initialView === 'create' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}><WandIcon className="w-5 h-5"/><span className="ml-2">Criar Projeto</span></button>
                                            <button onClick={() => setInitialView('excel')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${initialView === 'excel' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}><SpreadsheetIcon className="w-5 h-5"/><span className="ml-2">Gerador Excel</span></button>
                                        </div>
                                        {initialView === 'excel' ? <ExcelGenerator /> : <InputSection userInput={userInput} onUserInputChange={(e) => setUserInput(e.target.value)} clientName={clientName} onClientNameChange={(e) => setClientName(e.target.value)} totalBudget={totalBudget} onTotalBudgetChange={(e) => setTotalBudget(e.target.value)} projectManagerFee={projectManagerFee} onProjectManagerFeeChange={(e) => setProjectManagerFee(e.target.value)} startDate={startDate} onStartDateChange={(e) => setStartDate(e.target.value)} endDate={endDate} onEndDateChange={(e) => setEndDate(e.target.value)} responsibleProfessional={responsibleProfessional} onResponsibleProfessionalChange={(e) => setResponsibleProfessional(e.target.value)} payMaterialsWithCard={payMaterialsWithCard} onPayMaterialsWithCardChange={(e) => setPayMaterialsWithCard(e.target.checked)} onGenerate={handleGenerate} isLoading={isLoading}/>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        );
    }
    
    return <Login onGoToHome={handleGoToHome} isBackendConfigured={isSupabaseConfigured} onEnterDemoMode={handleEnterDemoMode} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <ConfigurationErrorModal show={showConfigErrorModal} onClose={() => setShowConfigErrorModal(false)} />
      <PricingModal show={showPricingModal} onClose={() => setShowPricingModal(false)} onPurchasePlan={handlePurchasePlan} />
      <Header onStart={handleGoToApp} isAppView={showApp} isAuthenticated={isAuthenticated} onLogout={handleLogout} onGoToHome={handleGoToHome} tokenBalance={tokenBalance} userProfileInfo={userProfileInfo} userRole={userRole} isSupabaseConfigured={isSupabaseConfigured} onEnterDemoMode={handleEnterDemoMode} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      {!showApp && <Footer />}
    </div>
  );
};

export default App;
