import React, { useState, useEffect } from 'react';
import { fetchNui } from '../utils/nui';
import { Search, User, FileText, AlertTriangle, CreditCard, Phone, Calendar, Hash, ChevronRight, StickyNote, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function PersonSearch({ mode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSelected(null);
    const data = await fetchNui('searchPerson', { query });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <div className="page person-search">
      <div className="page-header">
        <h2>Person Search</h2>
      </div>

      <div className="search-bar">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search by name or Citizen ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="search-results-layout">
        <div className="results-list">
          {results.length === 0 && !loading && (
            <div className="empty-state">
              <User size={28} />
              <p>Search for a citizen</p>
            </div>
          )}
          {results.map((p, i) => (
            <div
              key={i}
              className={`result-card ${selected === i ? 'active' : ''}`}
              onClick={() => setSelected(i)}
            >
              <div className="result-card-top">
                <div className="result-avatar-sm">
                  <User size={14} />
                </div>
                <div className="result-name-col">
                  <span className="result-name-text">{p.firstname} {p.lastname}</span>
                  <span className="result-id-text">{p.citizenid}</span>
                </div>
                <ChevronRight size={14} className="result-arrow" />
              </div>
              <div className="result-meta">
                <span>DOB: {p.dob}</span>
              </div>
              {p.warrants?.length > 0 && (
                <span className="badge badge-danger">
                  <AlertTriangle size={9} /> WARRANT
                </span>
              )}
            </div>
          ))}
        </div>

        {selected !== null && results[selected] && (
          <PersonDetail person={results[selected]} />
        )}
      </div>
    </div>
  );
}

function PersonDetail({ person }) {
  const p = person;
  const [licences, setLicences] = useState({});
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const lic = typeof p.licences === 'object' ? { ...p.licences } : {};
    setLicences(lic);
    loadNotes();
  }, [p.citizenid]);

  const loadNotes = async () => {
    const data = await fetchNui('getCitizenNotes', { citizenid: p.citizenid });
    setNotes(data || []);
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await fetchNui('addCitizenNote', { citizenid: p.citizenid, note: noteText.trim() });
    setNoteText('');
    setShowNoteForm(false);
    loadNotes();
  };

  const deleteNote = async (id) => {
    await fetchNui('deleteCitizenNote', { id });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleLicense = async (type) => {
    const newVal = !licences[type];
    setLicences(prev => ({ ...prev, [type]: newVal }));
    await fetchNui('updateLicense', { citizenid: p.citizenid, licenseType: type, value: newVal });
  };

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-avatar">
          <User size={26} />
        </div>
        <div className="detail-name-block">
          <h3>{p.firstname} {p.lastname}</h3>
          <span className="detail-id">{p.citizenid}</span>
        </div>
        {p.warrants?.length > 0 && (
          <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>
            <AlertTriangle size={10} /> ACTIVE WARRANT
          </span>
        )}
      </div>

      {/* Info Grid */}
      <div className="detail-grid">
        <div className="detail-item">
          <label><Calendar size={9} /> Date of Birth</label>
          <span>{p.dob || 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <label><User size={9} /> Gender</label>
          <span>{p.gender === '0' || p.gender === 0 ? 'Male' : 'Female'}</span>
        </div>
        <div className="detail-item">
          <label><Phone size={9} /> Phone</label>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{p.phone || 'Unknown'}</span>
        </div>
      </div>

      <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'auto', flex: 1 }}>
        {/* Licenses — with toggle */}
        <div className="detail-section">
          <h4><CreditCard size={13} /> Licenses</h4>
          <div className="licence-grid">
            {Object.entries(licences).map(([key, val]) => (
              <div
                key={key}
                className={`licence-item ${val ? 'valid' : 'invalid'}`}
                onClick={() => toggleLicense(key)}
                style={{ cursor: 'pointer' }}
                title={`Click to ${val ? 'revoke' : 'grant'} ${key} license`}
              >
                {val ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                <span className="licence-name">{key}</span>
                <span className="licence-status">{val ? 'VALID' : 'REVOKED'}</span>
              </div>
            ))}
            {Object.keys(licences).length === 0 && (
              <span className="text-muted">No licenses on file</span>
            )}
          </div>
        </div>

        {/* Officer Notes */}
        <div className="detail-section">
          <h4>
            <StickyNote size={13} /> Officer Notes ({notes.length})
            <button className="btn btn-xs btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowNoteForm(!showNoteForm)}>
              <Plus size={9} /> Add
            </button>
          </h4>
          {showNoteForm && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <textarea
                rows={2}
                placeholder="Add a note about this citizen..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button className="btn btn-xs btn-primary" onClick={addNote}>Save</button>
                <button className="btn btn-xs" onClick={() => { setShowNoteForm(false); setNoteText(''); }}>Cancel</button>
              </div>
            </div>
          )}
          <div className="records-scroll" style={{ maxHeight: '120px' }}>
            {notes.length === 0 && !showNoteForm && <span className="text-muted">No notes</span>}
            {notes.map(n => (
              <div key={n.id} className="record-entry" style={{ position: 'relative' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.note}</div>
                <div className="record-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{n.officer_name} &bull; {new Date(n.created_at).toLocaleDateString()}</span>
                  <button className="btn-icon" onClick={() => deleteNote(n.id)} style={{ padding: '2px' }}>
                    <X size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warrants */}
        {p.warrants?.length > 0 && (
          <div className="detail-section">
            <h4><AlertTriangle size={13} /> Active Warrants</h4>
            {p.warrants.map((w, i) => (
              <div key={i} className="record-entry record-danger">
                <div className="record-title">{w.reason}</div>
                <div className="record-meta">
                  Issued by {w.officer_name} — {new Date(w.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Criminal Records */}
        <div className="detail-section">
          <h4><FileText size={13} /> Criminal History ({p.records?.length || 0})</h4>
          <div className="records-scroll">
            {(!p.records || p.records.length === 0) && <span className="text-muted">No criminal record</span>}
            {p.records?.map((r, i) => {
              const charges = typeof r.charges === 'string' ? JSON.parse(r.charges) : r.charges;
              return (
                <div key={i} className="record-entry">
                  <div className="record-charges">
                    {charges?.map((c, ci) => (
                      <span key={ci} className="charge-tag">{c.title}</span>
                    ))}
                  </div>
                  <div className="record-meta">
                    ${r.total_fine} fine &bull; {r.total_jail}s jail &bull; {r.officer_name} &bull; {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Citations */}
        {p.citations?.length > 0 && (
          <div className="detail-section">
            <h4><Hash size={13} /> Citations ({p.citations.length})</h4>
            <div className="records-scroll">
              {p.citations.map((c, i) => {
                const charges = typeof c.charges === 'string' ? JSON.parse(c.charges) : c.charges;
                return (
                  <div key={i} className="record-entry record-warn">
                    <div className="record-charges">
                      {charges?.map((ch, ci) => (
                        <span key={ci} className="charge-tag">{ch.title}</span>
                      ))}
                    </div>
                    <div className="record-meta">
                      ${c.total_fine} fine &bull; {c.officer_name} &bull; {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
