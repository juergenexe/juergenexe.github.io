const isBrowser = !window.invokeNative && !window.GetParentResourceName;

// --- LOKALE TEST-DATENBANK ---
const mockDB = {
  bulletins: [
    { id: 1, content: "Portfolio System Online.", priority: "normal", officer_name: "SYSTEM", created_at: new Date() }
  ],
  reports: [
    { id: 101, title: "EXCESSIVE CODING SKILLS", type: "arrest", suspects: "JB-01", author_name: "ADMIN", created_at: new Date() }
  ],
  citizens: {
    "JB-01": { name: "Justin Baltes", cid: "JB-01", dob: "26.01.2003", phone: "555-0160", notes: "Chief Architect" }
  }
};

export async function fetchNui(event, data = {}) {
  if (isBrowser) {
    console.log(`[SIMULATOR] Event: ${event}`, data);

    // --- ANTWORT-LOGIK FÜR DIE FUNKTIONEN ---
    if (event === 'getBulletins') return mockDB.bulletins;
    if (event === 'getReports')   return mockDB.reports;
    if (event === 'setStatus')    return { status: 'ok' };
    
    if (event === 'searchPerson') {
      // Wenn nach Justin oder JB-01 gesucht wird, gib Daten zurück
      const search = (data.search || "").toUpperCase();
      if (search.includes("JUSTIN") || search.includes("JB-01")) {
        return [mockDB.citizens["JB-01"]];
      }
      return []; // Nichts gefunden
    }

    return { status: 'ok' };
  }

  // Originaler FiveM Code
  const RESOURCE_NAME = window.GetParentResourceName ? window.GetParentResourceName() : 'juergen_mdt';
  const resp = await fetch(`https://${RESOURCE_NAME}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await resp.json();
}

// Handler für Nachrichten vom "Server"
export const onAnyNuiMessage = (handler) => {
  if (isBrowser) {
    setTimeout(() => {
      handler({
        type: 'OPEN_MDT',
        payload: {
          player: { name: "Justin Baltes", cid: "JB-01", grade: "Chief", callsign: "JB-01" },
          bulletins: mockDB.bulletins,
          reports: mockDB.reports, // WICHTIG: Damit Reports beim Start nicht leer ist
          penalCode: [],
          calls: []
        }
      });
    }, 500);
  }
  
  const listener = (event) => { if (event.data?.type) handler(event.data); };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
};