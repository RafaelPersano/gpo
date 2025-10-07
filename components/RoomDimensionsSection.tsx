
import React from 'react';
import type { RoomDimension } from '../types.ts';
import { RulerIcon } from './icons/RulerIcon.tsx';

const RoomDimensionsSection: React.FC<{ dimensions: RoomDimension[] | undefined }> = ({ dimensions }) => {
    if (!dimensions || dimensions.length === 0) {
        return null; // Don't render if no data
    }
  
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Quadro de Áreas</h2>
        <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <ul className="space-y-2">
            {dimensions.map((dim, index) => (
              <li key={index} className="flex justify-between items-center text-sm py-2 border-b border-slate-200 last:border-b-0">
                <span className="text-slate-600">{dim.name}</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                  {dim.area.toFixed(1).replace('.', ',')} m²
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};
export default RoomDimensionsSection;
