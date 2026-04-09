import React, { useState, useEffect, useCallback } from 'react';
import { fetchNui, onAnyNuiMessage } from './utils/nui';
import Sidebar from './sub-components/Sidebar';
import Dashboard from './sub-components/Dashboard';
import Dispatch from './sub-components/Dispatch';
import PersonSearch from './sub-components/PersonSearch';
import VehicleSearch from './sub-components/VehicleSearch';
import WeaponSearch from './sub-components/WeaponSearch';
import Charges from './sub-components/Charges';
import ALPRPanel from './sub-components/ALPRPanel';
import Warrants from './sub-components/Warrants';
import Bolos from './sub-components/Bolos';
import Reports from './sub-components/Reports';
import DispatchNotification from './sub-components/DispatchNotification';
import './index.css';
import './App.scss';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'dispatch',  label: 'Dispatch' },
  { id: 'person',    label: 'Person Search' },
  { id: 'vehicle',   label: 'Vehicle Search' },
  { id: 'weapon',    label: 'Weapon Search' },
  { id: 'charges',   label: 'Charges' },
  { id: 'reports',   label: 'Reports' },
  { id: 'alpr',      label: 'ALPR' },
  { id: 'warrants',  label: 'Warrants' },
  { id: 'bolos',     label: 'BOLOs' },
];

export default function App() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('tablet');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [player, setPlayer] = useState({});
  const [officers, setOfficers] = useState({});
  const [bulletins, setBulletins] = useState([]); // FIX 1: Variable deklarieren
  const [calls, setCalls] = useState([]);
  const [penalCode, setPenalCode] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [alprScans, setAlprScans] = useState([]);
  const [panicAlert, setPanicAlert] = useState(null);
  const [bolos, setBolos] = useState([])

  useEffect(() => {
    const cleanup = onAnyNuiMessage((msg) => {
      switch (msg.type) {
        case 'OPEN_MDT':
          setVisible(true);
          setMode(msg.mode || 'tablet');
          if (msg.payload) {
            setPlayer(msg.payload.player || {});
            setOfficers(msg.payload.officers || {});
            setBulletins(msg.payload.bulletins || []); // FIX 2: Daten zuweisen
            setCalls(msg.payload.calls || []);
            setPenalCode(msg.payload.penalCode || []);
          }
          break;
        case 'CLOSE_MDT':
          setVisible(false);
          break;
      }
    });
    return cleanup;
  }, []);

  const handleStateUpdate = useCallback((key, value) => {
    switch (key) {
      case 'officers':    setOfficers(value); break;
      case 'calls':       setCalls(value); break;
      case 'alprScan':    setAlprScans(prev => [value, ...prev].slice(0, 50)); break;
      case 'panicAlert':  setPanicAlert(value); break;
      case 'dispatchNotification': {
        const id = Date.now() + Math.random();
        setNotifications(prev => [{ ...value, _id: id }, ...prev].slice(0, 5));
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n._id !== id));
        }, 15000);
        break;
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    fetchNui('close');
    setVisible(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible && mode === 'tablet') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, mode, handleClose]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleRespondNotification = (call) => {
    fetchNui('respondCall', { id: call.id });
    dismissNotification(call._id);
    if (visible) {
      setActiveTab('dispatch');
    }
  };

  const containerClass = mode === 'dui' ? 'mdt-root mdt-dui' : 'mdt-root mdt-tablet';

  if (!visible) return <div className="p-10 text-cyan-500 font-mono">System wird initialisiert...</div>;

  return (
    <div className="modern-mdt-scope w-full h-full flex flex-col">
      <div className={containerClass}>
        <div className="mdt-container flex flex-row w-full h-full">
          <Sidebar
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            player={player}
            onClose={handleClose}
            mode={mode}
          />
          <main className="mdt-content flex-1 p-5 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                player={player} 
                officers={officers} 
                bulletins={bulletins} // FIX 3: Variable an Komponente weitergeben
                mode={mode} 
              />
            )}
              {activeTab === 'dispatch' && (
                <Dispatch calls={calls} setCalls={setCalls} mode={mode} />
              )}
              {activeTab === 'person' && (
                <PersonSearch mode={mode} />
              )}
              {activeTab === 'vehicle' && (
                <VehicleSearch mode={mode} />
              )}
              {activeTab === 'weapon' && (
                <WeaponSearch mode={mode} />
              )}
              {activeTab === 'charges' && (
                <Charges penalCode={penalCode} mode={mode} />
              )}
              {activeTab === 'reports' && (
                <Reports penalCode={penalCode} mode={mode} player={player} />
              )}
              {activeTab === 'alpr' && (
                <ALPRPanel scans={alprScans} mode={mode} />
              )}
              {activeTab === 'warrants' && (
                <Warrants mode={mode} />
              )}
              {activeTab === 'bolos' && (
                <Bolos mode={mode} />
              )}
            </main>
      </div>
    </div>
  )
</div>
);
}