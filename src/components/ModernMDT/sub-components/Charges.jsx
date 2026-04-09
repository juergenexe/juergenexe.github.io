import React, { useState, useMemo } from 'react';
import { fetchNui } from '../utils/nui';
import { Scale, Search, Plus, Minus, DollarSign, Clock, Gavel, User } from 'lucide-react';

export default function Charges({ penalCode, mode }) {
  const [search, setSearch] = useState('');
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [citizenId, setCitizenId] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [processing, setProcessing] = useState(false);

  const categories = useMemo(() => {
    return ['All', ...new Set((penalCode || []).map(c => c.category))];
  }, [penalCode]);

  const filteredCode = useMemo(() => {
    let list = penalCode || [];
    if (categoryFilter !== 'All') list = list.filter(c => c.category === categoryFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(s));
    }
    return list;
  }, [penalCode, categoryFilter, search]);

  const totals = useMemo(() => {
    let fine = 0, jail = 0;
    selectedCharges.forEach(c => { fine += c.fine || 0; jail += c.jail || 0; });
    return { fine, jail };
  }, [selectedCharges]);

  const addCharge = (charge) => setSelectedCharges(prev => [...prev, { ...charge }]);
  const removeCharge = (index) => setSelectedCharges(prev => prev.filter((_, i) => i !== index));

  const processAction = async (action) => {
    if (!citizenId.trim() || selectedCharges.length === 0) return;
    setProcessing(true);
    await fetchNui('processCharges', {
      citizenid: citizenId,
      charges: selectedCharges.map(c => ({ id: c.id, title: c.title, fine: c.fine, jail: c.jail })),
      action,
      notes,
    });
    setProcessing(false);
    setSelectedCharges([]);
    setNotes('');
  };

  return (
    <div className="page charges">
      <div className="page-header">
        <h2>Process Charges</h2>
      </div>

      {/* Suspect ID */}
      <div className="charges-suspect">
        <label><User size={11} /> Suspect</label>
        <input
          type="text"
          placeholder="Enter Citizen ID..."
          value={citizenId}
          onChange={e => setCitizenId(e.target.value)}
        />
      </div>

      <div className="charges-layout">
        {/* Left: Penal Code Browser */}
        <div className="charges-browser">
          <div className="charges-filters">
            <div className="search-bar compact">
              <Search size={13} />
              <input
                type="text"
                placeholder="Filter charges..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-xs ${categoryFilter === cat ? 'btn-primary' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="charges-list">
            {filteredCode.map(charge => (
              <div key={charge.id} className="charge-row" onClick={() => addCharge(charge)}>
                <div className="charge-info">
                  <span className="charge-title">{charge.title}</span>
                  <span className={`charge-cat cat-${charge.category?.toLowerCase()}`}>{charge.category}</span>
                </div>
                <div className="charge-penalties">
                  <span className="charge-fine"><DollarSign size={10} />{charge.fine}</span>
                  {charge.jail > 0 && <span className="charge-jail"><Clock size={10} />{charge.jail}s</span>}
                </div>
                <Plus size={13} className="charge-add" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Charges */}
        <div className="charges-selected">
          <h3>Selected ({selectedCharges.length})</h3>

          <div className="selected-list">
            {selectedCharges.length === 0 && (
              <div className="empty-state small">
                <Scale size={20} />
                <p>Click charges to add</p>
              </div>
            )}
            {selectedCharges.map((c, i) => (
              <div key={i} className="selected-charge">
                <span>{c.title}</span>
                <div className="selected-penalties">
                  <span>${c.fine}</span>
                  {c.jail > 0 && <span>{c.jail}s</span>}
                </div>
                <button className="btn-icon" onClick={() => removeCharge(i)}>
                  <Minus size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="charges-totals">
            <div className="total-row">
              <DollarSign size={15} />
              <span>Fine</span>
              <strong>${totals.fine.toLocaleString()}</strong>
            </div>
            <div className="total-row">
              <Clock size={15} />
              <span>Jail Time</span>
              <strong>{totals.jail}s</strong>
            </div>
          </div>

          {/* Notes */}
          <textarea
            className="charges-notes"
            placeholder="Additional notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />

          {/* Actions */}
          <div className="charges-actions">
            <button
              className="btn btn-warning"
              disabled={processing || selectedCharges.length === 0 || !citizenId.trim()}
              onClick={() => processAction('citation')}
            >
              <Gavel size={13} /> Citation
            </button>
            <button
              className="btn btn-danger"
              disabled={processing || selectedCharges.length === 0 || !citizenId.trim()}
              onClick={() => processAction('arrest')}
            >
              <Gavel size={13} /> Arrest
            </button>
            <button
              className="btn btn-secondary"
              disabled={processing || selectedCharges.length === 0 || !citizenId.trim()}
              onClick={() => processAction('warrant')}
            >
              <Gavel size={13} /> Warrant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
