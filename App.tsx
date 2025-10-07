
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
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
import TaxSection from './components/TaxSection.tsx';
import BdiCalculator from './components/BdiCalculator.tsx';
import UnitCostCalculator from './components/UnitCostCalculator.tsx';
import CostBreakdownCalculator from './components/CostBreakdownCalculator.tsx';
import DownloadEngineeringPdfButton from './components/DownloadEngineeringPdfButton.tsx';
import DownloadInvestorPdfButton from './components/DownloadInvestorPdfButton.tsx';
import MarketingSection from './components/MarketingSection.tsx';
import Login from './components/Login.tsx';
import GenerationProgress from './components/GenerationProgress.tsx';
import FinancialScenariosSection from './components/FinancialScenariosSection.tsx';
import PricingSection from './components/PricingSection.tsx';
import FormattedTextViewer from './components/FormattedTextViewer.tsx';
import RoomDimensionsSection from './components/RoomDimensionsSection.tsx';


import { generateFullProjectReport, generateTechnicalDrawings } from './services/geminiService.ts';
import type { ConstructionPlan, MarketingMaterials, ProjectDetails } from './types.ts';

import { SpreadsheetIcon } from './components/icons/SpreadsheetIcon.tsx';
import { ChartIcon } from './components/icons/ChartIcon.tsx';
import { ProposalIcon } from './components/icons/ProposalIcon.tsx';
import { AbcIcon } from './components/icons/AbcIcon.tsx';
import { TasksIcon } from './components/icons/TasksIcon.tsx';
import { CalculatorIcon } from './components/icons/CalculatorIcon.tsx';
import { CogIcon } from './components/icons/CogIcon.tsx';
import { DollarSignIcon } from './components/icons/DollarSignIcon.tsx';


type Tab = 'overview' | 'proposal' | 'analysis' | 'tables' | 'calculators';

interface StampData {
  projectName: string;
  netProfitMarginString: string;
  bedrooms?: number;
  suites?: number;
  unitArea?: number;
  totalArea: number;
  timelineString: string;
  numberOfUnits?: number;
  unitType?: string;
}

const taxTiers = [
  { limit: 180000, rate: 0.045, deduction: 0 },
  { limit: 360000, rate: 0.09, deduction: 8100 },
  { limit: 720000, rate: 0.102, deduction: 12420 },
  { limit: 1800000, rate: 0.14, deduction: 39780 },
];

const PROGRESS_STEPS = [
  'Analisando a descrição do projeto...',
  'Gerando o cronograma de tarefas detalhado...',
  'Calculando a distribuição do orçamento...',
  'Elaborando a proposta comercial e financeira...',
  'Gerando a ilustração da fachada do projeto...',
  'Criando as visualizações internas do imóvel...',
  'Desenhando a planta baixa técnica...',
  'Finalizando os relatórios completos...'
];

const DescriptiveMemorial: React.FC<{ memorialText: string | null }> = ({ memorialText }) => {
    if (!memorialText) return null;
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Memorial Descritivo</h2>
        <div className="p-4 md:p-6 border border-slate-200 rounded-md bg-slate-50/50">
          <FormattedTextViewer text={memorialText} />
        </div>
      </div>
    );
};

const App: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App state
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
  
  const [projectPlan, setProjectPlan] = useState<ConstructionPlan | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);
  const [marketingMaterials, setMarketingMaterials] = useState<MarketingMaterials | null>(null);
  const [descriptiveMemorial, setDescriptiveMemorial] = useState<string | null>(null);
  
  const [netProfitMargin, setNetProfitMargin] = useState(22);
  const [baseProjectImage, setBaseProjectImage] = useState<string | null>(null);
  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [planViewImage, setPlanViewImage] = useState<string | null>(null);
  const [interiorKitchenImage, setInteriorKitchenImage] = useState<string | null>(null);
  const [interiorLivingImage, setInteriorLivingImage] = useState<string | null>(null);
  
  const [originalProposalText, setOriginalProposalText] = useState<string | null>(null);
  const [editedProposalText, setEditedProposalText] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  

const addStampAndLogoToImage = (base64Image: string, stampData: StampData | null): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0);

            // 1. Draw Stamp if data is available
            if (stampData) {
                const padding = canvas.width * 0.02;
                const lineHeight = canvas.width * 0.014;
                
                const details: string[] = [];
                if (stampData.numberOfUnits && stampData.numberOfUnits > 1 && stampData.unitType) {
                    const plural = stampData.numberOfUnits > 1 ? 's' : '';
                    details.push(`${stampData.numberOfUnits} ${stampData.unitType}${plural}`);
                }
                if(stampData.bedrooms) details.push(`${stampData.bedrooms} Quarto(s)`);
                if(stampData.suites) details.push(`${stampData.suites} Suíte(s)`);
                if(stampData.unitArea && stampData.unitArea !== stampData.totalArea) {
                    details.push(`${stampData.unitArea}m² / unid.`);
                }
                const descriptionLine = details.join(' | ');

                let lineCount = 3; // Base lines: Area, Prazo, Margem
                if (descriptionLine) {
                    lineCount++;
                }
                
                const stampHeight = (lineHeight * 1.5) * (lineCount + 1) + padding * 1.5; // +1 for project name title
                const stampWidth = canvas.width * 0.45;
                const stampX = padding;
                const stampY = padding;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(stampX, stampY, stampWidth, stampHeight);
                
                let currentY = stampY + padding / 2;
                
                ctx.font = `bold ${lineHeight * 1.1}px Inter, sans-serif`;
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.fillText(stampData.projectName, stampX + padding/2, currentY);
                currentY += lineHeight * 1.8;
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(stampX + padding/2, currentY - lineHeight * 0.5);
                ctx.lineTo(stampX + stampWidth - padding/2, currentY - lineHeight * 0.5);
                ctx.stroke();

                const drawLine = (label: string, value: string) => {
                    ctx.font = `normal ${lineHeight * 0.85}px Inter, sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(label, stampX + padding/2, currentY);

                    ctx.font = `bold ${lineHeight * 0.85}px Inter, sans-serif`;
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'right';
                    ctx.fillText(value, stampX + stampWidth - padding/2, currentY);
                    
                    ctx.textAlign = 'left';
                    currentY += lineHeight * 1.5;
                };
                
                if (descriptionLine) {
                    drawLine('Descrição:', descriptionLine);
                }
                drawLine('Área Total:', `${stampData.totalArea}m²`);
                drawLine('Prazo de Execução:', stampData.timelineString);
                drawLine('Margem Líquida:', stampData.netProfitMarginString);
            }

            // 2. Draw Logo
            ctx.font = `bold ${canvas.width * 0.05}px Inter, sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            const logoPadding = canvas.width * 0.02;

            const gpoText = 'GPO';
            const dotText = '.';
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Shadow
            ctx.fillText(gpoText, canvas.width - logoPadding - ctx.measureText(dotText).width + 1, canvas.height - logoPadding + 1);
            ctx.fillText(dotText, canvas.width - logoPadding + 1, canvas.height - logoPadding + 1);

            ctx.fillStyle = 'white'; // Main text
            ctx.fillText(gpoText, canvas.width - logoPadding - ctx.measureText(dotText).width, canvas.height - logoPadding);
            ctx.fillStyle = '#60a5fa'; // A light blue color for the dot
            ctx.fillText(dotText, canvas.width - logoPadding, canvas.height - logoPadding);

            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (err) => {
            reject(err);
        };
    });
};


  const handleGenerate = async () => {
    setIsLoading(true);
    setCurrentStepIndex(0);
    setIsGeneratingImage(false);
    setError(null);
    setProjectPlan(null);
    setProjectDetails(null);
    setOriginalProposalText(null);
    setEditedProposalText(null);
    setProjectSummary(null);
    setMarketingMaterials(null);
    setDescriptiveMemorial(null);
    setBaseProjectImage(null);
    setProjectImage(null);
    setPlanViewImage(null);
    setInteriorKitchenImage(null);
    setInteriorLivingImage(null);
    setNetProfitMargin(22);
    setActiveTab('overview');

    try {
      const budget = parseFloat(totalBudget);
      if (isNaN(budget) || budget <= 0) {
        throw new Error("Por favor, insira uma verba total válida.");
      }

      const fee = projectManagerFee ? parseFloat(projectManagerFee) : null;
      if (fee !== null && (isNaN(fee) || fee < 0)) {
        throw new Error("A taxa do gestor, se informada, deve ser um número válido.");
      }
      
      const handleProgressUpdate = (stepIndex: number) => {
        setCurrentStepIndex(stepIndex);
      };

      const report = await generateFullProjectReport(
        userInput, budget, fee, startDate, endDate, payMaterialsWithCard, responsibleProfessional, clientName,
        handleProgressUpdate
      );
      
      setProjectPlan(report.plan);
      setProjectDetails(report.projectDetails);
      setOriginalProposalText(report.proposalText);
      setProjectSummary(report.projectSummary);
      setMarketingMaterials(report.marketingMaterials);
      setDescriptiveMemorial(report.descriptiveMemorial);
      
      // Start all image generations
      setCurrentStepIndex(4); // "Gerando a ilustração da fachada do projeto..."
      setIsGeneratingImage(true);
      
      let drawingSummary = '';
        if (report.projectDetails.numberOfUnits > 1) {
            drawingSummary = `Um condomínio de ${report.projectDetails.numberOfUnits} ${report.projectDetails.unitType || 'unidades'} de ${report.projectDetails.unitArea}m² cada. Estilo ${report.projectDetails.style}.`;
        } else {
            drawingSummary = `Um projeto de ${report.projectDetails.totalArea}m² com ${report.projectDetails.bedrooms || ''} quartos e ${report.projectDetails.suites || ''} suítes. Foco em ${report.projectDetails.style}.`;
        }
      
      const drawings = await generateTechnicalDrawings(drawingSummary, report.projectDetails);

      setCurrentStepIndex(5); // "Criando as visualizações internas do imóvel..."
      setBaseProjectImage(drawings.mainImage);
      setPlanViewImage(drawings.planView);
      setInteriorKitchenImage(drawings.interiorKitchen);
      setInteriorLivingImage(drawings.interiorLiving);
      
      setCurrentStepIndex(6); // "Desenhando a planta baixa técnica..."
      setCurrentStepIndex(7); // "Finalizando os relatórios completos..."
      setIsGeneratingImage(false);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Erro ao gerar o plano: ${err.message}`);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateImage = async () => {
    if (!projectSummary || !projectDetails) return;
    setIsGeneratingImage(true);
    try {
        let drawingSummary = '';
        if (projectDetails.numberOfUnits > 1) {
            drawingSummary = `Um condomínio de ${projectDetails.numberOfUnits} ${projectDetails.unitType || 'unidades'} de ${projectDetails.unitArea}m² cada. Estilo ${projectDetails.style}.`;
        } else {
            drawingSummary = `Um projeto de ${projectDetails.totalArea}m² com ${projectDetails.bedrooms || ''} quartos e ${projectDetails.suites || ''} suítes. Foco em ${projectDetails.style}.`;
        }
        const { mainImage } = await generateTechnicalDrawings(drawingSummary, projectDetails);
        if (mainImage) {
            setBaseProjectImage(mainImage);
        }
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

  const financials = useMemo(() => {
    if (!projectPlan || !projectDetails) return null;

    const directCostCalc = directCost;
    const bdiDefaults = {
      indirectCosts: { admin: '2', insurance: '1', guarantee: '0.5', risk: '1.5' },
      taxes: { irpj: '1.2', csll: '1.08', pis: '0.65', cofins: '3', iss: '5', inss: '4.5' },
    };
    const parse = (val: string) => parseFloat(val) / 100 || 0;
    const totalIndirect = Object.values(bdiDefaults.indirectCosts).reduce((sum, val) => sum + parse(val), 0);
    const totalTaxesBDI = Object.values(bdiDefaults.taxes).reduce((sum, val) => sum + parse(val), 0);
    
    const profitMargin = netProfitMargin / 100;

    const denominator = 1 - (totalTaxesBDI + profitMargin);
    
    let finalPrice = 0;
    let profitValue = 0;
    let bdiRate = 0;
    if (denominator > 0 && directCostCalc > 0) {
      bdiRate = (((1 + totalIndirect) / denominator) - 1);
      finalPrice = directCostCalc * (1 + bdiRate);
      profitValue = finalPrice * profitMargin;
    }

    const taxTier = taxTiers.find(t => finalPrice <= t.limit) || taxTiers[taxTiers.length - 1];
    let taxAmount = 0;
    if (finalPrice > 0) {
      const effectiveRate = ((finalPrice * taxTier.rate) - taxTier.deduction) / finalPrice;
      taxAmount = finalPrice * effectiveRate;
    }
    
    const grossMarginValue = finalPrice - directCostCalc;
    const ebitda = grossMarginValue;
    const roi = directCostCalc > 0 ? (profitValue / directCostCalc) * 100 : 0;
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getTimelineString = () => {
        const start = new Date(projectPlan.projectStartDate + 'T00:00:00');
        const end = new Date(projectPlan.projectEndDate + 'T00:00:00');
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return `${diffDays} dias`;
        return `${Math.round(diffDays / 30)} meses`;
    };
    
    return {
        directCost: directCostCalc,
        finalPrice,
        taxAmount,
        grossMarginValue,
        profitValue,
        bdiRate: bdiRate * 100,
        ebitda,
        roi,
        projectName: marketingMaterials?.commercialNames[0] || 'Projeto de Construção',
        projectDetails,
        timelineString: getTimelineString(),
        bdiBreakdown: {
          indirectCosts: bdiDefaults.indirectCosts,
          taxes: bdiDefaults.taxes,
          netProfit: netProfitMargin.toString()
        },
        salePriceString: formatCurrency(finalPrice),
        costString: formatCurrency(directCostCalc)
    };
  }, [projectPlan, projectDetails, netProfitMargin, marketingMaterials, directCost]);

  useEffect(() => {
    if (baseProjectImage && financials) {
        const stampDataForImage: StampData = {
            projectName: financials.projectName,
            netProfitMarginString: `${netProfitMargin.toFixed(1)}%`,
            bedrooms: financials.projectDetails.bedrooms,
            suites: financials.projectDetails.suites,
            unitArea: financials.projectDetails.unitArea,
            totalArea: financials.projectDetails.totalArea,
            timelineString: financials.timelineString,
            numberOfUnits: financials.projectDetails.numberOfUnits,
            unitType: financials.projectDetails.unitType,
        };
        addStampAndLogoToImage(baseProjectImage, stampDataForImage)
            .then(imageWithStamp => {
                setProjectImage(imageWithStamp);
            })
            .catch(err => {
                console.warn("Failed to add stamp to image", err);
                setProjectImage(baseProjectImage); // Fallback to base image
            });
    }
  }, [baseProjectImage, financials, netProfitMargin]);

  const updateProposalWithNewPricing = (template: string | null, newFinancials: any, plan: ConstructionPlan | null): string => {
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

  const handleTaskUpdate = (updatedTask: any) => {
    if (projectPlan) {
        const updatedTasks = projectPlan.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        setProjectPlan({ ...projectPlan, tasks: updatedTasks });
    }
  };

  const handleExportToCsv = () => {
    if (!projectPlan || !financials || !projectDetails) return;

    const escapeCsvCell = (value: any) => {
        const stringValue = String(value ?? '').replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${stringValue}"`;
    };

    const formatNumberForCsv = (value: number) => {
        return value.toFixed(2).replace('.', ',');
    };
    
    let csvContent = `\uFEFF`;

    // 1. Project Info
    csvContent += 'INFORMAÇÕES GERAIS DO PROJETO\n';
    const projectInfo = [
      ['Nome do Projeto', financials.projectName],
      ['Período de Execução', `${projectPlan.projectStartDate} a ${projectPlan.projectEndDate}`],
      ['Área Total Construída', `${projectDetails.totalArea} m²`],
      ...(projectDetails.numberOfUnits > 1 ? [
        ['Número de Unidades', projectDetails.numberOfUnits],
        ['Tipo de Unidade', projectDetails.unitType || 'N/A'],
        ['Área por Unidade', `${projectDetails.unitArea} m²`]
      ] : []),
      ['Estilo Arquitetônico', projectDetails.style],
      ['Quartos por Unidade', projectDetails.bedrooms || 'N/A'],
      ['Suítes por Unidade', projectDetails.suites || 'N/A'],
      ['Banheiros por Unidade', projectDetails.bathrooms || 'N/A']
    ];
    projectInfo.forEach(row => {
        csvContent += `${escapeCsvCell(row[0])};${escapeCsvCell(row[1])}\n`;
    });
    csvContent += '\n\n';

    // 2. Financial Summary
    csvContent += 'RESUMO FINANCEIRO\n';
    const financialSummary = [
      ['Custo Direto Total (Materiais + M.O.)', formatNumberForCsv(financials.directCost)],
      ['Taxa BDI Aplicada (%)', financials.bdiRate.toFixed(2).replace('.', ',')],
      ['Preço Final de Venda', formatNumberForCsv(financials.finalPrice)],
      ['Lucro Líquido Estimado', formatNumberForCsv(financials.profitValue)],
      ['Impostos Estimados', formatNumberForCsv(financials.taxAmount)],
      ['ROI (Retorno sobre Investimento) (%)', financials.roi.toFixed(2).replace('.', ',')]
    ];
    financialSummary.forEach(row => {
        csvContent += `${escapeCsvCell(row[0])};${escapeCsvCell(row[1])}\n`;
    });
    csvContent += '\n\n';

    // 3. Task Plan
    csvContent += 'PLANO DE TAREFAS\n';
    const taskHeaders = ['ID', 'Fase', 'Nome da Tarefa', 'Descrição', 'Responsável', 'Data de Início', 'Data de Término', 'Status', 'Dependências', 'Custo Materiais (R$)', 'Custo Mão de Obra (R$)', 'Custo Total (R$)', 'Notas'];
    csvContent += taskHeaders.join(';') + '\n';
    projectPlan.tasks.forEach(task => {
        const row = [
            task.id, task.phase, task.taskName, task.description, task.assignee,
            task.startDate, task.endDate, task.status, task.dependencies,
            formatNumberForCsv(task.costMaterials),
            formatNumberForCsv(task.costLabor),
            formatNumberForCsv(task.costMaterials + task.costLabor),
            task.notes
        ].map(escapeCsvCell).join(';');
        csvContent += row + '\n';
    });
    csvContent += '\n\n';

    // 4. ABC Curve
    const tasksWithTotalCost = projectPlan.tasks.map(t => ({
      ...t,
      totalCost: t.costMaterials + t.costLabor,
    })).filter(t => t.totalCost > 0);
    const grandTotal = tasksWithTotalCost.reduce((sum, t) => sum + t.totalCost, 0);
    if (grandTotal > 0) {
      const sortedTasks = tasksWithTotalCost.sort((a, b) => b.totalCost - a.totalCost);
      let cumulativeCost = 0;
      const classifiedTasks = sortedTasks.map(t => {
        cumulativeCost += t.totalCost;
        const cumulativePercent = (cumulativeCost / grandTotal) * 100;
        const weight = (t.totalCost / grandTotal) * 100;
        let abcClass: 'A' | 'B' | 'C' = 'C';
        if (cumulativePercent <= 80) abcClass = 'A';
        else if (cumulativePercent <= 95) abcClass = 'B';
        return { ...t, weight, cumulativePercent, abcClass };
      });
      
      csvContent += 'CURVA ABC DE CUSTOS\n';
      const abcHeaders = ['Classe', 'Item (Tarefa)', 'Custo (R$)', 'Peso (%)', 'Acumulado (%)'];
      csvContent += abcHeaders.join(';') + '\n';
      classifiedTasks.forEach(task => {
          const row = [
              task.abcClass, task.taskName, formatNumberForCsv(task.totalCost),
              task.weight.toFixed(2).replace('.', ','),
              task.cumulativePercent.toFixed(2).replace('.', ',')
          ].map(escapeCsvCell).join(';');
          csvContent += row + '\n';
      });
      csvContent += '\n\n';
    }

    // 5. Budget Summary (different from financial summary, this is the user's input budget)
    csvContent += 'RESUMO DO ORÇAMENTO (VERBA INICIAL)\n';
    csvContent += 'Categoria;Valor (R$)\n';
    csvContent += `"Verba Total Informada";"${formatNumberForCsv(projectPlan.budget.total)}"\n`;
    csvContent += `"Custo de Materiais (Distribuído)";"${formatNumberForCsv(projectPlan.budget.materials)}"\n`;
    csvContent += `"Custo de Mão de Obra (Distribuído)";"${formatNumberForCsv(projectPlan.budget.labor)}"\n`;
    csvContent += `"Taxa do Gestor (Distribuído)";"${formatNumberForCsv(projectPlan.budget.managerFee)}"\n`;
    csvContent += '\n\n';

    // 6. Material Delivery Schedule
    csvContent += 'CRONOGRAMA DE ENTREGA DE MATERIAIS\n';
    const materialHeaders = ['ID', 'Material', 'Fornecedor', 'Data de Entrega', 'ID Tarefa Relacionada', 'Status'];
    csvContent += materialHeaders.join(';') + '\n';
    projectPlan.materialDeliveries.forEach(item => {
        const row = [item.id, item.materialName, item.supplier, item.deliveryDate, item.relatedTaskId, item.status].map(escapeCsvCell).join(';');
        csvContent += row + '\n';
    });
    csvContent += '\n\n';

    // 7. Payment Schedule
    csvContent += 'CRONOGRAMA DE PAGAMENTOS\n';
    const paymentHeaders = ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Status', 'Valor (R$)'];
    csvContent += paymentHeaders.join(';') + '\n';
    projectPlan.paymentSchedule.forEach(item => {
        const row = [item.id, item.description, item.dueDate, item.category, item.status, formatNumberForCsv(item.amount)].map(escapeCsvCell).join(';');
        csvContent += row + '\n';
    });
    csvContent += '\n\n';

    // 8. Descriptive Memorial
    if (descriptiveMemorial) {
        csvContent += 'MEMORIAL DESCRITIVO\n';
        // Keep newlines for the memorial by quoting the entire block.
        const escapedMemorial = `"${descriptiveMemorial.replace(/"/g, '""')}"`;
        csvContent += escapedMemorial + '\n\n';
    }


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plano_de_obra_completo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setShowApp(false);
  };

  const handleGoToApp = () => {
      setShowApp(true);
  }

  const handleGoToHome = () => {
      setShowApp(false);
      setIsAuthenticated(false);
      setProjectPlan(null);
  }
  
  const renderContent = () => {
    if (!showApp) {
        return <MarketingPage onStart={handleGoToApp} />;
    }
    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} onGoToHome={handleGoToHome} />;
    }
    return (
        <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
                <InputSection
                    userInput={userInput} onUserInputChange={(e) => setUserInput(e.target.value)}
                    clientName={clientName} onClientNameChange={(e) => setClientName(e.target.value)}
                    totalBudget={totalBudget} onTotalBudgetChange={(e) => setTotalBudget(e.target.value)}
                    projectManagerFee={projectManagerFee} onProjectManagerFeeChange={(e) => setProjectManagerFee(e.target.value)}
                    startDate={startDate} onStartDateChange={(e) => setStartDate(e.target.value)}
                    endDate={endDate} onEndDateChange={(e) => setEndDate(e.target.value)}
                    responsibleProfessional={responsibleProfessional} onResponsibleProfessionalChange={(e) => setResponsibleProfessional(e.target.value)}
                    payMaterialsWithCard={payMaterialsWithCard} onPayMaterialsWithCardChange={(e) => setPayMaterialsWithCard(e.target.checked)}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                />
            </div>
        
            {isLoading && (
              <div className="text-center p-12">
                  <GenerationProgress steps={PROGRESS_STEPS} currentStepIndex={currentStepIndex} />
              </div>
            )}
            
            {error && <div className="container mx-auto mt-8 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-center max-w-4xl">{error}</div>}

            {projectPlan && financials && projectDetails && (
            <div id="results" className="max-w-7xl mx-auto mt-12 space-y-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Seu Plano de Obra está Pronto!</h2>
                        {isGeneratingImage && <p className="text-sm text-slate-500 animate-pulse mt-1">Gerando imagens do projeto...</p>}
                    </div>
                    <div className="flex items-center flex-wrap gap-3">
                        <button
                            onClick={handleExportToCsv}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                            <SpreadsheetIcon className="w-5 h-5 mr-2" />
                            Planilha (Excel)
                        </button>
                        <DownloadEngineeringPdfButton 
                            projectPlan={projectPlan}
                            planViewImage={planViewImage}
                            descriptiveMemorial={descriptiveMemorial}
                            projectDetails={projectDetails}
                            icon={<CogIcon className="w-5 h-5 mr-2" />}
                        />
                        <DownloadInvestorPdfButton
                            projectPlan={projectPlan}
                            financials={financials}
                            proposalText={displayProposalText}
                            descriptiveMemorial={descriptiveMemorial}
                            projectImage={projectImage}
                            planViewImage={planViewImage}
                            interiorKitchenImage={interiorKitchenImage}
                            interiorLivingImage={interiorLivingImage}
                            responsibleProfessional={responsibleProfessional}
                            clientName={clientName}
                            icon={<DollarSignIcon className="w-5 h-5 mr-2" />}
                        />
                    </div>
                    </div>
                </div>

                <div className="bg-white p-3 md:p-4 rounded-full border border-slate-200 shadow-lg flex flex-wrap justify-center gap-2">
                    <TabButton tab="overview" label="Visão Geral" icon={<ChartIcon className="w-5 h-5"/>} />
                    <TabButton tab="proposal" label="Proposta & Mkt" icon={<ProposalIcon className="w-5 h-5"/>} />
                    <TabButton tab="analysis" label="Análises" icon={<AbcIcon className="w-5 h-5"/>} />
                    <TabButton tab="tables" label="Tabelas" icon={<TasksIcon className="w-5 h-5"/>} />
                    <TabButton tab="calculators" label="Calculadoras" icon={<CalculatorIcon className="w-5 h-5"/>} />
                </div>

                <div
                  key={activeTab}
                  className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-12 animate-fadeIn"
                >
                    {activeTab === 'overview' && (
                    <>
                        <BudgetSection budget={projectPlan.budget} tasks={projectPlan.tasks} />
                        <RoomDimensionsSection dimensions={financials.projectDetails.roomDimensions} />
                        <PricingSection 
                            financials={financials} 
                            netProfitMargin={netProfitMargin} 
                            onMarginChange={handleNetProfitMarginChange}
                        />
                        <GanttChart tasks={projectPlan.tasks} />
                        <ProjectEvolutionChart tasks={projectPlan.tasks} projectStartDate={projectPlan.projectStartDate} projectEndDate={projectPlan.projectEndDate} />
                    </>
                    )}
                    {activeTab === 'proposal' && marketingMaterials && (
                    <>
                        <ProposalSection 
                            proposalText={displayProposalText} 
                            onTextChange={setEditedProposalText} 
                            projectImage={projectImage}
                            planViewImage={planViewImage}
                            interiorKitchenImage={interiorKitchenImage}
                            interiorLivingImage={interiorLivingImage}
                            onRegenerateImage={handleRegenerateImage}
                            isGeneratingImage={isGeneratingImage}
                            financials={financials}
                        />
                        <DescriptiveMemorial memorialText={descriptiveMemorial} />
                        <MarketingSection materials={marketingMaterials} projectImage={projectImage} />
                    </>
                    )}
                    {activeTab === 'analysis' && (
                        <>
                            <AbcCurve tasks={projectPlan.tasks} />
                            <FinancialScenariosSection financials={financials} projectPlan={projectPlan} />
                        </>
                    )}
                    {activeTab === 'tables' && (
                        <>
                            <PlanTable tasks={projectPlan.tasks} onTaskUpdate={handleTaskUpdate} />
                            <MaterialDeliverySchedule deliveries={projectPlan.materialDeliveries} />
                            <PaymentSchedule schedule={projectPlan.paymentSchedule} />
                        </>
                    )}
                    {activeTab === 'calculators' && (
                        <>
                            <BdiCalculator directCost={directCost} />
                            <TaxSection totalBudget={financials.finalPrice} />
                            <UnitCostCalculator />
                            <CostBreakdownCalculator />
                        </>
                    )}
                </div>
            </div>
            )}
        </div>
    );
  };

  return (
    <>
      <Header
        isAppView={showApp}
        isAuthenticated={isAuthenticated}
        onStart={handleGoToApp}
        onLogout={handleLogout}
        onGoToHome={handleGoToHome}
      />
      <main className="min-h-screen">
        {renderContent()}
      </main>
      <Footer />
    </>
  );
};

export default App;
