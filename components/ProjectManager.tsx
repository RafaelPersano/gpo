import React, { useState, useEffect } from 'react';

interface ProjectManagerProps {
    projects: any[];
    selectedProjectId: number | null;
    onSelectProject: (id: number) => void;
    onNewProject: () => void;
}

const ITEMS_PER_PAGE = 10;

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, selectedProjectId, onSelectProject, onNewProject }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

    useEffect(() => {
        // This effect handles cases where the current page becomes invalid after the project list changes.
        // For example, if you are on page 3 and delete items so there are only 2 pages left.
        const newTotalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 1) {
            // Reset to page 1 if there's only one page
            setCurrentPage(1);
        }
    }, [projects.length, currentPage]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Gerenciador de Projetos</h2>
                    <p className="text-slate-500 text-sm">Selecione um projeto para ver os detalhes ou crie um novo.</p>
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                    <div className="flex items-center gap-4 w-full">
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => onSelectProject(Number(e.target.value))}
                            className="block w-full flex-grow pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={projects.length === 0}
                        >
                            <option value="" disabled>
                                {projects.length > 0 ? 'Selecione um projeto...' : 'Nenhum projeto encontrado'}
                            </option>
                            {paginatedProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.project_name || `Projeto #${p.id}`}</option>
                            ))}
                        </select>
                        <button
                            onClick={onNewProject}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                            + Novo Projeto
                        </button>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 w-full">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-slate-500 font-medium">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectManager;