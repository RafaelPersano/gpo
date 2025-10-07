
import React, { useState, useEffect } from 'react';
import { WandIcon } from './icons/WandIcon.tsx';

interface InputSectionProps {
  userInput: string;
  onUserInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  clientName: string;
  onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalBudget: string;
  onTotalBudgetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  projectManagerFee: string;
  onProjectManagerFeeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startDate: string;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  endDate: string;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  responsibleProfessional: string;
  onResponsibleProfessionalChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  payMaterialsWithCard: boolean;
  onPayMaterialsWithCardChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  userInput, onUserInputChange, 
  clientName, onClientNameChange,
  totalBudget, onTotalBudgetChange,
  projectManagerFee, onProjectManagerFeeChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  responsibleProfessional, onResponsibleProfessionalChange,
  payMaterialsWithCard, onPayMaterialsWithCardChange,
  onGenerate, isLoading 
}) => {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const newErrors: Record<string, string | null> = {};

    // Total Budget validation
    if (totalBudget) {
        const budgetValue = parseFloat(totalBudget);
        if (isNaN(budgetValue) || budgetValue <= 0) {
            newErrors.totalBudget = 'A verba total deve ser um número positivo.';
        }
    }

    // Date validation
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            newErrors.endDate = 'A data de término não pode ser anterior à data de início.';
        }
    }

    setErrors(newErrors);
  }, [totalBudget, startDate, endDate]);

  const hasErrors = Object.values(errors).some(error => error !== null);


  return (
    <section>
      <div className="mb-6">
        <label htmlFor="project-description" className="block text-lg font-semibold text-slate-700 mb-2">
          1. Descreva sua Obra ou Reforma
        </label>
        <p className="text-slate-500 mb-4">
          Seja detalhado para uma obra completa ou liste apenas os serviços da reforma. Quanto mais detalhes, mais preciso será o plano.
        </p>
        <textarea
          id="project-description"
          value={userInput}
          onChange={onUserInputChange}
          disabled={isLoading}
          className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder='Obra Completa: "Construção de casa térrea de 150m², 3 quartos..." ou Reforma Parcial: "Reforma de banheiro de 5m²: troca de piso e revestimento, instalação de novo vaso e bancada de granito."'
        />
      </div>

      <div className="mb-6">
        <label htmlFor="client-name" className="block text-lg font-semibold text-slate-700 mb-2">
          2. Nome do Cliente
        </label>
        <p className="text-slate-500 mb-4 text-sm">
          (Opcional) Nome do cliente para personalizar a proposta.
        </p>
        <input
          type="text"
          id="client-name"
          value={clientName}
          onChange={onClientNameChange}
          disabled={isLoading}
          className="w-full h-12 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Ex: João da Silva"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="total-budget" className="block text-lg font-semibold text-slate-700 mb-2">
            3. Verba Total
          </label>
          <p className="text-slate-500 mb-4 text-sm">
            Valor total disponível para a obra.
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">R$</span>
            <input
              type="number"
              id="total-budget"
              value={totalBudget}
              onChange={onTotalBudgetChange}
              disabled={isLoading}
              className={`w-full h-12 p-3 pl-9 border rounded-lg focus:ring-2 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                errors.totalBudget ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="500000.00"
              aria-invalid={!!errors.totalBudget}
              aria-describedby="total-budget-error"
            />
          </div>
          {errors.totalBudget && <p id="total-budget-error" className="mt-1 text-sm text-red-600">{errors.totalBudget}</p>}
        </div>

        <div>
            <label htmlFor="manager-fee" className="block text-lg font-semibold text-slate-700 mb-2">
                4. Taxa do Gestor (%)
            </label>
            <p className="text-slate-500 mb-4 text-sm">
                (Opcional) % sobre o valor total.
            </p>
            <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                <input
                    type="number"
                    id="manager-fee"
                    value={projectManagerFee}
                    onChange={onProjectManagerFeeChange}
                    disabled={isLoading}
                    className="w-full h-12 p-3 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="10"
                />
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="start-date" className="block text-lg font-semibold text-slate-700 mb-2">
            5. Data de Início
          </label>
          <p className="text-slate-500 mb-4 text-sm">
            (Opcional) Quando a obra deve começar.
          </p>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={onStartDateChange}
            disabled={isLoading}
            className={`w-full h-12 p-3 border rounded-lg focus:ring-2 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                errors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-lg font-semibold text-slate-700 mb-2">
            6. Data de Término
          </label>
          <p className="text-slate-500 mb-4 text-sm">
            (Opcional) Prazo final para a conclusão.
          </p>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={onEndDateChange}
            disabled={isLoading}
            className={`w-full h-12 p-3 border rounded-lg focus:ring-2 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                errors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.endDate}
            aria-describedby="end-date-error"
          />
          {errors.endDate && <p id="end-date-error" className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="responsible-professional" className="block text-lg font-semibold text-slate-700 mb-2">
          7. Profissional Responsável
        </label>
        <p className="text-slate-500 mb-4 text-sm">
          (Opcional) Nome do engenheiro, arquiteto ou gestor responsável.
        </p>
        <input
          type="text"
          id="responsible-professional"
          value={responsibleProfessional}
          onChange={onResponsibleProfessionalChange}
          disabled={isLoading}
          className="w-full h-12 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Ex: Eng. Maria Clara"
        />
      </div>

       <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">8. Opções de Pagamento</h3>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="pay-materials-card"
                aria-describedby="pay-materials-card-description"
                name="pay-materials-card"
                type="checkbox"
                checked={payMaterialsWithCard}
                onChange={onPayMaterialsWithCardChange}
                disabled={isLoading}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="pay-materials-card" className="font-medium text-slate-900">
                Pagar materiais com cartão de crédito
              </label>
              <p id="pay-materials-card-description" className="text-slate-500">
                Se marcado, a IA agrupará os custos de materiais em um único pagamento, simulando uma fatura.
              </p>
            </div>
          </div>
        </div>


      <div className="mt-8 text-center">
        <button
          onClick={onGenerate}
          disabled={isLoading || !userInput.trim() || !totalBudget.trim() || hasErrors}
          className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            'Gerando Plano Completo...'
          ) : (
            <>
              <WandIcon className="w-5 h-5 mr-2" />
              Gerar Plano de Obras
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default InputSection;
