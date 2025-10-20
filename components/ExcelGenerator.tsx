import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { generateExcelData } from '../services/geminiService';
import { WandIcon } from './icons/WandIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import LoadingSpinner from './LoadingSpinner';

const ExcelGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedData, setGeneratedData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, descreva o projeto para gerar a planilha.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedData(null);

        try {
            const data = await generateExcelData(prompt);
            setGeneratedData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            setError(`Falha ao gerar dados: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedData || generatedData.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(generatedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plano de Obra');
        
        // Auto-dimensionar colunas
        const colWidths = Object.keys(generatedData[0]).map(key => ({
            wch: Math.max(key.length, ...generatedData.map(row => String(row[key] ?? '').length))
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, 'planilha_de_obra_gerada.xlsx');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Gerador de Planilha de Obra</h2>
            <p className="text-slate-600">
                Descreva sua obra ou reforma no campo abaixo e a Inteligência Artificial criará uma planilha detalhada
                com etapas, tarefas, custos e cronograma para você baixar em formato Excel (.xlsx).
            </p>
            
            <div className="space-y-4">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder='Ex: "Construção de uma casa de 120m² com 3 quartos, sendo 1 suíte, sala, cozinha, 2 banheiros e área de serviço. Incluir fundação, estrutura, alvenaria, telhado, instalações elétricas e hidráulicas, e acabamentos como pintura e colocação de piso."'
                />
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Gerando Dados...</span>
                        </>
                    ) : (
                        <>
                            <WandIcon className="w-5 h-5 mr-2" />
                            Gerar Planilha
                        </>
                    )}
                </button>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}

            {generatedData && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-green-800">Sua planilha está pronta!</h3>
                    <p className="text-green-700">
                        {generatedData.length} linhas de tarefas foram geradas com sucesso. Visualize abaixo uma prévia dos dados e faça o download do arquivo completo.
                    </p>
                    <div className="overflow-auto border border-slate-300 rounded-lg h-64 bg-white">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-slate-100">
                                <tr>
                                    {Object.keys(generatedData[0]).map(key => (
                                        <th key={key} className="p-2 border-b border-slate-300 text-left font-semibold text-slate-600">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {generatedData.slice(0, 10).map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50 border-b border-slate-200">
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <td key={cellIndex} className="p-2 whitespace-nowrap">{String(cell)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <button
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Baixar Arquivo Excel (.xlsx)
                    </button>
                </div>
            )}

        </div>
    );
};

export default ExcelGenerator;