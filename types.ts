
export interface ConstructionTask {
  id: number;
  phase: string;
  taskName: string;
  description: string;
  assignee: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Não Iniciado' | 'Em Andamento' | 'Concluído' | 'Atrasado';
  dependencies: string;
  costMaterials: number;
  costLabor: number;
  notes: string;
}

export interface MaterialDelivery {
    id: number;
    materialName: string;
    relatedTaskId: number;
    deliveryDate: string; // YYYY-MM-DD
    supplier: string;
    status: 'Pendente' | 'Pedido' | 'Entregue';
}

export interface PaymentInstallment {
    id: number;
    description: string;
    dueDate: string; // YYYY-MM-DD
    amount: number;
    status: 'Pendente' | 'Pago';
    category: 'Mão de Obra' | 'Material';
}

export interface Budget {
    total: number;
    materials: number;
    labor: number;
    managerFee: number;
}

export interface RoomDimension {
    name: string;
    area: number;
}

export interface ProjectDetails {
    totalArea: number; // Soma da área de todas as unidades
    unitArea: number; // Área de uma única unidade
    numberOfUnits: number; // Número de unidades no projeto (1 para unidade única)
    unitType?: string; // ex: 'casa', 'apartamento'
    bedrooms?: number; // por unidade
    suites?: number; // por unidade
    bathrooms?: number; // por unidade, INCLUINDO as suítes
    floors?: number; // por unidade
    style: string;
    roomDimensions?: RoomDimension[];
}

export interface ConstructionPlan {
    projectStartDate: string; // YYYY-MM-DD
    projectEndDate: string; // YYYY-MM-DD
    budget: Budget;
    tasks: ConstructionTask[];
    materialDeliveries: MaterialDelivery[];
    paymentSchedule: PaymentInstallment[];
}

export interface MarketingBenefit {
    title: string;
    description: string;
}

export interface LandingPageContent {
    headline: string;
    subheadline: string;
    benefits: MarketingBenefit[];
    finalCta: string;
    imageSuggestion: string;
}

export interface MarketingMaterials {
    commercialNames: string[];
    instagramPost: string;
    linkedInPost: string;
    ctas: string[];
    landingPageContent: LandingPageContent;
}