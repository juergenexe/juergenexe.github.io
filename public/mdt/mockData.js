const isBrowser = !window.invokeNative;

if (isBrowser) {
    window.fetch = async (url, options) => {
        const data = JSON.parse(options.body || "{}");
        const cmd = (data.command || "").toUpperCase();
        const args = data.arguments || [];

        // --- Suche ---
        if (cmd === "/SEARCH") {
            window.postMessage({
                action: 'printLines',
                lines: [
                    '╔══ CITIZEN DATABASE QUERY RESULTS ══════════════╗',
                    '  [1] JUSTIN MARKUS BALTES  CID: JB-01',
                    '      USE /VIEW JB-01 FOR FULL RECORD',
                    '╚════════════════════════════════════════════════╝'
                ]
            }, "*");
        } 
        // --- Profilansicht ---
        else if (cmd === "/VIEW" && args[0] === "JB-01") {
            window.postMessage({
                action: 'showRecord',
                record: {
                    cid: "JB-01",
                    name: "JUSTIN MARKUS BALTES",
                    dob: "26.01.2003",
                    sex: "MALE",
                    phone: "0160-8139852",
                    flags: "ARMED AND CODED",
                    notes: "HELLO.",
                    mugshot: "https://static.wikia.nocookie.net/rfti/images/3/37/KnF.jpg/revision/latest?cb=20230210162647", // Beispielbild
                    warrants: [],
                    reports: [{ id: 1, title: "CRIMINALLY SMOOTH", timestamp: "2026-04-01", status: "CLOSED" }],
                    citations: []
                }
            }, "*");
        }
        return { ok: true, json: () => Promise.resolve({ status: 'ok' }) };
    };

    window.onload = () => {
        window.postMessage({
            action: "openMDT",
            officer: { name: "Justin Baltes", callsign: "JB-01", grade: "CHIEF", job: "IT OPERATIONS" },
            penalCode: {}
        }, "*");
    };
}