import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
      }`}
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4 mr-1.5" />
          Copiado!
        </>
      ) : (
        <>
          <ClipboardIcon className="w-4 h-4 mr-1.5" />
          Copiar
        </>
      )}
    </button>
  );
};

export default CopyButton;