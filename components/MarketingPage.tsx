import React from 'react';
import { TasksIcon } from './icons/TasksIcon';
import { CashIcon } from './icons/CashIcon';
import { ChartIcon } from './icons/ChartIcon';
import { ProposalIcon } from './icons/ProposalIcon';
import { ZapIcon } from './icons/ZapIcon';
import { RocketIcon } from './icons/RocketIcon';
import { TargetIcon } from './icons/TargetIcon';

interface MarketingPageProps {
  onStart: () => void;
  isBackendConfigured: boolean;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ onStart, isBackendConfigured }) => {
    
  const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-lg hover:border-blue-300">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{children}</p>
    </div>
  );

  return (
    <div>
      {!isBackendConfigured && (
        <div className="bg-amber-100 border-b-2 border-amber-200 text-amber-900 px-4 py-3 text-center text-sm sticky top-[73px] z-30">
          <div className="container mx-auto">
            <p>
              <strong className="font-semibold">Modo de Demonstração:</strong> A conexão com o backend não foi configurada. Login e salvamento estão desativados. <strong>Clique em "Acessar Ferramenta" para ver as instruções de configuração.</strong>
            </p>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="text-center py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 leading-tight">
            Gerador Inteligente de Planilhas de Obra
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Transforme a descrição do seu projeto em uma planilha de Excel completa para gerenciamento de obras, com tarefas, custos e cronogramas, tudo em minutos.
          </p>
          <div className="mt-10">
            <button
              onClick={onStart}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Gerar Minha Planilha Agora &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Tudo que você precisa em um só lugar</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Deixe a IA fazer o trabalho pesado e foque no que realmente importa: executar a obra.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<TasksIcon className="w-6 h-6"/>} title="Planejamento Detalhado">
              Gere cronogramas de tarefas com fases, dependências e prazos realistas para cada etapa do projeto.
            </FeatureCard>
            <FeatureCard icon={<CashIcon className="w-6 h-6"/>} title="Orçamento Preciso">
              Receba uma distribuição de custos detalhada entre mão de obra e materiais, alinhada com sua verba total.
            </FeatureCard>
            <FeatureCard icon={<ChartIcon className="w-6 h-6"/>} title="Gráficos Profissionais">
              Visualize seu projeto com Gráficos de Gantt, Curva ABC de Custos e Curva S de evolução financeira.
            </FeatureCard>
            <FeatureCard icon={<ProposalIcon className="w-6 h-6"/>} title="Proposta Comercial">
              Crie uma proposta formal e editável para seu cliente, incluindo escopo, cronograma e resumo do orçamento.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Projetado para Profissionais da Construção</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Engenheiros, arquitetos, construtores e gestores de obra podem se beneficiar do GPO.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 text-left">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1"><ZapIcon className="w-8 h-8 text-blue-600"/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Economize Tempo Precioso</h3>
                        <p className="mt-2 text-slate-600">Reduza horas de trabalho manual de planejamento e orçamentação. Gere em minutos o que antes levava dias.</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1"><TargetIcon className="w-8 h-8 text-blue-600"/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Aumente sua Precisão</h3>
                        <p className="mt-2 text-slate-600">Utilize uma base de dados estruturada e a lógica da IA para criar estimativas mais consistentes e confiáveis.</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1"><RocketIcon className="w-8 h-8 text-blue-600"/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Impressione seus Clientes</h3>
                        <p className="mt-2 text-slate-600">Apresente relatórios, propostas e gráficos de alta qualidade que demonstram profissionalismo e domínio do projeto.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="py-20 bg-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Pronto para revolucionar seu planejamento?</h2>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">Chega de planilhas complexas e noites em claro. Deixe o GPO ser seu novo assistente de planejamento.</p>
            <div className="mt-8">
                <button
                onClick={onStart}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white transition-all duration-300 transform hover:scale-105 text-lg"
                >
                Gerar Minha Primeira Planilha
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;