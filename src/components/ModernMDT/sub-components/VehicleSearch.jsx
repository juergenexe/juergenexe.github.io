import React, { useState } from 'react';
import { fetchNui } from '../utils/nui';
import { Search, Car, User, AlertTriangle, Flag, Shield, ParkingCircle } from 'lucide-react';

export default function VehicleSearch({ mode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [impoundReason, setImpoundReason] = useState('');
  const [impoundPlate, setImpoundPlate] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await fetchNui('searchVehicle', { query });
    setResults(data || []);
    setLoading(false);
  };

  const handleFlag = async (plate, flag, reason) => {
    await fetchNui('flagVehicle', { plate, flag, reason: reason || 'Flagged by officer' });
    handleSearch();
  };

  const handleUnflag = async (plate) => {
    await fetchNui('unflagVehicle', { plate });
    handleSearch();
  };

  const handleImpound = async (plate) => {
    await fetchNui('impoundVehicle', { plate, reason: impoundReason || 'Impounded by LEO' });
    setImpoundPlate(null);
    setImpoundReason('');
    handleSearch();
  };

  const handleRelease = async (plate) => {
    await fetchNui('releaseImpound', { plate });
    handleSearch();
  };

  return (
    <div className="page vehicle-search">
      <div className="page-header">
        <h2>Vehicle Search</h2>
      </div>

      <div className="search-bar">
        <Car size={15} />
        <input
          type="text"
          placeholder="Search by license plate..."
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="vehicle-results">
        {results.length === 0 && !loading && (
          <div className="empty-state">
            <Car size={28} />
            <p>Search for a vehicle by plate</p>
          </div>
        )}

        {results.map((v, i) => (
          <div key={i} className={`vehicle-card ${v.flag || v.bolo ? 'flagged' : ''}`}>
            <div className="vehicle-header">
              <Car size={16} />
              <span className="vehicle-plate">{v.plate}</span>
              {v.flag && (
                <span className="badge badge-danger">
                  <Flag size={9} /> {v.flag.flag?.toUpperCase()}
                </span>
              )}
              {v.bolo && (
                <span className="badge badge-warning">
                  <AlertTriangle size={9} /> BOLO
                </span>
              )}
              {v.state === 2 && (
                <span className="badge badge-warning">
                  <ParkingCircle size={9} /> IMPOUNDED
                </span>
              )}
            </div>

            <div className="vehicle-details">
              <div className="detail-item">
                <label>Vehicle</label>
                <span>{v.vehicle || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <label>Owner</label>
                <span>
                  <User size={11} />
                  {v.owner_first} {v.owner_last}
                </span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span>{v.state === 0 ? 'Out' : v.state === 1 ? 'Garaged' : v.state === 2 ? 'Impounded' : 'Unknown'}</span>
              </div>
            </div>

            {v.flag && v.flag.reason && (
              <div className="vehicle-flag-reason">
                <Flag size={11} /> <strong>Flag:</strong> {v.flag.reason}
              </div>
            )}
            {v.bolo && (
              <div className="vehicle-bolo-info">
                <AlertTriangle size={11} /> <strong>BOLO:</strong> {v.bolo.title} — {v.bolo.description}
              </div>
            )}

            {/* Impound inline form */}
            {impoundPlate === v.plate && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 0' }}>
                <input
                  type="text"
                  placeholder="Impound reason..."
                  value={impoundReason}
                  onChange={e => setImpoundReason(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleImpound(v.plate)}
                />
                <button className="btn btn-xs btn-warning" onClick={() => handleImpound(v.plate)}>Confirm</button>
                <button className="btn btn-xs" onClick={() => { setImpoundPlate(null); setImpoundReason(''); }}>Cancel</button>
              </div>
            )}

            <div className="vehicle-actions">
              {!v.flag ? (
                <>
                  <button className="btn btn-sm btn-danger" onClick={() => handleFlag(v.plate, 'stolen', 'Reported stolen')}>
                    <Flag size={11} /> Flag Stolen
                  </button>
                  <button className="btn btn-sm btn-warning" onClick={() => handleFlag(v.plate, 'wanted', 'Wanted vehicle')}>
                    <Shield size={11} /> Flag Wanted
                  </button>
                </>
              ) : (
                <button className="btn btn-sm" onClick={() => handleUnflag(v.plate)}>
                  Remove Flag
                </button>
              )}
              {v.state !== 2 ? (
                <button className="btn btn-sm" onClick={() => setImpoundPlate(impoundPlate === v.plate ? null : v.plate)}>
                  <ParkingCircle size={11} /> Impound
                </button>
              ) : (
                <button className="btn btn-sm btn-success" onClick={() => handleRelease(v.plate)}>
                  <ParkingCircle size={11} /> Release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
