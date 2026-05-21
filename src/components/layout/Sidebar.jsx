import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CaretDoubleLeft,
  SquaresFour,
  Package,
  ShoppingCart,
  Users,
  ChatCircleDots,
  Stethoscope,
  ChatTeardrop,
  SignOut,
  Tooth,
  X,
  EnvelopeSimple
} from '@phosphor-icons/react';
import clsx from 'clsx';
import { useClinic } from '../../context/ClinicContext';

const menuMain = [
  { label: 'Dashboard', icon: SquaresFour, path: '/' },
  { label: 'Appointments', icon: ChatCircleDots, path: '/appointments' },
  { label: 'Inquiries', icon: EnvelopeSimple, path: '/inquiries' },
  { label: 'Patients', icon: Users, path: '/patients' },
  { label: 'Billing', icon: ShoppingCart, path: '/billing' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
];

const menuFooter = [
  { label: 'Help', icon: ChatTeardrop, path: '/help' },
];

const MenuItem = ({ item, isActive, onClick }) => {
  const { clinic } = useClinic();
  const Icon = item.icon;
  const content = (
    <li
      onClick={onClick}
      className={clsx(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-colors cursor-pointer text-[13px]',
        isActive
          ? 'bg-primary/15 text-text-main font-semibold'
          : 'text-text-muted hover:bg-bg-body hover:text-text-main'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
      )}
      <Icon
        size={18}
        weight={isActive ? 'fill' : 'regular'}
        className={isActive ? 'text-primary' : ''}
      />
      {item.label}
    </li>
  );

  return item.path ? <Link to={item.path}>{content}</Link> : content;
};

export default function Sidebar({ onClose }) {
  const { clinic, clinics, activeClinicId, setClinicId } = useClinic();
  const location = useLocation();

  return (
    <aside className="w-[260px] h-full bg-bg-card rounded-2xl flex flex-col shadow-sm border border-border-color shrink-0">
      <div className="p-6 flex items-center justify-between border-b border-border-color">
        <div className="flex items-center gap-2.5 font-semibold text-base">
          <div className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
            <Tooth size={18} weight="bold" />
          </div>
          <span className="text-text-main">{clinic.name.split(" ")[0]}</span>
        </div>
        {onClose ? (
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X size={20} weight="bold" />
          </button>
        ) : (
          <button className="text-text-muted hover:text-text-main transition-colors">
            <CaretDoubleLeft size={20} />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto pr-3 custom-scrollbar">
        <div className="text-[11px] text-text-muted uppercase font-semibold mx-3 mb-2 tracking-wide">Main Menu</div>
        <ul>
          {menuMain.map((item, idx) => (
            <MenuItem key={idx} item={item} isActive={location.pathname === item.path} onClick={onClose} />
          ))}
        </ul>
      </div>

      <div className="px-5 pt-0 pb-4">
        <ul>
          {menuFooter.map((item, idx) => (
            <MenuItem key={idx} item={item} onClick={onClose} />
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-border-color space-y-3">
        <div className="flex flex-col gap-1.5 border border-border-color p-2.5 rounded-xl bg-bg-body">
          <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wide px-1">Active Clinic</label>
          <select
            value={activeClinicId}
            onChange={(e) => setClinicId(e.target.value)}
            className="w-full bg-bg-card border border-border-color text-text-main text-xs rounded-lg p-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {Object.values(clinics).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-text-muted text-center">
          Powered by{" "}
          <a href="https://viransihq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            Viransi HQ
          </a>
        </p>
      </div>
    </aside>
  );
}
