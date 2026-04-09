import { Phone, MapPin, X, Navigation, Siren, Car, Tag } from 'lucide-react';

export default function DispatchNotification({ notifications, onDismiss, onRespond }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="dispatch-notifications">
      {notifications.map((notif) => (
        <div key={notif._id} className="dispatch-notif">
          <div className="dispatch-notif-header">
            <div className="dispatch-notif-badge">
              <Siren size={10} />
              {notif.code || '911'}
            </div>
            <span className="dispatch-notif-title">
              {notif.codeName || 'Incoming Call'}
            </span>
            <button className="dispatch-notif-close" onClick={() => onDismiss(notif._id)}>
              <X size={13} />
            </button>
          </div>
          <div className="dispatch-notif-body">
            <div className="dispatch-notif-row">
              <Phone size={11} />
              <span>{notif.caller || 'Anonymous'}</span>
            </div>
            <div className="dispatch-notif-row">
              <MapPin size={11} />
              <span>{notif.location || 'Unknown Location'}</span>
            </div>
            {notif.vehicle && (
              <div className="dispatch-notif-row">
                <Car size={11} />
                <span>{notif.vehicle}</span>
              </div>
            )}
            {notif.gender && (
              <div className="dispatch-notif-row">
                <Tag size={11} />
                <span>{notif.gender}</span>
              </div>
            )}
            <div className="dispatch-notif-message">
              {notif.message || 'No details provided'}
            </div>
          </div>
          <div className="dispatch-notif-actions">
            <button className="btn btn-sm btn-primary" onClick={() => onRespond(notif)}>
              <Navigation size={11} />
              Respond
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
