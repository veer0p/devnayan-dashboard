import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  CaretDoubleLeft,
  SquaresFour,
  Package,
  ShoppingCart,
  Users,
  ChatCircleDots,
  User,
  ChatTeardrop,
  SignOut,
  Tooth,
  X
} from '@phosphor-icons/react';
import clsx from 'clsx';

const menuMain = [
  { label: 'Dashboard', icon: SquaresFour, path: '/' },
  { label: 'Appointments', icon: ChatCircleDots, path: '/appointments' },
  { label: 'Patients', icon: Users, path: '/patients' },
  { label: 'Billing', icon: ShoppingCart, path: '/billing' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
];

const menuFooter = [
  { label: 'Clinic Profile', icon: User, path: '/profile' },
  { label: 'Help', icon: ChatTeardrop, path: '/help' },
];

const MenuItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  const content = (
    <motion.li
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer text-sm font-medium",
        isActive
          ? "bg-primary/15 text-primary font-semibold border-l-4 border-primary"
          : "text-text-muted hover:bg-primary/10 hover:text-primary"
      )}
    >
      <Icon size={20} weight={isActive ? "fill" : "regular"} />
      {item.label}
    </motion.li>
  );

  return item.path ? <Link to={item.path}>{content}</Link> : content;
};

export default function Sidebar({ onClose }) {
  const location = useLocation();

  return (
    <aside className="w-[260px] h-full bg-bg-card rounded-2xl flex flex-col shadow-sm border border-border-color shrink-0">
      <div className="p-6 flex items-center justify-between border-b border-border-color">
        <div className="flex items-center gap-2.5 font-semibold text-base">
          <div className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
            <Tooth size={18} weight="bold" />
          </div>
          <span className="text-text-main">Devnayan</span>
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
        <div className="flex items-center gap-2.5 p-2.5 border border-border-color rounded-xl cursor-pointer hover:bg-bg-body transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
            DC
          </div>
          <div className="text-[13px] font-medium text-text-main flex-1">Dr. Chintan</div>
          <SignOut size={18} className="text-text-muted" />
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
