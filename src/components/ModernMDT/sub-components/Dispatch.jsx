import { useState, useEffect } from 'react';
import { fetchNui } from '../utils/nui';
import { Phone, MapPin, Clock, CheckCircle, AlertCircle, Navigation, RefreshCw, Radio, User } from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { icon: AlertCircle, color: 'var(--warning)', label: 'PENDING' },
  active:   { icon: Radio,       color: 'var(--accent)',  label: 'ACTIVE' },
  resolved: { icon: CheckCircle, color: 'var(--success)', label: 'RESOLVED' },
};

export default function Dispatch({ calls, setCalls }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshCalls(); }, []);

  const refreshCalls = async () => {
    setLoading(true);
    const data = await fetchNui('getActiveCalls');
    if (data && Array.isArray(data)) setCalls(data);
    setLoading(false);
  };

  const respondToCall = async (id) => {
    await fetchNui('respondCall', { id });
    await fetchNui('updateCall', { id, status: 'active', assignedTo: '' });
    await refreshCalls();
  };

  const updateCallStatus = async (id, status) => {
    await fetchNui('updateCall', { id, status, assignedTo: '' });
    await refreshCalls();
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pending  = calls?.filter(c => c.status === 'pending') || [];
  const active   = calls?.filter(c => c.status === 'active') || [];
  const resolved = calls?.filter(c => c.status === 'resolved') || [];

  const renderCall = (call) => {
    const cfg = STATUS_CONFIG[call.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    return (
      <div key={call.id} className={`call-card call-${call.status}`}>
        <div className="call-header">
          <div className="call-id">#{call.id}</div>
          <div className="call-status" style={{ color: cfg.color }}>
            <StatusIcon size={12} />
            <span>{cfg.label}</span>
          </div>
          <div className="call-time">
            <Clock size={11} />
            {formatTime(call.created_at || call.timestamp)}
          </div>
        </div>

        <div className="call-body">
          <div className="call-caller">
            <Phone size={12} />
            <span>{call.caller || 'Anonymous'}</span>
          </div>
          <div className="call-location">
            <MapPin size={12} />
            <span>{call.location || 'Unknown'}</span>
          </div>
          <div className="call-message">{call.message}</div>
          {call.assigned_to && (
            <div className="call-assigned">
              <User size={11} />
              <span>{call.assigned_to}</span>
            </div>
          )}
        </div>

        <div className="call-actions">
          {call.status === 'pending' && (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => respondToCall(call.id)}>
                <Navigation size={11} /> Respond
              </button>
              <button className="btn btn-sm" onClick={() => updateCallStatus(call.id, 'active')}>
                Mark Active
              </button>
            </>
          )}
          {call.status === 'active' && (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => respondToCall(call.id)}>
                <Navigation size={11} /> Navigate
              </button>
              <button className="btn btn-sm btn-success" onClick={() => updateCallStatus(call.id, 'resolved')}>
                <CheckCircle size={11} /> Resolve
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page dispatch">
      <div className="page-header">
        <h2>Dispatch</h2>
        <div className="header-actions">
          <div className="dispatch-counts">
            <span className="dispatch-count pending">{pending.length} pending</span>
            <span className="dispatch-count active">{active.length} active</span>
          </div>
          <button className="btn btn-sm" onClick={refreshCalls} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="calls-list">
        {(!calls || calls.length === 0) && (
          <div className="empty-state">
            <Radio size={28} />
            <p>No active calls</p>
          </div>
        )}

        {pending.map(renderCall)}
        {active.map(renderCall)}
        {resolved.map(renderCall)}
      </div>
    </div>
  );
}
