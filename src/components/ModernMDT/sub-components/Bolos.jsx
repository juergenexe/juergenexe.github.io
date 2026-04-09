import React, { useState, useEffect } from 'react';
import { fetchNui } from '../utils/nui';
import { AlertTriangle, Plus, X, Clock, RefreshCw, Eye } from 'lucide-react';

export default function Bolos() {
  const [bolos, setBolos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'person', title: '', description: '', plate: '' });

  // SICHERHEITS-CHECK: Wandle bolos immer in eine Liste um
  const safeBolos = Array.isArray(bolos) ? bolos : [];

  useEffect(() => { loadBolos(); }, []);

  const loadBolos = async () => {
    setLoading(true);
    const data = await fetchNui('getBolos');
    // Sicherstellen, dass wir nur Arrays im State speichern
    setBolos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const createBolo = async () => {
    if (!form.title || !form.description) return;
    await fetchNui('createBolo', form);
    setForm({ type: 'person', title: '', description: '', plate: '' });
    setShowCreate(false);
    loadBolos();
  };

  const revokeBolo = async (id) => {
    await fetchNui('revokeBolo', { id });
    setBolos(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="page bolos">
      <div className="page-header">
        <h2>BOLOs</h2>
        <div className="header-actions">
          <span className="badge badge-warning">{safeBolos.length} active</span>
          <button className="btn btn-sm btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={11} /> New BOLO
          </button>
          <button className="btn btn-sm" onClick={loadBolos} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bolo-form p-4 bg-zinc-900/50 rounded-xl mb-4 border border-zinc-800">
          <div className="flex gap-2 mb-2">
            <select
              value={form.type}
              onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-1/3"
            >
              <option value="person">Person</option>
              <option value="vehicle">Vehicle</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="BOLO Title"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="flex-1"
              autoFocus
            />
          </div>
          <textarea
            placeholder="Description..."
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="mb-2"
          />
          {form.type === 'vehicle' && (
            <input
              type="text"
              placeholder="License plate (optional)"
              value={form.plate}
              onChange={e => setForm(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
              className="mb-2"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button className="btn btn-primary" onClick={createBolo} disabled={!form.title || !form.description}>
              <Eye size={13} /> Create
            </button>
            <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bolos-list">
        {safeBolos.length === 0 && !loading && (
          <div className="empty-state">
            <AlertTriangle size={28} />
            <p>No active BOLOs</p>
          </div>
        )}

        {safeBolos.map(b => (
          <div key={b.id} className={`bolo-card bolo-${b.type}`}>
            <div className="bolo-header">
              <span className={`bolo-type type-${b.type}`}>{b.type?.toUpperCase()}</span>
              <strong>{b.title}</strong>
              {b.plate && <span className="bolo-plate">{b.plate}</span>}
            </div>
            <div className="bolo-desc">{b.description}</div>
            <div className="bolo-footer">
              <div className="bolo-meta">
                <Clock size={11} />
                {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'} &bull; {b.officer_name || 'Officer'}
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => revokeBolo(b.id)}>
                <X size={11} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}