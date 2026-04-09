import React, { useState, useEffect } from 'react';
import { fetchNui } from '../utils/nui';
import { FileWarning, X, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Warrants() {
  const [warrants, setWarrants] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIX 1: loadWarrants muss eine Funktion sein, kein Array!
  const loadWarrants = async () => {
    setLoading(true);
    try {
      const data = await fetchNui('getWarrants');
      // Hier nutzen wir die Sicherheitslogik: Falls data kein Array ist, nimm []
      setWarrants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load warrants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadWarrants(); 
  }, []);

  const revokeWarrant = async (id) => {
    await fetchNui('revokeWarrant', { id });
    setWarrants(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="page warrants">
      <div className="page-header">
        <h2>Active Warrants</h2>
        <div className="header-actions">
          <span className="badge badge-danger">{warrants.length} active</span>
          <button className="btn btn-sm" onClick={loadWarrants} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="warrants-list">
        {warrants.length === 0 && !loading && (
          <div className="empty-state">
            <FileWarning size={28} />
            <p>No active warrants</p>
          </div>
        )}

        {/* FIX 2: Nutze 'w' (Warrant) statt 'r' (Report) im map, passend zu deinem Code unten */}
        {warrants.map((w) => (
          <div key={w.id} className="warrant-card">
            <div className="warrant-header">
              <div className="warrant-subject">
                <AlertTriangle size={14} />
                <strong>{w.name || "Unknown Citizen"}</strong>
                <span className="text-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  ({w.citizenid || "N/A"})
                </span>
              </div>
              <span className="warrant-id">#{w.id}</span>
            </div>

            <div className="warrant-reason">{w.reason || "No charges specified"}</div>

            <div className="warrant-footer">
              <div className="warrant-meta">
                <Clock size={11} />
                {w.created_at ? new Date(w.created_at).toLocaleDateString() : "N/A"}
                <span> &bull; {w.officer_name || "System"}</span>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => revokeWarrant(w.id)}>
                <X size={11} /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}