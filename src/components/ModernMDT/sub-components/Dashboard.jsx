import React, { useState, useEffect } from 'react';
import { fetchNui } from '../utils/nui';
import { Users, Radio, Shield, Clock, Activity, CircleDot, MapPin, Plus, X, MessageSquare, AlertTriangle, Edit3 } from 'lucide-react';

const STATUS_COLORS = {
  available:   '#22c55e',
  busy:        '#f59e0b',
  unavailable: '#ef4444',
  training:    '#3b82f6',
};

const STATUS_LABELS = {
  available:   '10-8',
  busy:        '10-6',
  unavailable: '10-7',
  training:    '10-11',
};

const PRIORITY_COLORS = {
  normal:    'var(--accent)',
  important: 'var(--warning)',
  urgent:    'var(--danger)',
};

export default function Dashboard({ player, officers }) {
  const [myStatus, setMyStatus] = useState('available');
  const [bulletins, setBulletins] = useState([]); // Initialer State ist ein Array
  const [showBulletinForm, setShowBulletinForm] = useState(false);
  const [bulletinForm, setBulletinForm] = useState({ content: '', priority: 'normal' });
  const [editCallsign, setEditCallsign] = useState(false);
  const [callsignInput, setCallsignInput] = useState('');

  // --- LOGIK-FIX ---
  // Wir stellen sicher, dass bulletins IMMER eine Liste ist, 
  // bevor wir überhaupt zum Rendering kommen.
  const safeBulletins = Array.isArray(bulletins) ? bulletins : [];


  const officerList = Object.values(officers || {});
  const available   = officerList.filter(o => o.status === 'available').length;
  const busy        = officerList.filter(o => o.status === 'busy').length;
  const total       = officerList.length;

  useEffect(() => { loadBulletins(); }, []);

  const loadBulletins = async () => {
    const data = await fetchNui('getBulletins');
    setBulletins(Array.isArray(data) ? data : []);
  };

  const changeStatus = async (status) => {
    setMyStatus(status);
    await fetchNui('setStatus', { status });
  };

  const gpsToOfficer = async (src) => {
    await fetchNui('gpsToOfficer', { source: src });
  };

  const submitBulletin = async () => {
    if (!bulletinForm.content.trim()) return;
    await fetchNui('createBulletin', bulletinForm);
    setBulletinForm({ content: '', priority: 'normal' });
    setShowBulletinForm(false);
    loadBulletins();
  };

  const deleteBulletin = async (id) => {
    await fetchNui('deleteBulletin', { id });
    setBulletins(prev => prev.filter(b => b.id !== id));
  };

  const saveCallsign = async () => {
    if (!callsignInput.trim()) return;
    await fetchNui('setCallsign', { callsign: callsignInput.trim() });
    setEditCallsign(false);
  };

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="dash-clock">
          <Clock size={13} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="dash-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <Users size={20} />
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">On Duty</div>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={20} />
          <div>
            <div className="stat-value">{available}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card">
          <Radio size={20} />
          <div>
            <div className="stat-value">{busy}</div>
            <div className="stat-label">Busy</div>
          </div>
        </div>
        <div className="stat-card">
          <Shield size={20} />
          <div>
            <div className="stat-value">{player.callsign || '—'}</div>
            <div className="stat-label">Callsign</div>
          </div>
        </div>
      </div>

      {/* Status + Callsign */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>My Status</h3>
          {!editCallsign ? (
            <button className="btn btn-xs" onClick={() => { setEditCallsign(true); setCallsignInput(player.callsign || ''); }}>
              <Edit3 size={10} /> Set Callsign
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="text"
                value={callsignInput}
                onChange={e => setCallsignInput(e.target.value)}
                placeholder="1-A-12"
                style={{ width: '80px', padding: '4px 8px', fontSize: '11px' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && saveCallsign()}
              />
              <button className="btn btn-xs btn-primary" onClick={saveCallsign}>Save</button>
              <button className="btn btn-xs" onClick={() => setEditCallsign(false)}>Cancel</button>
            </div>
          )}
        </div>
        <div className="status-buttons">
          {Object.keys(STATUS_COLORS).map(s => (
            <button
              key={s}
              className={`btn btn-status ${myStatus === s ? 'active' : ''}`}
              style={{ '--status-color': STATUS_COLORS[s] }}
              onClick={() => changeStatus(s)}
            >
              <CircleDot size={12} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="status-code">{STATUS_LABELS[s]}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Active Officers */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Active Units ({total})
          </h3>
          <div className="table-wrapper" style={{ flex: 1, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Callsign</th>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {officerList.length === 0 && (
                  <tr><td colSpan={5} className="empty">No officers on duty</td></tr>
                )}
                {officerList.map((o, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.callsign}</td>
                    <td>{o.name}</td>
                    <td>{o.job?.toUpperCase()}</td>
                    <td>
                      <span className="status-dot" style={{ background: STATUS_COLORS[o.status] || '#888' }} />
                      {o.status}
                    </td>
                    <td>
                      <button className="btn btn-xs" onClick={() => gpsToOfficer(o.source)} title="GPS to officer">
                        <MapPin size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulletin Board */}
        <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <MessageSquare size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
              Bulletins
            </h3>
            <button className="btn btn-xs btn-primary" onClick={() => setShowBulletinForm(!showBulletinForm)}>
              <Plus size={10} />
            </button>
          </div>

          {showBulletinForm && (
            <div style={{ padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <textarea
                rows={2}
                placeholder="Bulletin message..."
                value={bulletinForm.content}
                onChange={e => setBulletinForm(p => ({ ...p, content: e.target.value }))}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <select value={bulletinForm.priority} onChange={e => setBulletinForm(p => ({ ...p, priority: e.target.value }))} style={{ maxWidth: '110px' }}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button className="btn btn-xs btn-primary" onClick={submitBulletin}>Post</button>
                <button className="btn btn-xs" onClick={() => setShowBulletinForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {bulletins.length === 0 && (
              <div className="empty-state small">
                <MessageSquare size={20} />
                <p>No bulletins</p>
              </div>
            )}
            {safeBulletins.map((b) => (
              <div key={b.id} style={{
                padding: '10px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${PRIORITY_COLORS[b.priority] || 'var(--accent)'}`,
                borderRadius: 'var(--radius)',
                fontSize: '12px',
              }}>
                <div style={{ color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '6px' }}>{b.content}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {b.officer_name} &bull; {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  <button className="btn-icon" onClick={() => deleteBulletin(b.id)} style={{ padding: '2px' }}>
                    <X size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
