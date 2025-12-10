import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  colorClass: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, colorClass, icon }) => {
  return (
    <div className={`p-4 rounded-xl shadow-sm bg-white border-l-4 ${colorClass}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
    </div>
  );
};