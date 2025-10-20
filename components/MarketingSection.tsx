import React from 'react';
import type { MarketingMaterials } from '../types';
import CopyButton from './CopyButton';
import { ClockIcon } from './icons/ClockIcon';
import { TargetIcon } from './icons/TargetIcon';
import { RocketIcon } from './icons/RocketIcon';
import { ImageIcon } from './icons/ImageIcon';
import DownloadLandingPageButton from './DownloadLandingPageButton';

type ProjectImages = Record<string, string>;

interface MarketingSectionProps {
  materials: MarketingMaterials;
  projectImages: ProjectImages | null;
}

const benefitIcons = {
    0: <ClockIcon className="w-8 h-8 text-white" />,
    1: <TargetIcon className="w-8 h-8 text-white" />,
    2: <RocketIcon className="w-8 h-8 text-white" />,
};

const MarketingSection: React.FC<MarketingSectionProps> = ({ materials, projectImages }) => {
  const { commercialNames, instagramPost, linkedInPost, ctas, landingPageContent } = materials;
  const facadeImage = projectImages?.facade || null;

  const Card: React.FC<{title: string, children: React.ReactNode, actions?: React.ReactNode}> = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-700">{title}</h3>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      <div className="p-4 md:p-6 text-slate-600 flex-grow">
        {children}
      </div>
    </div>
  );

  const SocialPostCard: React.FC<{title: string, postText: string}> = ({ title, postText }) => (
     <Card title={title} actions={<CopyButton text={postText} />}>
        <div className="space-y-4">
            <p className="whitespace-pre-wrap font-sans text-sm">{postText}</p>
            {projectImages && Object.keys(projectImages).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(projectImages).map(([key, src]) => (
                        <div key={key} className="rounded-md overflow-hidden border border-slate-200">
                             <img src={src} alt={`Imagem do projeto para post: ${key}`} className="w-full h-auto object-cover aspect-square" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Kit de Marketing do Projeto</h2>
        <p className="mt-1 text-slate-600">Use estes materiais gerados por IA para promover e vender seu projeto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card title="Nomes para o Projeto">
                <ul className="list-disc list-inside space-y-2">
                    {commercialNames.map((name, i) => <li key={i}>{name}</li>)}
                </ul>
            </Card>
            <Card title="Chamadas para Ação (CTAs)">
                <ul className="list-disc list-inside space-y-2">
                    {ctas.map((cta, i) => <li key={i}>{cta}</li>)}
                </ul>
            </Card>
        </div>
        
        <div className="space-y-8">
            <SocialPostCard title="Post para Instagram" postText={instagramPost} />
            <SocialPostCard title="Post para LinkedIn" postText={linkedInPost} />
        </div>
      </div>

      <div>
        <Card 
            title="Conteúdo para Landing Page"
            actions={<DownloadLandingPageButton content={landingPageContent} projectImage={facadeImage} />}
        >
            <div className={`p-8 md:p-12 rounded-xl shadow-2xl bg-slate-800 text-white text-center ${!facadeImage && 'bg-slate-800'}`}
                 style={facadeImage ? {
                    backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.7)), url(${facadeImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                 } : {}}
            >
                <h2 className="text-3xl md:text-4xl font-extrabold">{landingPageContent.headline}</h2>
                <p className="mt-4 max-w-2xl mx-auto text-slate-300 md:text-lg">{landingPageContent.subheadline}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-left">
                    {landingPageContent.benefits.map((benefit, i) => (
                        <div key={i} className="bg-slate-700/50 p-6 rounded-lg backdrop-blur-sm border border-white/10">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 mb-4">
                                {benefitIcons[i as keyof typeof benefitIcons] || benefitIcons[0]}
                            </div>
                            <h4 className="font-bold text-lg text-white">{benefit.title}</h4>
                            <p className="text-slate-300 text-sm mt-1">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12">
                     <button className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
                        {landingPageContent.finalCta}
                    </button>
                </div>
            </div>
        </Card>
      </div>

    </div>
  );
};

export default MarketingSection;