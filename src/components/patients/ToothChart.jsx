import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info } from '@phosphor-icons/react';

// FDI numbering by quadrant
const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];
const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];

const quadrantLabel = (num) => {
  const q = Math.floor(num / 10);
  return { 1: 'Upper Right', 2: 'Upper Left', 3: 'Lower Left', 4: 'Lower Right' }[q];
};

const positionName = (num) => {
  const pos = num % 10;
  return {
    1: 'Central Incisor',
    2: 'Lateral Incisor',
    3: 'Canine',
    4: 'First Premolar',
    5: 'Second Premolar',
    6: 'First Molar',
    7: 'Second Molar',
    8: 'Third Molar',
  }[pos];
};

const toothType = (num) => {
  const pos = num % 10;
  if (pos <= 2) return 'incisor';
  if (pos === 3) return 'canine';
  if (pos <= 5) return 'premolar';
  return 'molar';
};

// Condition palette — dark-theme friendly fills + light-ish text
export const conditionMeta = {
  healthy:          { label: 'Healthy',          fill: '#E2E8F0', stroke: '#94A3B8', text: '#0a0e1a',  category: 'Normal' },
  filled:           { label: 'Filled',           fill: '#60A5FA', stroke: '#3B82F6', text: '#0a0e1a',  category: 'Restoration' },
  needs_treatment:  { label: 'Cavity / Caries',  fill: '#F87171', stroke: '#DC2626', text: '#0a0e1a',  category: 'Pathology' },
  extracted:        { label: 'Extracted',        fill: '#374151', stroke: '#1F2937', text: '#9CA3AF',  category: 'Missing' },
  crown:            { label: 'Crown',            fill: '#FBBF24', stroke: '#D97706', text: '#0a0e1a',  category: 'Restoration' },
  root_canal:       { label: 'Root Canal',       fill: '#A78BFA', stroke: '#7C3AED', text: '#0a0e1a',  category: 'Endodontics' },
  bridge:           { label: 'Bridge',           fill: '#FB923C', stroke: '#EA580C', text: '#0a0e1a',  category: 'Restoration' },
  implant:          { label: 'Implant',          fill: '#22D3EE', stroke: '#0891B2', text: '#0a0e1a',  category: 'Restoration' },
  braces:           { label: 'Braces',           fill: '#F472B6', stroke: '#DB2777', text: '#0a0e1a',  category: 'Orthodontic' },
  veneer:           { label: 'Veneer',           fill: '#34D399', stroke: '#059669', text: '#0a0e1a',  category: 'Cosmetic' },
};

const conditions = Object.keys(conditionMeta);

// SVG path templates per tooth type (drawn pointing up; flipped via CSS for lower arch)
// viewBox: 0 0 36 48
const toothPaths = {
  incisor: 'M10,4 Q12,2 18,2 Q24,2 26,4 L27,16 Q28,22 26,28 Q24,33 22,38 Q20,42 18,42 Q16,42 14,38 Q12,33 10,28 Q8,22 9,16 Z',
  canine:  'M11,4 Q14,2 18,2 Q22,2 25,4 L26,14 Q28,18 27,24 Q26,30 23,36 Q20,42 18,44 Q16,42 13,36 Q10,30 9,24 Q8,18 10,14 Z',
  premolar:'M8,4 Q11,2 18,2 Q25,2 28,4 L29,12 Q30,18 28,24 Q27,30 25,36 Q22,40 18,40 Q14,40 11,36 Q9,30 8,24 Q6,18 7,12 Z',
  molar:   'M6,4 Q10,2 18,2 Q26,2 30,4 L31,12 Q32,18 30,24 Q29,30 27,34 Q24,38 18,38 Q12,38 9,34 Q7,30 6,24 Q4,18 5,12 Z',
};

const cuspMarkers = {
  incisor: [],
  canine: [[18, 22]],
  premolar: [[14, 22], [22, 22]],
  molar: [[12, 18], [24, 18], [12, 26], [24, 26]],
};

// Outline (root/crown contour overlay) — subtle inner curve
const innerCurve = {
  incisor: 'M14,8 Q18,7 22,8',
  canine:  'M14,8 Q18,7 22,8',
  premolar:'M12,8 Q18,7 24,8',
  molar:   'M10,8 Q18,7 26,8',
};

function ToothSvg({ num, condition = 'healthy', isLower = false, hover = false, isSelected = false }) {
  const type = toothType(num);
  const meta = conditionMeta[condition] || conditionMeta.healthy;
  const path = toothPaths[type];
  const cusps = cuspMarkers[type];
  const isExtracted = condition === 'extracted';
  const isBraces = condition === 'braces';

  return (
    <svg
      viewBox="0 0 36 48"
      className={`w-full h-auto transition-transform ${isLower ? 'rotate-180' : ''} ${hover ? 'scale-110' : ''} ${isSelected ? 'scale-105' : ''}`}
      style={{ filter: hover || isSelected ? `drop-shadow(0 0 6px ${meta.stroke}66)` : 'none' }}
    >
      <path
        d={path}
        fill={isExtracted ? meta.fill : meta.fill}
        stroke={meta.stroke}
        strokeWidth="1.5"
        opacity={isExtracted ? 0.35 : 1}
      />
      {!isExtracted && (
        <>
          <path
            d={innerCurve[type]}
            fill="none"
            stroke={meta.stroke}
            strokeWidth="0.7"
            opacity="0.5"
          />
          {cusps.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.4" fill={meta.stroke} opacity="0.45" />
          ))}
        </>
      )}
      {isExtracted && (
        <line x1="6" y1="6" x2="30" y2="40" stroke={meta.stroke} strokeWidth="2" />
      )}
      {isBraces && (
        <>
          <rect x="13" y="14" width="10" height="5" rx="1" fill="#FFFFFF" stroke={meta.stroke} strokeWidth="0.8" />
          <line x1="6" y1="16.5" x2="30" y2="16.5" stroke={meta.stroke} strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
}

function ConditionPicker({ position, currentCondition, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const grouped = useMemo(() => {
    const groups = {};
    conditions.forEach(c => {
      const cat = conditionMeta[c].category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[80] w-56 bg-bg-card border border-border-color rounded-xl shadow-2xl py-2 max-h-[60vh] overflow-y-auto custom-scrollbar"
    >
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-text-muted font-bold">{cat}</div>
          {items.map(cond => {
            const meta = conditionMeta[cond];
            const isCurrent = cond === currentCondition;
            return (
              <button
                key={cond}
                onClick={() => { onSelect(cond); onClose(); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-colors ${
                  isCurrent ? 'bg-bg-body' : 'hover:bg-bg-body/50'
                }`}
              >
                <span
                  className="w-4 h-4 rounded shrink-0 border"
                  style={{ background: meta.fill, borderColor: meta.stroke }}
                />
                <span className={`flex-1 ${isCurrent ? 'font-semibold text-primary' : 'text-text-main'}`}>
                  {meta.label}
                </span>
                {isCurrent && <Check size={14} weight="bold" className="text-primary" />}
              </button>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}

const ToothCell = ({ num, condition, isLower, editable, onSelectCondition, hovered, setHovered, openPickerFor, setOpenPickerFor }) => {
  const cellRef = useRef(null);
  const isHovered = hovered === num;
  const isOpen = openPickerFor === num;
  const meta = conditionMeta[condition] || conditionMeta.healthy;
  const name = `${quadrantLabel(num)} ${positionName(num)}`;

  const handleClick = (e) => {
    if (!editable) return;
    const rect = cellRef.current.getBoundingClientRect();
    setOpenPickerFor({
      num,
      top: isLower ? rect.bottom + 6 : rect.top - 6 - 280,
      left: Math.min(window.innerWidth - 240, Math.max(10, rect.left + rect.width / 2 - 112)),
    });
  };

  return (
    <div
      ref={cellRef}
      onMouseEnter={() => setHovered(num)}
      onMouseLeave={() => setHovered(null)}
      onClick={handleClick}
      className={`relative flex flex-col items-center ${editable ? 'cursor-pointer' : 'cursor-default'} group`}
      style={{ width: 30 }}
    >
      <div className="w-7 h-9 relative">
        <ToothSvg num={num} condition={condition} isLower={isLower} hover={isHovered} isSelected={isOpen} />
      </div>
      <span className={`text-[10px] mt-1 font-mono font-semibold ${isHovered ? 'text-primary' : 'text-text-muted'}`}>{num}</span>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-30 px-3 py-2 bg-bg-card border border-border-color rounded-lg shadow-xl whitespace-nowrap pointer-events-none ${isLower ? 'top-full mt-2' : 'bottom-full mb-2'}`}
          >
            <div className="text-[11px] font-bold text-text-main">{name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2.5 h-2.5 rounded-sm border"
                style={{ background: meta.fill, borderColor: meta.stroke }}
              />
              <span className="text-[10px] text-text-muted">#{num} • {meta.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ToothChart({ conditions: teethConditions = {}, editable = false, onChange }) {
  const [hovered, setHovered] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  const handleSelect = (toothNum, cond) => {
    if (!editable) return;
    const updated = { ...teethConditions };
    if (cond === 'healthy') delete updated[toothNum];
    else updated[toothNum] = cond;
    onChange?.(updated);
  };

  const categorisedLegend = useMemo(() => {
    const groups = {};
    Object.entries(conditionMeta).forEach(([key, meta]) => {
      if (!groups[meta.category]) groups[meta.category] = [];
      groups[meta.category].push({ key, ...meta });
    });
    return groups;
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-bg-body p-4 md:p-6 rounded-xl border border-border-color">
        {editable && (
          <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
            <Info size={14} />
            <span>Click a tooth to set its condition. Hover to see the tooth name.</span>
          </div>
        )}

        {/* Upper arch */}
        <div className="mb-3">
          <div className="text-center text-[10px] font-bold tracking-wider text-text-muted uppercase mb-3">Upper Arch</div>
          <div className="flex items-end justify-center gap-1">
            {upperRight.map(num => (
              <ToothCell
                key={num}
                num={num}
                condition={teethConditions[num] || 'healthy'}
                isLower={false}
                editable={editable}
                hovered={hovered}
                setHovered={setHovered}
                openPickerFor={openPicker?.num}
                setOpenPickerFor={setOpenPicker}
              />
            ))}
            <div className="w-2" />
            {upperLeft.map(num => (
              <ToothCell
                key={num}
                num={num}
                condition={teethConditions[num] || 'healthy'}
                isLower={false}
                editable={editable}
                hovered={hovered}
                setHovered={setHovered}
                openPickerFor={openPicker?.num}
                setOpenPickerFor={setOpenPicker}
              />
            ))}
          </div>
        </div>

        {/* Midline */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border-color" />
          <div className="text-[9px] uppercase tracking-widest text-text-muted">Midline</div>
          <div className="flex-1 h-px bg-border-color" />
        </div>

        {/* Lower arch */}
        <div>
          <div className="flex items-start justify-center gap-1">
            {lowerRight.map(num => (
              <ToothCell
                key={num}
                num={num}
                condition={teethConditions[num] || 'healthy'}
                isLower={true}
                editable={editable}
                hovered={hovered}
                setHovered={setHovered}
                openPickerFor={openPicker?.num}
                setOpenPickerFor={setOpenPicker}
              />
            ))}
            <div className="w-2" />
            {lowerLeft.map(num => (
              <ToothCell
                key={num}
                num={num}
                condition={teethConditions[num] || 'healthy'}
                isLower={true}
                editable={editable}
                hovered={hovered}
                setHovered={setHovered}
                openPickerFor={openPicker?.num}
                setOpenPickerFor={setOpenPicker}
              />
            ))}
          </div>
          <div className="text-center text-[10px] font-bold tracking-wider text-text-muted uppercase mt-3">Lower Arch</div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-bg-body rounded-xl border border-border-color p-4">
        <button
          onClick={() => setShowLegend(s => !s)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Legend by Category</span>
          <span className="text-[10px] text-text-muted">{showLegend ? 'Hide' : 'Show'}</span>
        </button>
        {showLegend && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {Object.entries(categorisedLegend).map(([cat, items]) => (
              <div key={cat}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">{cat}</div>
                <div className="space-y-1">
                  {items.map(it => (
                    <div key={it.key} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded border shrink-0"
                        style={{ background: it.fill, borderColor: it.stroke }}
                      />
                      <span className="text-text-muted">{it.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Condition Picker (portal-like fixed positioning) */}
      <AnimatePresence>
        {openPicker && (
          <ConditionPicker
            position={openPicker}
            currentCondition={teethConditions[openPicker.num] || 'healthy'}
            onSelect={(c) => handleSelect(openPicker.num, c)}
            onClose={() => setOpenPicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
