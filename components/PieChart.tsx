import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;

  const getColorClass = (tailwindClass: string) => {
      // Mapeia classes de cor do Tailwind para códigos hexadecimais para o preenchimento SVG
      const colorMap: Record<string, string> = {
        'bg-slate-400': '#94a3b8',
        'bg-stone-500': '#78716c',
        'bg-amber-800': '#92400e',
        'bg-gray-600': '#4b5563',
        'bg-orange-500': '#f97316',
        'bg-amber-500': '#f59e0b',
        'bg-red-700': '#b91c1c',
        'bg-blue-500': '#3b82f6',
        'bg-yellow-400': '#facc15',
        'bg-cyan-700': '#0e7490',
        'bg-indigo-500': '#6366f1',
        'bg-sky-300': '#7dd3fc',
        'bg-rose-400': '#fb7185',
        'bg-lime-600': '#65a30d',
      };
      return colorMap[tailwindClass] || '#cccccc'; // Cinza padrão
  };

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const [startX, startY] = getCoordinatesForPercent(startAngle);
            startAngle += percentage;
            const [endX, endY] = getCoordinatesForPercent(startAngle);

            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            const pathData = [
              `M ${startX} ${startY}`, // Mover
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arco
              `L 0 0`, // Linha para o centro
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={getColorClass(item.color)}
                className="transition-transform duration-200 hover:scale-105 cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
      <div className="w-full max-w-xs">
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
              <span className="flex-1 text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-800">
                {((item.value / total) * 100).toFixed(2).replace('.', ',')}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChart;