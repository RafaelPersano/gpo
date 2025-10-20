import React from 'react';
import type { Tab } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import { ProposalIcon } from './icons/ProposalIcon';
import { SheetIcon } from './icons/SheetIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';
import { SpreadsheetIcon } from './icons/SpreadsheetIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { WandIcon } from './icons/WandIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userRole: 'admin' | 'user' | null;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  tabName: Tab;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 mr-3 flex-shrink-0' })}
      <span className="truncate">{label}</span>
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 p-4 shadow-sm hidden md:flex flex-col h-screen sticky top-0">
      <nav className="flex-grow">
        <ul className="space-y-2">
          <NavItem
            icon={<ChartIcon />}
            label="Visão Geral"
            tabName="overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <NavItem
            icon={<ProposalIcon />}
            label="Proposta & Mkt"
            tabName="proposal"
            isActive={activeTab === 'proposal'}
            onClick={() => setActiveTab('proposal')}
          />
          <NavItem
            icon={<SheetIcon />}
            label="Tabelas do Projeto"
            tabName="tables"
            isActive={activeTab === 'tables'}
            onClick={() => setActiveTab('tables')}
          />
           <NavItem
            icon={<CalculatorIcon />}
            label="Análises & Ferramentas"
            tabName="analysis"
            isActive={activeTab === 'analysis'}
            onClick={() => setActiveTab('analysis')}
          />
          <NavItem
            icon={<BookOpenIcon />}
            label="Base de Conhecimento"
            tabName="knowledge"
            isActive={activeTab === 'knowledge'}
            onClick={() => setActiveTab('knowledge')}
          />
           <NavItem
            icon={<UsersIcon />}
            label="Sobre Nós"
            tabName="about"
            isActive={activeTab === 'about'}
            onClick={() => setActiveTab('about')}
          />
           <NavItem
            icon={<SpreadsheetIcon />}
            label="Planilha Editável"
            tabName="spreadsheet"
            isActive={activeTab === 'spreadsheet'}
            onClick={() => setActiveTab('spreadsheet')}
          />
           <NavItem
            icon={<WandIcon />}
            label="Gerador Excel"
            tabName="excel"
            isActive={activeTab === 'excel'}
            onClick={() => setActiveTab('excel')}
          />
          {userRole === 'admin' && (
             <NavItem
                icon={<ShieldIcon />}
                label="Painel Admin"
                tabName="admin"
                isActive={activeTab === 'admin'}
                onClick={() => setActiveTab('admin')}
            />
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;