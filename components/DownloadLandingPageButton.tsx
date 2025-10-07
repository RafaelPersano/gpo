
import React from 'react';
import type { LandingPageContent } from '../types.ts';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

interface DownloadLandingPageButtonProps {
  content: LandingPageContent;
  projectImage: string | null;
}

const DownloadLandingPageButton: React.FC<DownloadLandingPageButtonProps> = ({ content, projectImage }) => {
  const { headline, subheadline, benefits, finalCta, imageSuggestion } = content;

  const clockIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>`;
  const targetIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>`;
  const rocketIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.64-1.8.6-3.8-.05-4.91-.65-1.12-2.11-1.14-3.1-.05-.8-1.05-2.2-1.1-3.1-.05-.5.52-.5 1.3 0 1.8.64 1.8.6 3.8-.05 4.91.65 1.12 2.1 1.14 3.1.05.8 1.05 2.2 1.1 3.1.05Z" /><path d="m12.5 12.5 1.62-1.62a2.4 2.4 0 0 1 3.39 3.39L16 16" /><path d="M18 10c-1.5-1.5-3-3-3-3" /><path d="m19 9-2.04-2.04" /><path d="m21.5 6.5-1.5-1.5" /></svg>`;

  const benefitIconsSvgs = [clockIconSvg, targetIconSvg, rocketIconSvg];

  const generateHtmlContent = () => {
    const benefitsHtml = benefits.map((benefit, i) => `
      <div class="bg-slate-700/50 p-6 rounded-lg backdrop-blur-sm border border-white/10">
        <div class="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 mb-4">
          ${benefitIconsSvgs[i] || benefitIconsSvgs[0]}
        </div>
        <h4 class="font-bold text-lg text-white">${benefit.title}</h4>
        <p class="text-slate-300 text-sm mt-1">${benefit.description}</p>
      </div>
    `).join('');

    const heroStyles = projectImage 
      ? `background-image: linear-gradient(rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.7)), url('${projectImage}'); background-size: cover; background-position: center;`
      : 'background-color: #1e293b;';
      
    const imageComment = `<!-- 
      Sugestão Original de Imagem de Fundo (Hero Image):
      "${imageSuggestion}"
      -->`;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${headline}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${imageComment}
      </head>
      <body class="bg-slate-100 font-sans">
        <header class="text-center py-6 bg-white shadow-sm">
          <h1 class="text-2xl font-bold text-slate-800">Seu Nome / Nome da Empresa</h1>
        </header>
        <main class="container mx-auto p-4 md:p-8">
          <section class="hero-section text-white p-8 md:p-12 rounded-xl text-center shadow-2xl" style="${heroStyles}">
            <h2 class="text-3xl md:text-4xl font-extrabold">${headline}</h2>
            <p class="mt-4 max-w-2xl mx-auto text-slate-300 md:text-lg">${subheadline}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-left">
              ${benefitsHtml}
            </div>

            <div class="mt-12">
              <a href="#" class="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
                ${finalCta}
              </a>
            </div>
          </section>
        </main>
        <footer class="text-center p-6 text-slate-500 text-sm">
          <p>&copy; ${new Date().getFullYear()} Seu Nome / Nome da Empresa. Todos os direitos reservados.</p>
        </footer>
      </body>
      </html>
    `;
  };

  const handleDownload = () => {
    const htmlString = generateHtmlContent();
    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'landing_page.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
    >
      <DownloadIcon className="w-4 h-4 mr-1.5" />
      Baixar Landing Page
    </button>
  );
};

export default DownloadLandingPageButton;