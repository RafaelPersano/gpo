export interface Phase {
    phase: string;
    minPercent: number;
    maxPercent: number;
    color: string;
}

// Fonte: Tabela de Estimativa de Gastos por Etapa de Obra - Residência Padrão Normal (CUB/SP 09/2021)
export const costBreakdownData: Phase[] = [
    { phase: 'Serviços preliminares', minPercent: 3.25, maxPercent: 3.25, color: 'bg-slate-400' },
    { phase: 'Movimento de terra', minPercent: 0.5, maxPercent: 0.5, color: 'bg-stone-500' },
    { phase: 'Infraestrutura', minPercent: 3.25, maxPercent: 3.25, color: 'bg-amber-800' },
    { phase: 'Superestrutura', minPercent: 13.65, maxPercent: 13.65, color: 'bg-gray-600' },
    { phase: 'Vedação', minPercent: 8.9, maxPercent: 8.9, color: 'bg-orange-500' },
    { phase: 'Esquadrias', minPercent: 9.1, maxPercent: 9.1, color: 'bg-amber-500' },
    { phase: 'Cobertura', minPercent: 4.75, maxPercent: 4.75, color: 'bg-red-700' },
    { phase: 'Instalações hidráulicas e sanitárias', minPercent: 12.75, maxPercent: 12.75, color: 'bg-blue-500' },
    { phase: 'Instalações elétricas', minPercent: 4.5, maxPercent: 4.5, color: 'bg-yellow-400' },
    { phase: 'Impermeabilização e isolamento térmico', minPercent: 0.75, maxPercent: 0.75, color: 'bg-cyan-700' },
    { phase: 'Revestimento (pisos, paredes e forros)', minPercent: 27.0, maxPercent: 27.0, color: 'bg-indigo-500' },
    { phase: 'Vidros', minPercent: 0.75, maxPercent: 0.75, color: 'bg-sky-300' },
    { phase: 'Pintura', minPercent: 7.35, maxPercent: 7.35, color: 'bg-rose-400' },
    { phase: 'Serviços complementares', minPercent: 3.5, maxPercent: 3.5, color: 'bg-lime-600' },
];