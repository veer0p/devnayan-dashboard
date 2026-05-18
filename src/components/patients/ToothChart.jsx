import React, { useState } from 'react';

// FDI Numbering System for Adults
const upperArch = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerArch = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const conditionStyles = {
  healthy: { bg: 'bg-bg-card', border: 'border-border-color', text: 'text-text-main', label: 'Healthy' },
  filled: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', label: 'Filled' },
  needs_treatment: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', label: 'Needs Treatment' },
  extracted: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-400', label: 'Extracted' },
  crown: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', label: 'Crown' }
};

const Tooth = ({ num, condition = 'healthy' }) => {
  const style = conditionStyles[condition] || conditionStyles.healthy;
  const isExtracted = condition === 'extracted';

  return (
    <div 
      className="group relative flex flex-col items-center justify-center cursor-pointer"
      title={`Tooth ${num}: ${style.label}`}
    >
      <div className={`w-8 h-10 rounded-[4px] border ${style.bg} ${style.border} flex items-center justify-center transition-colors shadow-sm`}>
        {isExtracted ? (
          <span className="text-xl leading-none text-gray-300 font-light">×</span>
        ) : (
          <div className="w-4 h-6 rounded-t-sm bg-bg-card/50 border border-black/5" />
        )}
      </div>
      <span className={`text-[10px] mt-1 font-semibold ${style.text}`}>{num}</span>
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
        Tooth {num}: {style.label}
      </div>
    </div>
  );
};

export default function ToothChart({ conditions = {}, editable = false, onChange = null }) {
  // Simple CSS Grid based layout for the arches
  return (
    <div className="w-full flex flex-col items-center bg-bg-body p-6 rounded-xl border border-border-color">
      
      {/* Upper Arch */}
      <div className="w-full mb-8">
        <div className="text-center text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider">Upper Arch</div>
        <div className="flex justify-center gap-1 sm:gap-2">
          {/* Right Quadrant (11-18) */}
          <div className="flex justify-end gap-1 sm:gap-2 border-r-2 border-border-color pr-2 sm:pr-4">
            {upperArch.slice(0, 8).map(num => (
              <Tooth key={num} num={num} condition={conditions[num]} />
            ))}
          </div>
          {/* Left Quadrant (21-28) */}
          <div className="flex justify-start gap-1 sm:gap-2 pl-2 sm:pl-4">
            {upperArch.slice(8, 16).map(num => (
              <Tooth key={num} num={num} condition={conditions[num]} />
            ))}
          </div>
        </div>
      </div>

      {/* Lower Arch */}
      <div className="w-full mb-6">
        <div className="flex justify-center gap-1 sm:gap-2">
          {/* Right Quadrant (41-48) */}
          <div className="flex justify-end gap-1 sm:gap-2 border-r-2 border-border-color pr-2 sm:pr-4">
            {lowerArch.slice(0, 8).map(num => (
              <Tooth key={num} num={num} condition={conditions[num]} />
            ))}
          </div>
          {/* Left Quadrant (31-38) */}
          <div className="flex justify-start gap-1 sm:gap-2 pl-2 sm:pl-4">
            {lowerArch.slice(8, 16).map(num => (
              <Tooth key={num} num={num} condition={conditions[num]} />
            ))}
          </div>
        </div>
        <div className="text-center text-xs font-semibold text-text-muted mt-4 uppercase tracking-wider">Lower Arch</div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border-color w-full flex flex-wrap justify-center gap-4">
        {Object.entries(conditionStyles).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm border ${style.bg} ${style.border}`}></div>
            <span className="text-[11px] text-text-muted font-medium">{style.label}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
}
