import React, { useState } from 'react';
import { fetchNui } from '../utils/nui';
import { Search, Crosshair, User, ShieldCheck, ShieldX } from 'lucide-react';

export default function WeaponSearch({ mode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await fetchNui('searchWeapon', { query });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <div className="page weapon-search">
      <div className="page-header">
        <h2>Weapon Search</h2>
      </div>

      <div className="search-bar">
        <Crosshair size={15} />
        <input
          type="text"
          placeholder="Search by serial number..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="weapon-results">
        {results.length === 0 && !loading && (
          <div className="empty-state">
            <Crosshair size={28} />
            <p>Search for a weapon by serial number</p>
          </div>
        )}

        {results.map((w, i) => {
          const meta = typeof w.metadata === 'string' ? JSON.parse(w.metadata) : (w.metadata || {});
          const isRegistered = meta.registered;
          return (
            <div key={i} className="weapon-card">
              <div className="weapon-header">
                <Crosshair size={16} />
                <span className="weapon-name">{w.item_name || 'Unknown Weapon'}</span>
                <span className="weapon-serial">S/N: {meta.serial || 'N/A'}</span>
              </div>
              <div className="weapon-details">
                <div className="detail-item">
                  <label>Registered Owner</label>
                  <span>
                    <User size={11} />
                    {w.owner_first} {w.owner_last} ({w.citizenid})
                  </span>
                </div>
                {meta.registered !== undefined && (
                  <div className="detail-item">
                    <label>Registration</label>
                    <span className={isRegistered ? 'text-green' : 'text-red'}>
                      {isRegistered ? <><ShieldCheck size={12} /> REGISTERED</> : <><ShieldX size={12} /> UNREGISTERED</>}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
