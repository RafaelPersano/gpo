import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleIcon } from './icons/CircleIcon';
import LoadingSpinner from './LoadingSpinner';

interface GenerationProgressProps {
  steps: string[];
  currentStepIndex: number;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white border border-slate-200 rounded-lg shadow-lg animate-fade-in">
      <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Gerando seu plano...</h3>
      <ul className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <li key={index} className="flex items-center transition-all duration-300">
              <div className="flex-shrink-0 mr-4 h-6 w-6 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : isCurrent ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CircleIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <span className={`text-sm ${
                isCompleted ? 'text-slate-500 line-through' : 
                isCurrent ? 'text-blue-600 font-semibold' : 
                'text-slate-400'
              }`}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GenerationProgress;