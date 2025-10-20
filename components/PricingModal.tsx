import React from 'react';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface PricingModalProps {
  show: boolean;
  onClose: () => void;
  onPurchasePlan: (tokensToAdd: number) => void;
}

const PlanCard: React.FC<{
  title: string;
  price: string;
  tokens: number;
  features: string[];
  isFeatured?: boolean;
  onPurchase: () => void;
}> = ({ title, price, tokens, features, isFeatured = false, onPurchase }) => {
  return (
    <div className={`rounded-xl border p-6 text-center flex flex-col ${isFeatured ? 'bg-slate-800 text-white border-blue-500 shadow-2xl' : 'bg-white border-slate-200'}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className={`text-sm font-semibold ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>/mês</span>
      </p>
       <p className={`mt-3 text-sm font-semibold ${isFeatured ? 'text-blue-400' : 'text-blue-600'}`}>
        {tokens} tokens de geração de projeto
      </p>
      <ul role="list" className={`mt-6 space-y-3 text-sm leading-6 text-left ${isFeatured ? 'text-slate-300' : 'text-slate-600'}`}>
        {features.map((feature) => (
          <li key={feature} className="flex gap-x-3">
            <CheckIcon className="h-6 w-5 flex-none text-blue-500" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <button
          onClick={onPurchase}
          className={`block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm transition-colors ${isFeatured ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Assinar Plano
        </button>
      </div>
    </div>
  );
};

const PricingModal: React.FC<PricingModalProps> = ({ show, onClose, onPurchasePlan }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl w-full m-4 transform transition-all relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <XIcon className="h-6 w-6" />
        </button>
        
        <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900" id="modal-title">Seus tokens acabaram!</h2>
            <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
                Para continuar gerando projetos ilimitados e ter acesso a todas as funcionalidades, por favor, escolha um dos nossos planos.
            </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanCard
                title="Básico"
                price="R$ 29,90"
                tokens={10}
                features={['Projetos ilimitados', 'Suporte por e-mail', 'Exportação CSV/PDF']}
                onPurchase={() => onPurchasePlan(10)}
            />
            <PlanCard
                title="Profissional"
                price="R$ 79,90"
                tokens={30}
                features={['Todas as do Básico', 'Kit de Marketing Completo', 'Visualizações 3D do Projeto']}
                isFeatured
                onPurchase={() => onPurchasePlan(30)}
            />
            <PlanCard
                title="Business"
                price="R$ 199,90"
                tokens={100}
                features={['Todas as do Profissional', 'Painel de Admin', 'Suporte Prioritário']}
                onPurchase={() => onPurchasePlan(100)}
            />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
            A cobrança é um processo simulado. Clicar em "Assinar Plano" irá adicionar os tokens à sua conta para fins de demonstração.
        </p>
      </div>
    </div>
  );
};

export default PricingModal;