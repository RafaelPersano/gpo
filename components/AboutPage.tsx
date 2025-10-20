import React from 'react';
import { UsersIcon } from './icons/UsersIcon';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Sobre o Gerador de Planilhas de Obra com IA</h1>
                <p className="mt-4 text-lg text-slate-600">
                    Otimizando o planejamento e a gestão na construção civil com tecnologia de ponta.
                </p>
            </div>

            <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
                <p>
                    O <strong>Gerador de Planilhas de Obra (GPO)</strong> nasceu da necessidade de simplificar e acelerar uma das etapas mais críticas e trabalhosas da construção civil: o planejamento. Sabemos que engenheiros, arquitetos e gestores de obras dedicam horas preciosas na criação de cronogramas, orçamentos e propostas. Nossa missão é transformar esse processo, tornando-o mais rápido, inteligente e preciso.
                </p>

                <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Como Funciona?</h2>
                    <p>
                        Utilizamos modelos avançados de Inteligência Artificial, incluindo a poderosa API Gemini do Google, para interpretar a descrição do seu projeto. Com base no seu texto, a IA estrutura um plano de obra completo, detalhando tarefas, distribuindo custos, definindo prazos e até mesmo criando materiais de marketing para o seu empreendimento.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Benefícios para Profissionais</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Economia de Tempo:</strong> Gere em minutos o que levaria dias de trabalho manual.</li>
                        <li><strong>Precisão e Padronização:</strong> Reduza erros humanos e crie planos consistentes e bem estruturados.</li>
                        <li><strong>Relatórios Profissionais:</strong> Impressione seus clientes com propostas, gráficos e relatórios gerados automaticamente.</li>
                        <li><strong>Foco no Essencial:</strong> Libere seu tempo para focar na execução, negociação e gestão da obra, em vez de ficar preso às planilhas.</li>
                    </ul>
                </div>

                <div className="text-center mt-12">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Nossa Equipe</h2>
                    <div className="flex justify-center items-center">
                        <div className="w-64 h-40 bg-slate-200 rounded-lg border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-500">
                            <UsersIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm font-medium">Foto da Equipe ou Logo</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                        Somos apaixonados por tecnologia e pela construção civil, dedicados a criar ferramentas que realmente fazem a diferença no seu dia a dia.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
