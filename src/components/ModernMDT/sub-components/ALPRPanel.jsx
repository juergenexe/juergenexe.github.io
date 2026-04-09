import React from 'react';
import { ScanLine, AlertTriangle, CheckCircle, Car, Flag, User, Lock, Radio } from 'lucide-react';

export default function ALPRPanel({ scans = [] }) {
  // Sicherheits-Check: Falls scans kein Array ist, wandle es um
  const safeScans = Array.isArray(scans) ? scans : Object.values(scans || {});

  return (
    <div className="page alpr">
      <div className="page-header">
        <h2>ALPR Scanner</h2>
        <div className="alpr-wars-badge">
          <Radio size={12} />
          <span>Wraith ARS 2X</span>
        </div>
      </div>

      <p className="page-hint">
        Plates are automatically checked via <strong>Wraith ARS 2X</strong> plate reader.
        Activate the reader from your radar panel. Hits trigger audio alerts + notifications.
      </p>

      <div className="alpr-feed">
        {safeScans.length === 0 && (
          <div className="empty-state">
            <ScanLine size={28} />
            <p>No plates scanned yet</p>
          </div>
        )}

        {/* FIX: Wir nennen das Element 'scan' und fügen den Index 'i' hinzu */}
        {safeScans.map((scan, i) => (
          <div key={i} className={`alpr-entry ${scan.hit ? 'hit' : 'clean'} ${scan.locked ? 'locked' : ''}`}>
            <div className="alpr-plate">
              <Car size={13} />
              <span className="plate-text">{scan.plate}</span>
              {scan.locked && (
                <span className="alpr-lock-badge">
                  <Lock size={10} /> LOCKED
                </span>
              )}
              {scan.cam && (
                <span className="alpr-cam-badge">{scan.cam.toUpperCase()}</span>
              )}
              <span className="alpr-time">
                {new Date((scan.timestamp || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {scan.hit ? (
              <div className="alpr-alert">
                <AlertTriangle size={13} />
                <div className="alpr-alert-details">
                  {scan.details?.flag && (
                    <div className="alert-line">
                      <Flag size={10} />
                      <span>Flagged: <strong>{scan.details.flag.flag?.toUpperCase()}</strong></span>
                      {scan.details.flag.reason && <span> &mdash; {scan.details.flag.reason}</span>}
                    </div>
                  )}
                  {scan.details?.bolo && (
                    <div className="alert-line">
                      <AlertTriangle size={10} />
                      <span>BOLO: <strong>{scan.details.bolo.title}</strong></span>
                    </div>
                  )}
                  {scan.details?.ownerWarrants && (
                    <div className="alert-line">
                      <User size={10} />
                      <span>Owner <strong>{scan.details.ownerName}</strong> has active warrants</span>
                    </div>
                  )}
                  {scan.details?.vehicle && (
                    <div className="alert-line">
                      <User size={10} />
                      <span>Owner: {scan.details.vehicle.owner_first} {scan.details.vehicle.owner_last}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="alpr-clean">
                <CheckCircle size={13} />
                <span>Clear</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}