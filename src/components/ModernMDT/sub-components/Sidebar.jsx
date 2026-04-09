import React from 'react';
import { fetchNui } from '../utils/nui';
import {
  LayoutDashboard, Radio, UserSearch, Car, Crosshair,
  Scale, ScanLine, FileWarning, AlertTriangle, LogOut, Shield, FileText,
  Siren, ChevronRight
} from 'lucide-react';

const ICONS = {
  dashboard: LayoutDashboard,
  dispatch:  Radio,
  person:    UserSearch,
  vehicle:   Car,
  reports:   FileText,
  weapon:    Crosshair,
  charges:   Scale,
  alpr:      ScanLine,
  warrants:  FileWarning,
  bolos:     AlertTriangle,
};

export default function Sidebar({ tabs, activeTab, onTabChange, player, onClose, mode }) {
  const handlePanic = () => {
    fetchNui('panic');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={22} className="sidebar-icon" />
        </div>
        <div className="sidebar-title">
          <span className="sidebar-brand">LSPD</span>
          <span className="sidebar-sub">Mobile Data Terminal</span>
        </div>
      </div>

      <div className="sidebar-officer">
        <div className="officer-avatar">
          <Shield size={14} />
        </div>
        <div className="officer-info">
          <div className="officer-name">{player.name || 'Officer'}</div>
          <div className="officer-detail">{player.callsign || 'N/A'} &bull; {player.grade || 'Officer'}</div>
        </div>
        <div className="officer-status-dot" />
      </div>

      <nav className="sidebar-nav">
        {tabs.map(tab => {
          const Icon = ICONS[tab.id] || LayoutDashboard;
          return (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={12} className="nav-arrow" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-panic" onClick={handlePanic}>
          <Siren size={14} />
          PANIC
        </button>
        <button className="btn btn-close" onClick={onClose}>
          <LogOut size={13} />
          <span>{mode === 'dui' ? 'Exit MDT' : 'Close'}</span>
        </button>
      </div>
    </aside>
  );
}
