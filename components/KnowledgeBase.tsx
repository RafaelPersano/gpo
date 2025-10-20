
import React from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { PercentIcon } from './icons/PercentIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <div className="mt-2 text-slate-600 space-y-3">{children}</div>
            </div>
        </div>
    </div>
);

const KnowledgeBase: React.FC = () => {
    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <BookOpenIcon className="w-8 h-8 text-blue-600" />
                    Base de Conhecimento: Incorporação Imobiliária
                </h2>
                <p className="mt-2 text-slate-600 max-w-3xl">
                    Entenda os principais conceitos e estratégias tributárias para otimizar seus projetos de incorporação imobiliária.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <InfoCard icon={<BriefcaseIcon className="w-6 h-6" />} title="SPE - Sociedade de Propósito Específico">
                    <p>
                        A SPE é um modelo de empresa criado com um objetivo único e tempo de vida determinado. Na construção civil, cria-se uma SPE para cada empreendimento.
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                        <li><strong>Isolamento de Risco:</strong> Os ativos, dívidas e riscos de um projeto ficam separados dos da construtora e de outros projetos.</li>
                        <li><strong>Segurança Jurídica:</strong> Oferece mais segurança para a construtora, sócios e compradores.</li>
                        <li><strong>Fim Definido:</strong> A empresa é extinta automaticamente após a conclusão e entrega do empreendimento.</li>
                    </ul>
                </InfoCard>

                <InfoCard icon={<ShieldIcon className="w-6 h-6" />} title="Patrimônio de Afetação">
                    <p>
                        É um regime jurídico que cria uma blindagem patrimonial para um empreendimento imobiliário. Essencialmente, o terreno, as obras e as receitas do projeto são separados do patrimônio geral da construtora.
                    </p>
                    <p className="font-semibold text-slate-700">
                        Seu principal objetivo é proteger os compradores. Em caso de falência da construtora, esse patrimônio "afetado" não entra na massa falida e é usado para garantir a finalização da obra.
                    </p>
                     <p className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm">
                        <strong>Conexão Crucial:</strong> A adesão ao Patrimônio de Afetação é um <strong>pré-requisito obrigatório</strong> para que a empresa possa optar pelo RET.
                    </p>
                </InfoCard>
                
                 <InfoCard icon={<PercentIcon className="w-6 h-6" />} title="Regimes Tributários para a SPE">
                    <p>Uma SPE imobiliária pode optar por diferentes regimes de tributação. Os mais comuns são:</p>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <strong>Lucro Presumido:</strong> Modelo simplificado onde o governo presume o lucro da empresa. Para atividades imobiliárias, a base de cálculo é de 8% para IRPJ e 12% para CSLL sobre a receita bruta. A alíquota de PIS/COFINS é de 3,65%. A carga federal total fica em torno de <strong>5,93%</strong> sobre a receita.
                        </li>
                        <li>
                            <strong>Lucro Real:</strong> A tributação incide sobre o lucro contábil real, após todas as deduções de custos e despesas. É mais complexo e indicado para projetos com margens de lucro apertadas ou prejuízo.
                        </li>
                         <li>
                            <strong>RET (Regime Especial):</strong> A opção mais vantajosa na maioria dos casos, detalhada abaixo.
                        </li>
                    </ul>
                </InfoCard>

                 <InfoCard icon={<TrendingUpIcon className="w-6 h-6" />} title="RET - Regime Especial de Tributação">
                    <p>
                        O RET é o maior benefício fiscal para incorporadoras que utilizam a SPE com Patrimônio de Afetação.
                    </p>
                    <p>
                        Ele unifica 4 impostos federais (IRPJ, CSLL, PIS e COFINS) em uma única guia de pagamento mensal, com uma alíquota fixa de <strong>4% sobre a receita bruta</strong> recebida no mês.
                    </p>
                     <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 text-sm">
                        <h4 className="font-bold text-green-800">Vantagem Competitiva</h4>
                        <p className="text-green-700">
                            Ao optar pelo RET, a carga tributária federal cai de aproximadamente 5,93% (no Lucro Presumido) para apenas <strong>4%</strong>, representando uma economia de mais de 30% nos impostos federais e aumentando significativamente a lucratividade do projeto.
                        </p>
                    </div>
                     <p className="mt-2 text-sm">
                        Você pode simular o impacto financeiro da adoção do RET em sua obra na aba <strong>Análises & Ferramentas</strong>, na seção "Calculadora Comparativa de Regimes Tributários".
                    </p>
                </InfoCard>
            </div>
             <p className="text-center text-xs text-slate-500 mt-4">
                <strong>Aviso Legal:</strong> As informações apresentadas são um resumo educativo e não substituem a consultoria de um contador ou advogado tributarista. A legislação pode sofrer alterações.
            </p>
        </div>
    );
};

export default KnowledgeBase;
