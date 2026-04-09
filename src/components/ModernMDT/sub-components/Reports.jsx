import React, { useState, useEffect, useMemo } from 'react';
import { fetchNui } from '../utils/nui';
import { FileText, Plus, Clock, User, Scale, ChevronLeft, X, Check, Trash2, Image } from 'lucide-react';

const TYPE_LABELS = { arrest: 'Arrest', incident: 'Incident', traffic: 'Traffic Stop', other: 'Other' };
const TYPE_COLORS = { arrest: 'var(--danger)', incident: 'var(--accent)', traffic: 'var(--warning)', other: 'var(--text-muted)' };

// Detect image URLs in text and render them as inline images
function EvidenceRenderer({ text }) {
  if (!text) return null;

  // Split on image URLs (supports common image extensions + fivemanage)
  const urlPattern = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|bmp)(?:\?[^\s]*)?)/gi;
  const parts = text.split(urlPattern);

  return (
    <div className="evidence-content">
      {parts.map((part, i) => {
        if (urlPattern.test(part)) {
          return (
            <div key={i} className="evidence-image-wrapper">
              <img
                src={part}
                alt="Evidence"
                className="evidence-image"
                onClick={() => window.open(part, '_blank')}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <a href={part} className="evidence-link" style={{ display: 'none' }} target="_blank" rel="noopener noreferrer">
                {part}
              </a>
            </div>
          );
        }
        // Reset regex lastIndex since we're reusing it
        urlPattern.lastIndex = 0;
        return part ? <span key={i} className="evidence-text">{part}</span> : null;
      })}
    </div>
  );
}

export default function Reports({ penalCode, mode, player }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  // New report form state
  const [form, setForm] = useState({
    title: '', type: 'incident', narrative: '',
    involved: [], charges: [], evidence: '',
  });

  // Inline involved person form
  const [showInvolvedForm, setShowInvolvedForm] = useState(false);
  const [involvedForm, setInvolvedForm] = useState({ citizenid: '', name: '', role: 'suspect' });

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await fetchNui('getReports');
    setReports(data || []);
    setLoading(false);
  };

  const totals = useMemo(() => {
    let fine = 0, jail = 0;
    (form.charges || []).forEach(c => { fine += c.fine || 0; jail += c.jail || 0; });
    return { fine, jail };
  }, [form.charges]);

  const addCharge = (charge) => {
    setForm(prev => ({ ...prev, charges: [...prev.charges, { ...charge }] }));
  };

  const removeCharge = (idx) => {
    setForm(prev => ({ ...prev, charges: prev.charges.filter((_, i) => i !== idx) }));
  };

  const addInvolved = () => {
    if (!involvedForm.citizenid.trim()) return;
    setForm(prev => ({
      ...prev,
      involved: [...prev.involved, {
        citizenid: involvedForm.citizenid.trim(),
        name: involvedForm.name.trim() || involvedForm.citizenid.trim(),
        role: involvedForm.role,
      }],
    }));
    setInvolvedForm({ citizenid: '', name: '', role: 'suspect' });
    setShowInvolvedForm(false);
  };

  const removeInvolved = (idx) => {
    setForm(prev => ({ ...prev, involved: prev.involved.filter((_, i) => i !== idx) }));
  };

  const submitReport = async () => {
    if (!form.title || !form.narrative) return;
    await fetchNui('createReport', {
      ...form,
      total_fine: totals.fine,
      total_jail: totals.jail,
    });
    setForm({ title: '', type: 'incident', narrative: '', involved: [], charges: [], evidence: '' });
    setView('list');
    loadReports();
  };

  const deleteReport = async (id) => {
    await fetchNui('deleteReport', { id });
    setView('list');
    setSelected(null);
    loadReports();
  };

  const canDelete = (parseInt(player?.gradeLevel ?? 0)) >= (window.__mdt_deleteGrade ?? 0);

  // Detail view
  if (view === 'detail' && selected) {
    const r = selected;
    const charges = typeof r.charges === 'string' ? JSON.parse(r.charges) : (r.charges || []);
    const involved = typeof r.involved === 'string' ? JSON.parse(r.involved) : (r.involved || []);

    return (
      <div className="page reports">
        <div className="page-header">
          <button className="btn btn-sm" onClick={() => { setView('list'); setSelected(null); }}>
            <ChevronLeft size={14} /> Back
          </button>
          <h2>Report #{r.id}</h2>
          <span className="badge" style={{ borderColor: TYPE_COLORS[r.type] || '#888', color: TYPE_COLORS[r.type] || '#888' }}>
            {TYPE_LABELS[r.type] || r.type}
          </span>
          {canDelete && (
            <button
              className="btn btn-sm btn-danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => deleteReport(r.id)}
              title="Delete report"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        <div className="report-detail-card">
          <h3>{r.title}</h3>
          <div className="report-meta-row">
            <span><User size={12} /> {r.officer_name}</span>
            <span><Clock size={12} /> {new Date(r.created_at).toLocaleString()}</span>
            <span className="badge">{r.status}</span>
          </div>

          {involved.length > 0 && (
            <div className="report-section">
              <h4>Involved Persons</h4>
              {involved.map((p, i) => (
                <div key={i} className="involved-tag">
                  <span className={`role-tag role-${p.role}`}>{p.role}</span>
                  <span>{p.name} ({p.citizenid})</span>
                </div>
              ))}
            </div>
          )}

          {charges.length > 0 && (
            <div className="report-section">
              <h4>Charges</h4>
              <div className="record-charges">
                {charges.map((c, i) => (
                  <span key={i} className="charge-tag">{c.title} — ${c.fine}{c.jail > 0 ? ` / ${c.jail}s` : ''}</span>
                ))}
              </div>
              <div className="report-totals">
                <span>Total Fine: <strong>${r.total_fine}</strong></span>
                <span>Total Jail: <strong>{r.total_jail}s</strong></span>
              </div>
            </div>
          )}

          <div className="report-section">
            <h4>Narrative</h4>
            <div className="report-narrative">{r.narrative}</div>
          </div>

          {r.evidence && (
            <div className="report-section">
              <h4><Image size={14} /> Evidence</h4>
              <EvidenceRenderer text={r.evidence} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create view
  if (view === 'create') {
    return (
      <div className="page reports">
        <div className="page-header">
          <button className="btn btn-sm" onClick={() => setView('list')}>
            <ChevronLeft size={14} /> Back
          </button>
          <h2>New Report</h2>
        </div>

        <div className="report-form">
          <div className="form-row">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="arrest">Arrest Report</option>
              <option value="incident">Incident Report</option>
              <option value="traffic">Traffic Stop</option>
              <option value="other">Other</option>
            </select>
            <input
              placeholder="Report title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Involved persons */}
          <div className="form-section">
            <div className="form-section-header">
              <h4>Involved Persons</h4>
              <button className="btn btn-xs btn-primary" onClick={() => setShowInvolvedForm(true)}>
                <Plus size={10} /> Add
              </button>
            </div>

            {showInvolvedForm && (
              <div className="involved-inline-form">
                <div className="involved-form-row">
                  <input
                    type="text"
                    placeholder="Citizen ID..."
                    value={involvedForm.citizenid}
                    onChange={e => setInvolvedForm(p => ({ ...p, citizenid: e.target.value }))}
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Full name..."
                    value={involvedForm.name}
                    onChange={e => setInvolvedForm(p => ({ ...p, name: e.target.value }))}
                  />
                  <select
                    value={involvedForm.role}
                    onChange={e => setInvolvedForm(p => ({ ...p, role: e.target.value }))}
                  >
                    <option value="suspect">Suspect</option>
                    <option value="victim">Victim</option>
                    <option value="witness">Witness</option>
                  </select>
                </div>
                <div className="involved-form-actions">
                  <button className="btn btn-xs btn-primary" onClick={addInvolved}>
                    <Check size={10} /> Confirm
                  </button>
                  <button className="btn btn-xs" onClick={() => { setShowInvolvedForm(false); setInvolvedForm({ citizenid: '', name: '', role: 'suspect' }); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="involved-list">
              {form.involved.map((p, i) => (
                <div key={i} className="involved-tag">
                  <span className={`role-tag role-${p.role}`}>{p.role}</span>
                  <span>{p.name} ({p.citizenid})</span>
                  <button className="btn-icon" onClick={() => removeInvolved(i)}><X size={12} /></button>
                </div>
              ))}
              {form.involved.length === 0 && !showInvolvedForm && <span className="text-muted">No persons added</span>}
            </div>
          </div>

          {/* Narrative */}
          <div className="form-section">
            <h4>Narrative</h4>
            <textarea
              rows={5}
              placeholder="Describe the incident in detail..."
              value={form.narrative}
              onChange={e => setForm(p => ({ ...p, narrative: e.target.value }))}
            />
          </div>

          {/* Charges */}
          <div className="form-section">
            <h4>Charges (optional)</h4>
            <div className="report-charges-area">
              <div className="report-charge-picker">
                {(penalCode || []).map(c => (
                  <div key={c.id} className="charge-row compact" onClick={() => addCharge(c)}>
                    <span className="charge-title">{c.title}</span>
                    <span className="charge-fine">${c.fine}</span>
                    {c.jail > 0 && <span className="charge-jail">{c.jail}s</span>}
                  </div>
                ))}
              </div>
              <div className="report-selected-charges">
                {form.charges.map((c, i) => (
                  <div key={i} className="selected-charge">
                    <span>{c.title}</span>
                    <button className="btn-icon" onClick={() => removeCharge(i)}><X size={12} /></button>
                  </div>
                ))}
                {form.charges.length > 0 && (
                  <div className="charges-totals compact">
                    <span>Fine: <strong>${totals.fine}</strong></span>
                    <span>Jail: <strong>{totals.jail}s</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="form-section">
            <h4><Image size={14} /> Evidence</h4>
            <textarea
              rows={3}
              placeholder="Paste image URLs (fivemanage, imgur, etc.) or notes. Images auto-embed in the report."
              value={form.evidence}
              onChange={e => setForm(p => ({ ...p, evidence: e.target.value }))}
            />
            {form.evidence && <EvidenceRenderer text={form.evidence} />}
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={submitReport} disabled={!form.title || !form.narrative}>
              <FileText size={14} /> File Report
            </button>
            <button className="btn" onClick={() => setView('list')}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="page reports">
      <div className="page-header">
        <h2>Reports</h2>
        <div className="header-actions">
          <button className="btn btn-sm btn-primary" onClick={() => setView('create')}>
            <Plus size={12} /> New Report
          </button>
          <button className="btn btn-sm" onClick={loadReports} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="reports-list">
        {reports.length === 0 && !loading && (
          <div className="empty-state">
            <FileText size={32} />
            <p>No reports filed yet</p>
          </div>
        )}

       {(Array.isArray(reports) ? reports : Object.values(reports || {})).map((r) => (
          <div key={r.id} className="report-card" onClick={() => { setSelected(r); setView('detail'); }}>
            <div className="report-card-header">
              <span className="report-type-dot" style={{ background: TYPE_COLORS[r.type] || '#888' }} />
              <span className="report-card-id">#{r.id}</span>
              <strong>{r.title}</strong>
              <span className="badge" style={{ marginLeft: 'auto' }}>{r.status}</span>
            </div>
            <div className="report-card-meta">
              <span><User size={11} /> {r.officer_name}</span>
              <span><Clock size={11} /> {new Date(r.created_at).toLocaleString()}</span>
              {r.total_fine > 0 && <span><Scale size={11} /> ${r.total_fine}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
