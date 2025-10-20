import React, { useState } from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ShareProposalButtonProps {
  projectId: number;
}

const ShareProposalButton: React.FC<ShareProposalButtonProps> = ({ projectId }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const proposalUrl = `${window.location.origin}/proposal/${projectId}`;
    navigator.clipboard.writeText(proposalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Falha ao copiar o link.');
    });
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center px-4 py-2 font-bold rounded-lg shadow-sm transition-colors text-sm ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {copied ? (
        <>
          <CheckIcon className="w-5 h-5 mr-2" />
          Link Copiado!
        </>
      ) : (
        <>
          <ShareIcon className="w-5 h-5 mr-2" />
          Compartilhar Proposta
        </>
      )}
    </button>
  );
};

export default ShareProposalButton;
