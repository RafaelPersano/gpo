import React, { useState, useCallback, ChangeEvent } from 'react';
import { SheetIcon } from './icons/SheetIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

interface SpreadsheetProps {
    data: string[][];
    onDataChange: (data: string[][]) => void;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ data, onDataChange }) => {
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

    const numCols = data[0]?.length || 15;

    const handleCellChange = useCallback((e: ChangeEvent<HTMLInputElement>, row: number, col: number) => {
        const newData = data.map((r, rowIndex) =>
            rowIndex === row ? r.map((c, colIndex) => (colIndex === col ? e.target.value : c)) : r
        );
        onDataChange(newData);
    }, [data, onDataChange]);

    const handleCellBlur = useCallback(() => {
        setEditingCell(null);
    }, []);

    const handleCellDoubleClick = useCallback((row: number, col: number) => {
        setEditingCell({ row, col });
    }, []);

    const handleAddRow = () => {
        onDataChange([...data, Array(numCols).fill('')]);
    };

    const handleAddCol = () => {
        onDataChange(data.map(row => [...row, '']));
    };

    const exportToCsv = () => {
        const escapeCsvCell = (value: string) => {
            const stringValue = String(value ?? '').replace(/"/g, '""');
            return `"${stringValue}"`;
        };

        const csvContent = data.map(row => row.map(escapeCsvCell).join(';')).join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'planilha_de_obra.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getColumnName = (colIndex: number) => {
        let name = '';
        let n = colIndex;
        while (n >= 0) {
            name = String.fromCharCode(65 + (n % 26)) + name;
            n = Math.floor(n / 26) - 1;
        }
        return name;
    };
    
    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <SheetIcon className="w-6 h-6 mr-3 text-blue-600" />
                    Editor de Planilha de Obras
                </h2>
                <div className="flex items-center gap-3">
                    <button onClick={handleAddRow} className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">+ Linha</button>
                    <button onClick={handleAddCol} className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">+ Coluna</button>
                    <button onClick={exportToCsv} className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Exportar (CSV)
                    </button>
                </div>
            </div>

            <div className="overflow-auto border border-slate-300 rounded-lg h-[60vh] relative">
                <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            <th className="w-12 min-w-[3rem] p-2 border-b border-r border-slate-300 text-center text-sm font-semibold text-slate-500 sticky left-0 bg-slate-100">#</th>
                            {data[0]?.map((_, colIndex) => (
                                <th key={colIndex} className="p-2 border-b border-r border-slate-300 text-center text-sm font-semibold text-slate-500 min-w-[150px]">
                                    {getColumnName(colIndex)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-50">
                                <td className="w-12 min-w-[3rem] p-2 border-b border-r border-slate-300 text-center text-xs font-medium text-slate-400 sticky left-0 bg-slate-50 z-10">{rowIndex + 1}</td>
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                        className={`p-0 border-b border-r border-slate-300 text-sm text-slate-800 whitespace-nowrap ${rowIndex === 0 ? 'font-bold bg-slate-50' : ''} ${editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'border-2 border-blue-500' : ''}`}
                                    >
                                        {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                                            <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                                                onBlur={handleCellBlur}
                                                autoFocus
                                                className="w-full h-full p-2 bg-white outline-none"
                                            />
                                        ) : (
                                            <div className="p-2 h-full">
                                                {cell || <>&nbsp;</>}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Spreadsheet;
