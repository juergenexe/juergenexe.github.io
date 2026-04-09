/* ============================================================
   juergen_mdt :: MDT-9100 Frontend  (v3.0)
   ============================================================ */

// Capture FiveM's native GetParentResourceName BEFORE anything
// in this file can shadow window.GetParentResourceName.
// (Function declarations are hoisted, so this must be first.

'use strict';

// ── State ────────────────────────────────────────────────────
const MDT = {
    open          : false,
    booted        : false,   // boot animation only plays once per session
    view          : 'terminal',
    penalCode     : {},
    officer       : null,
    history       : [],
    historyPos    : -1,
    activeCharges : [],
    chargeMonths  : 0,
    chargeFine    : 0,
    currentCID    : null,
    dispatchCalls : [],      // local dispatch log
    rosterJobs    : [],      // assignable jobs from config
    canManageRoster: false,
};

// ── DOM refs ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const views = {
    terminal      : $('view-terminal'),
    record        : $('view-record'),
    warrants      : $('view-warrants'),
    bolos         : $('view-bolos'),
    reports       : $('view-reports'),
    singleReport  : $('view-single-report'),
    officers      : $('view-officers'),
    reportForm    : $('view-report-form'),
    dispatch      : $('view-dispatch'),
    roster        : $('view-roster'),
};

// ── Sound System ─────────────────────────────────────────────
const _AUDIO_BASE = 'sounds/';

function _mkAudio(file, vol) {
    const a = new Audio(_AUDIO_BASE + file);
    a.volume = vol !== undefined ? vol : 0.35;
    return a;
}

function _mkPool(file, count, vol) {
    return Array.from({ length: count }, () => _mkAudio(file, vol));
}

const SFX = {
    poweron  : _mkAudio('poweron.mp3',  0.55),
    poweroff : _mkAudio('poweroff.mp3', 0.55),
    _cePool  : [
        ..._mkPool('ui_hacking_charenter_01.wav', 2, 0.22),
        ..._mkPool('ui_hacking_charenter_02.wav', 1, 0.22),
        ..._mkPool('ui_hacking_charenter_03.wav', 1, 0.22),
    ],
    _csPool  : [
        ..._mkPool('ui_hacking_charsingle_01.wav', 1, 0.18),
        ..._mkPool('ui_hacking_charsingle_02.wav', 1, 0.18),
        ..._mkPool('ui_hacking_charsingle_03.wav', 1, 0.18),
        ..._mkPool('ui_hacking_charsingle_04.wav', 1, 0.18),
        ..._mkPool('ui_hacking_charsingle_05.wav', 1, 0.18),
        ..._mkPool('ui_hacking_charsingle_06.wav', 1, 0.18),
    ],
    _scPool  : [
        ..._mkPool('ui_hacking_charscroll.wav',    2, 0.28),
        ..._mkPool('ui_hacking_charscroll_lp.wav', 1, 0.20),
    ],
};

let _ceIdx = 0, _csIdx = 0, _scIdx = 0, _bootCharCount = 0;

function playKeySound() {
    const useEnter = Math.random() > 0.55;
    const pool     = useEnter ? SFX._cePool : SFX._csPool;
    const idx      = useEnter
        ? (_ceIdx++ % SFX._cePool.length)
        : (_csIdx++ % SFX._csPool.length);
    const snd = pool[idx];
    if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }
}

function playScrollSound() {
    const snd = SFX._scPool[_scIdx++ % SFX._scPool.length];
    if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }
}

function playSFX(key) {
    const snd = SFX[key];
    if (snd && snd.play) { snd.currentTime = 0; snd.play().catch(() => {}); }
}

// ── Lua → NUI Message Handlers ────────────────────────────────
window.onload = () => {
    window.addEventListener('message', e => {
        const { action } = e.data;
        if (!action) return;

    switch (action) {
        case 'openMDT':         onOpen(e.data);                              break;
        case 'closeMDT':        onClose();                                   break;
        case 'print':           printLine(e.data.text);                      break;
        case 'printLines':      printLines(e.data.lines);                    break;
        case 'clear':           clearTerminal();                             break;
        case 'showRecord':      displayRecord(e.data.record);               break;
        case 'showWarrants':    displayWarrants(e.data.warrants);           break;
        case 'showBOLOs':       displayBOLOs(e.data.bolos);                 break;
        case 'showReports':     displayReports(e.data.reports, e.data.cid); break;
        case 'showReport':      displaySingleReport(e.data.report);         break;
        case 'showOfficers':    displayOfficers(e.data.officers);           break;
        case 'receiveMessage':  onMessage(e.data.msg);                       break;
        case 'statusUpdated':   onStatusUpdated(e.data.status);              break;
        case 'callsignUpdated': onCallsignUpdated(e.data.callsign);         break;
        case 'dispatchCall':    onDispatchCall(e.data.call, e.data.mdtOpen); break;
        case 'showRoster':      displayRoster(e.data.roster, e.data.canManage); break;
    }
 });
};

// ── Open / Close ─────────────────────────────────────────────

async function onOpen({ penalCode, officer, rosterJobs }) {
    if (MDT.open) return;
    MDT.open        = true;
    MDT.penalCode   = penalCode  || {};
    MDT.officer     = officer    || {};
    MDT.rosterJobs  = rosterJobs || [];

    $('mdt-device').classList.remove('hidden');
    switchView('terminal');
    clearTerminal();

    // LEDs
    $('led-pwr').classList.add('lit');

    // Header unit
    $('hdr-unit').textContent = 'UNIT: ' + (officer.callsign || '??');

    // Populate roster job dropdown
    _populateRosterJobs();

    // Clock
    startClock();

    // Power-on sound
    playSFX('poweron');

    if (!MDT.booted) {
        MDT.booted = true;
        await bootSequence(officer);
    } else {
        // Quick resume — skip the full animation
        $('led-conn').classList.add('lit');
        printLine('');
        printLine('KDT-OS V2.09  ─  SYSTEM RESUMED.', 't-sys');
        printLine('OFFICER : ' + (officer.name     || 'UNKNOWN'), 't-main');
        printLine('UNIT    : ' + (officer.callsign || '??'),       't-main');
        printLine('');
        flashDataLED(500);
    }

    $('cmdInput').focus();
}

function onClose() {
    MDT.open = false;
    $('mdt-device').classList.add('hidden');
    $('led-pwr').classList.remove('lit');
    $('led-conn').classList.remove('lit');
    $('led-data').classList.remove('lit');
    stopClock();
    playSFX('poweroff');
}

// ── Clock ─────────────────────────────────────────────────────
let _clockInterval = null;

function startClock() {
    function tick() {
        const now = new Date();
        const hh  = String(now.getHours()).padStart(2, '0');
        const mm  = String(now.getMinutes()).padStart(2, '0');
        const ss  = String(now.getSeconds()).padStart(2, '0');
        $('hdr-time').textContent = hh + ':' + mm + ':' + ss;
    }
    tick();
    _clockInterval = setInterval(tick, 1000);
}

function stopClock() {
    clearInterval(_clockInterval);
    _clockInterval = null;
}

// ── Boot Sequence ────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function typewriterLine(text, delayPer, cls) {
    const output = $('terminal-output');
    const div    = document.createElement('div');
    if (cls) div.className = cls;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;

    for (const ch of text) {
        div.textContent += ch;
        _bootCharCount++;
        // Play sound on every 3rd non-space character to avoid audio flood
        if (ch !== ' ' && _bootCharCount % 3 === 0) playKeySound();
        await sleep(delayPer);
    }
    return div;
}

async function bootSequence(officer) {
    _bootCharCount = 0;
    $('screen-crt').classList.add('booting');

    const lines = [
        { t: '',                                                            cls: 't-dim'    },
        { t: 'JUERGENROLA INC.  --  MOBILE DATA TERMINAL',                 cls: 't-bright' },
        { t: 'MODEL: MDT-9100   SERIES: KDT-OS REV 2.09',                  cls: 't-bright' },
        { t: 'BUILD: 19850312   SN: ' + randSN(),                           cls: 't-dim'    },
        { t: '',                                                            cls: ''         },
        { t: 'SELF TEST ............... ', cls: 't-dim', append: 'OK',         appendCls: 't-bright' },
        { t: 'MEMORY TEST ............. ', cls: 't-dim', append: 'OK',         appendCls: 't-bright' },
        { t: 'RADIO LINK .............. ', cls: 't-dim', append: 'CONNECTED',  appendCls: 't-sys', delay: 200 },
        { t: 'DISPATCH DATABASE ....... ', cls: 't-dim', append: 'ONLINE',     appendCls: 't-sys', delay: 100 },
        { t: '',                                                            cls: ''         },
        { t: 'OFFICER : ' + (officer.name     || 'UNKNOWN'),               cls: 't-main'   },
        { t: 'BADGE   : ' + (officer.grade    || 'N/A'),                   cls: 't-main'   },
        { t: 'UNIT    : ' + (officer.callsign || '??'),                    cls: 't-main'   },
        { t: 'JOB     : ' + (officer.job      || 'POLICE'),                cls: 't-main'   },
        { t: '',                                                            cls: ''         },
        { t: 'SYSTEM READY.  TYPE /HELP FOR COMMANDS.',                    cls: 't-sys'    },
        { t: '',                                                            cls: ''         },
    ];

    for (const ln of lines) {
        if (ln.append) {
            const d = await typewriterLine(ln.t, 18, ln.cls);
            await sleep(ln.delay || 60);
            const span = document.createElement('span');
            span.className  = ln.appendCls || '';
            span.textContent = ln.append;
            d.appendChild(span);
        } else {
            await typewriterLine(ln.t, 18, ln.cls);
        }
        await sleep(30);
    }

    $('led-conn').classList.add('lit');
    $('screen-crt').classList.remove('booting');
    flashDataLED();
}

function randSN() {
    return 'MDT' + Math.floor(10000 + Math.random() * 90000);
}

function flashDataLED(ms = 300) {
    const led = $('led-data');
    led.classList.add('lit');
    setTimeout(() => led.classList.remove('lit'), ms);
}

// ── Terminal Output ───────────────────────────────────────────

function printLine(text, cls) {
    if (text === null || text === undefined) return;
    const output = $('terminal-output');
    const div    = document.createElement('div');

    if (!cls) {
        const t = text.toUpperCase();
        if (t.startsWith('SYS_ERR') || t.startsWith('!! ') || t.includes('CAUTION'))  cls = 't-alert';
        else if (t.startsWith('SYS_MSG') || t.startsWith('SYS_MSG'))                  cls = 't-sys';
        else if (t.startsWith('╔') || t.startsWith('╚') || t.startsWith('> '))        cls = 't-bright';
        else if (t.startsWith('!!') || t.includes('WARRANT'))                         cls = 't-warn';
    }

    div.className   = 't-line ' + (cls || '');
    div.textContent = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    flashDataLED(150);
}

function printLines(lines) {
    if (!Array.isArray(lines)) return;
    lines.forEach(l => { if (l !== null && l !== undefined) printLine(l); });
}

function clearTerminal() {
    $('terminal-output').innerHTML = '';
}

// ── View Switching ───────────────────────────────────────────

function switchView(name) {
    Object.values(views).forEach(v => { if (v) v.classList.remove('active'); });
    if (views[name]) {
        views[name].classList.add('active');
    } else {
        views.terminal.classList.add('active');
        name = 'terminal';
    }
    MDT.view = name;
}

// ── Command Processing ────────────────────────────────────────

function processCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) return;

    MDT.history.unshift(trimmed);
    if (MDT.history.length > 50) MDT.history.pop();
    MDT.historyPos = -1;

    const upper = trimmed.toUpperCase();
    const parts = upper.split(' ');
    const cmd   = parts[0];
    const args  = parts.slice(1);

    if (MDT.view !== 'terminal') switchView('terminal');
    printLine('> ' + upper, 't-input');

    // Client-side commands
    if (cmd === '/CLEAR') {
        clearTerminal();
        return;
    }
    if (cmd === '/HELP') {
        showHelp();
        return;
    }
    if (cmd === '/CLOSE' || cmd === 'EXIT') {
        closeMDT();
        return;
    }
    if (cmd === '/REPORT' && args[0] === 'NEW') {
        openReportForm();
        return;
    }
    if (cmd === '/DISPATCH') {
        if (args[0] === 'CLEAR') {
            MDT.dispatchCalls = [];
            printLine('SYS_MSG: DISPATCH LOG CLEARED.', 't-sys');
        } else {
            renderDispatchList();
            switchView('dispatch');
        }
        return;
    }

    // Forward everything else to Lua
    fetch(`https://${GetParentResourceName()}/processCommand`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ command: cmd, arguments: args }),
    });
}

// ── Keyboard Handling ─────────────────────────────────────────

document.addEventListener('keydown', e => {
    const input = $('cmdInput');

    if (e.key === 'Escape') {
        if (!$('charges-overlay').classList.contains('hidden')) {
            closeChargesOverlay(); return;
        }
        if (!$('mugshot-overlay').classList.contains('hidden')) {
            $('mugshot-overlay').classList.add('hidden'); return;
        }
        closeMDT();
        return;
    }

    if (e.key.startsWith('F') && !isNaN(e.key.slice(1))) {
        const fnum = parseInt(e.key.slice(1));
        if (fnum >= 1 && fnum <= 12) {
            e.preventDefault();
            const btn = document.querySelector(`.fkey[data-fkey="${e.key}"]`);
            if (btn) btn.click();
            return;
        }
    }

    if (document.activeElement === input) {
        if (e.key === 'Enter') {
            const val = input.value;
            input.value = '';
            playKeySound();
            processCommand(val);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!MDT.history.length) return;
            MDT.historyPos = Math.min(MDT.historyPos + 1, MDT.history.length - 1);
            input.value = MDT.history[MDT.historyPos] || '';
            setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
            playScrollSound();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            MDT.historyPos = Math.max(MDT.historyPos - 1, -1);
            input.value = MDT.historyPos >= 0 ? (MDT.history[MDT.historyPos] || '') : '';
            playScrollSound();
            return;
        }
    }

    // Printable key — play sound + focus input
    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
            input.focus();
        }
        playKeySound();
    }
});

// ── F-Key buttons ─────────────────────────────────────────────

document.querySelectorAll('.fkey').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd     = btn.dataset.cmd || '';
        const instant = btn.dataset.instant === '1';
        if (cmd === 'EXIT') { closeMDT(); return; }
        if (instant) {
            processCommand(cmd);
        } else {
            const input   = $('cmdInput');
            input.value   = cmd;
            input.focus();
        }
    });
});

// ── Clickable Keyboard ────────────────────────────────────────

document.querySelectorAll('.kb-key:not(.kb-mod)').forEach(key => {
    key.addEventListener('click', () => {
        const char   = key.dataset.char;
        const action = key.dataset.action;
        const input  = $('cmdInput');

        if (char !== undefined) {
            input.value += char;
            input.focus();
            playKeySound();
            return;
        }

        switch (action) {
            case 'bksp':
                input.value = input.value.slice(0, -1);
                input.focus();
                playKeySound();
                break;
            case 'enter': {
                const val  = input.value;
                input.value = '';
                playKeySound();
                processCommand(val);
                break;
            }
            case 'esc':
                if (!$('charges-overlay').classList.contains('hidden')) {
                    closeChargesOverlay();
                } else if (!$('mugshot-overlay').classList.contains('hidden')) {
                    $('mugshot-overlay').classList.add('hidden');
                } else {
                    closeMDT();
                }
                break;
            case 'up':
                if (!MDT.history.length) return;
                MDT.historyPos = Math.min(MDT.historyPos + 1, MDT.history.length - 1);
                input.value    = MDT.history[MDT.historyPos] || '';
                input.focus();
                playScrollSound();
                break;
            case 'down':
                MDT.historyPos = Math.max(MDT.historyPos - 1, -1);
                input.value    = MDT.historyPos >= 0 ? (MDT.history[MDT.historyPos] || '') : '';
                input.focus();
                playScrollSound();
                break;
            case 'left':
            case 'right':
                input.focus();
                break;
        }
    });
});

// ── Close MDT ────────────────────────────────────────────────

function closeMDT() {
    fetch(`https://${GetParentResourceName()}/closeMDT`, { method: 'POST' });
}

// ── Help ──────────────────────────────────────────────────────

function showHelp() {
    switchView('terminal');
    printLines([
        '',
        '╔══ KDT-OS COMMAND REFERENCE ════════════════════╗',
        '  PERSON    /SEARCH [NAME or CID]',
        '  RECORD    /VIEW [CID]',
        '  PLATE     /PLATE [PLATE NUMBER]',
        '  REPORTS   /REPORTS [CID]',
        '  REPORT    /REPORT NEW  |  /REPORT VIEW [ID]',
        '  WARRANT   /WARRANT NEW [CID] [CHARGES]',
        '            /WARRANT LIST  |  /WARRANT CLEAR [ID]',
        '  BOLO      /BOLO [DESCRIPTION]',
        '            /BOLO LIST  |  /BOLO CLEAR [ID]',
        '  CITATION  /CITE [CID] [FINE] [VIOLATION]',
        '  OFFICERS  /OFFICERS',
        '  STATUS    /STATUS [1-6]',
        '            1=AVAIL 2=BUSY 3=SCENE 4=PURSUIT 5=STAKEOUT 6=OFF',
        '  MESSAGE   /MSG [UNIT] [MESSAGE]',
        '  CALLSIGN  /CALLSIGN [NEW-ID]',
        '  DISPATCH  /DISPATCH  |  /DISPATCH CLEAR',
        '  ROSTER    /ROSTER',
        '  UTILITY   /CLEAR  |  /HELP  |  /CLOSE',
        '  FKEYS     F1-F12  (see function key panel)',
        '╚════════════════════════════════════════════════╝',
        '',
    ]);
}

// ── Callsign Update ───────────────────────────────────────────

function onCallsignUpdated(cs) {
    if (MDT.officer) MDT.officer.callsign = cs;
    $('hdr-unit').textContent = 'UNIT: ' + cs;
}

// ── Citizen Record ────────────────────────────────────────────

function displayRecord(r) {
    MDT.currentCID = r.cid;

    $('rec-name').textContent  = r.name   || 'UNKNOWN';
    $('rec-cid').textContent   = r.cid    || 'N/A';
    $('rec-dob').textContent   = r.dob    || 'N/A';
    $('rec-sex').textContent   = r.sex    || 'N/A';
    $('rec-phone').textContent = r.phone  || 'N/A';
    $('rec-flags').textContent = r.flags  || 'NONE';
    $('rec-notes').textContent = r.notes  || 'NO OFFICER NOTES ON FILE.';

    const wc   = r.warrants ? r.warrants.length : 0;
    const wcEl = $('rec-warrant-count');
    wcEl.textContent = wc > 0 ? wc + ' ACTIVE WARRANT(S)' : 'NONE';
    wcEl.className   = 'fv ' + (wc > 0 ? 'warn' : '');

    const mugEl = $('rec-mugshot');
    const silEl = $('rec-silhouette');
    if (r.mugshot) {
        mugEl.src = r.mugshot;
        mugEl.style.display = '';
        silEl.style.display = 'none';
    } else {
        mugEl.style.display = 'none';
        silEl.style.display = 'flex';
    }

    const repContainer = $('rec-reports');
    repContainer.innerHTML = '';
    if (!r.reports || r.reports.length === 0) {
        repContainer.innerHTML = '<span class="dim">NO ARREST RECORDS ON FILE.</span>';
    } else {
        r.reports.forEach(rep => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            const ts = rep.timestamp ? rep.timestamp.split('T')[0] : 'N/A';
            div.innerHTML =
                `<span class="ri-id">RPT-${String(rep.id).padStart(4,'0')}</span>` +
                `<span class="ri-title">${esc(rep.title)}</span>` +
                `<span class="ri-meta"> [${ts}] [${esc(rep.status)}]</span>`;
            repContainer.appendChild(div);
        });
    }

    const wContainer = $('rec-warrants');
    wContainer.innerHTML = '';
    if (!r.warrants || r.warrants.length === 0) {
        wContainer.innerHTML = '<span class="dim">NO ACTIVE WARRANTS.</span>';
    } else {
        r.warrants.forEach(w => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            const ts = w.issued_at ? w.issued_at.split('T')[0] : 'N/A';
            div.innerHTML =
                `<span class="ri-warn">!! W-${w.id} : ${esc(w.charges)}</span>` +
                `<span class="ri-meta"> [${ts}] BY ${esc(w.issued_by)}</span>`;
            wContainer.appendChild(div);
        });
    }

    const cContainer = $('rec-citations');
    cContainer.innerHTML = '';
    if (!r.citations || r.citations.length === 0) {
        cContainer.innerHTML = '<span class="dim">NO CITATIONS ON FILE.</span>';
    } else {
        r.citations.forEach(c => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            const ts = c.issued_at ? c.issued_at.split('T')[0] : 'N/A';
            div.innerHTML =
                `<span class="ri-id">CIT-${String(c.id).padStart(4,'0')}</span>` +
                `<span class="ri-title">${esc(c.violation)}</span>` +
                `<span class="ri-meta"> $${c.fine} [${ts}]</span>`;
            cContainer.appendChild(div);
        });
    }

    switchView('record');
    flashDataLED();
}

$('btn-rec-close').addEventListener('click', () => {
    MDT.currentCID = null;
    switchView('terminal');
    printLine('RECORD CLOSED.');
});

$('btn-rec-mugshot').addEventListener('click', () => {
    if (!MDT.currentCID) return;
    $('mugshot-url-input').value   = '';
    $('mugshot-notes-input').value = '';
    $('mugshot-flags-input').value = '';
    $('mugshot-overlay').classList.remove('hidden');
    $('mugshot-url-input').focus();
});

$('btn-save-mugshot').addEventListener('click', () => {
    if (!MDT.currentCID) return;
    const url   = $('mugshot-url-input').value.trim();
    const notes = $('mugshot-notes-input').value.trim().toUpperCase();
    const flags = $('mugshot-flags-input').value.trim().toUpperCase();

    fetch(`https://${GetParentResourceName()}/updateProfile`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ cid: MDT.currentCID, mugshot: url, notes, flags }),
    });

    $('mugshot-overlay').classList.add('hidden');
    printLine('PROFILE UPDATE TRANSMITTED.', 't-sys');
    switchView('terminal');
});

$('btn-cancel-mugshot').addEventListener('click', () => {
    $('mugshot-overlay').classList.add('hidden');
});

// ── Warrants View ─────────────────────────────────────────────

function displayWarrants(warrants) {
    const container = $('warrants-list');
    container.innerHTML = '';
    if (!warrants || warrants.length === 0) {
        container.innerHTML = '<div class="dim">NO ACTIVE WARRANTS ON FILE.</div>';
        switchView('warrants'); return;
    }
    warrants.forEach(w => {
        const div = document.createElement('div');
        div.className = 'list-item';
        const ts = w.issued_at ? w.issued_at.split('T')[0] : 'N/A';
        div.innerHTML =
            `<span class="warn">W-${w.id}</span>  ` +
            `<span class="bright">${esc(w.citizen_name)}</span>  ` +
            `<span class="dim">[${esc(w.citizen_id)}]</span><br>` +
            `<span class="dim">  CHARGES : </span><span>${esc(w.charges)}</span><br>` +
            `<span class="dim">  ISSUED  : ${ts} BY ${esc(w.issued_by)}</span>`;
        container.appendChild(div);
    });
    switchView('warrants');
    flashDataLED();
}

// ── BOLOs View ────────────────────────────────────────────────

function displayBOLOs(bolos) {
    const container = $('bolos-list');
    container.innerHTML = '';
    if (!bolos || bolos.length === 0) {
        container.innerHTML = '<div class="dim">NO ACTIVE BOLOS ON FILE.</div>';
        switchView('bolos'); return;
    }
    bolos.forEach(b => {
        const div = document.createElement('div');
        div.className = 'list-item';
        const ts = b.issued_at ? b.issued_at.split('T')[0] : 'N/A';
        div.innerHTML =
            `<span class="warn">BOLO-${b.id}</span>  ` +
            `<span class="bright">${esc(b.description)}</span><br>` +
            (b.suspect_name ? `<span class="dim">  SUSPECT : </span><span>${esc(b.suspect_name)}</span><br>` : '') +
            (b.plate        ? `<span class="dim">  PLATE   : </span><span>${esc(b.plate)}</span><br>` : '') +
            `<span class="dim">  REASON  : ${esc(b.reason)}</span><br>` +
            `<span class="dim">  ISSUED  : ${ts} BY ${esc(b.issued_by)}</span>`;
        container.appendChild(div);
    });
    switchView('bolos');
    flashDataLED();
}

// ── Reports List View ─────────────────────────────────────────

function displayReports(reports, cid) {
    $('reports-view-title').textContent = cid
        ? `╔══ REPORTS FOR ${cid} ════════════════════════════╗`
        : '╔══ INCIDENT REPORTS ════════════════════════════╗';

    const container = $('reports-list');
    container.innerHTML = '';
    if (!reports || reports.length === 0) {
        container.innerHTML = '<div class="dim">NO REPORTS ON FILE.</div>';
        switchView('reports'); return;
    }
    reports.forEach(r => {
        const div = document.createElement('div');
        div.className  = 'list-item';
        const ts       = r.timestamp ? r.timestamp.split('T')[0] : 'N/A';
        div.innerHTML  =
            `<span class="dim">RPT-${String(r.id).padStart(4,'0')}</span>  ` +
            `<span class="bright">${esc(r.title)}</span><br>` +
            `<span class="dim">  STATUS : ${esc(r.status)}  |  DATE : ${ts}</span>`;
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => processCommand('/REPORT VIEW ' + r.id));
        container.appendChild(div);
    });
    switchView('reports');
    flashDataLED();
}

// ── Single Report View ────────────────────────────────────────

function displaySingleReport(r) {
    if (!r) return;
    const container = $('single-report-body');
    container.innerHTML = '';
    const ts = r.timestamp ? r.timestamp.split('T')[0] : 'N/A';
    const rows = [
        ['REPORT ID', 'RPT-' + String(r.id).padStart(4, '0')],
        ['TITLE',     r.title],
        ['DATE',      ts],
        ['STATUS',    r.status],
        ['SUSPECTS',  r.suspects  || 'N/A'],
        ['PLATES',    r.plates    || 'N/A'],
        ['OFFICERS',  r.officers  || 'N/A'],
        ['CHARGES',   r.charges   || 'N/A'],
        ['EVIDENCE',  r.evidence  || 'N/A'],
        ['WARRANT',   r.is_warrant ? 'YES' : 'NO'],
        ['BOLO',      r.is_bolo   ? 'YES' : 'NO'],
        ['AUTHOR',    (r.author_name || 'N/A') + ' [' + (r.author_cid || 'N/A') + ']'],
    ];
    rows.forEach(([label, val]) => {
        const div = document.createElement('div');
        div.className = 'sr-row';
        div.innerHTML = `<span class="sr-label">${esc(label)}</span><span class="sr-val">${esc(String(val || 'N/A').toUpperCase())}</span>`;
        container.appendChild(div);
    });
    if (r.narrative) {
        const sep = document.createElement('div');
        sep.className   = 'dim';
        sep.textContent = '─────────────────────────────────';
        container.appendChild(sep);
        const nar = document.createElement('div');
        nar.className   = 'sr-narrative';
        nar.textContent = r.narrative.toUpperCase();
        container.appendChild(nar);
    }
    switchView('singleReport');
    flashDataLED();
}

$('btn-report-close').addEventListener('click', () => switchView('terminal'));

// ── Officers View ─────────────────────────────────────────────

function displayOfficers(officers) {
    const container = $('officers-list');
    container.innerHTML = '';
    if (!officers || officers.length === 0) {
        container.innerHTML = '<div class="dim">NO OFFICERS CURRENTLY ON MDT.</div>';
        switchView('officers'); return;
    }
    officers.forEach(o => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML =
            `<span class="warn">UNIT ${esc(o.callsign || '??')}</span>  ` +
            `<span class="bright">${esc(o.name || 'UNKNOWN')}</span><br>` +
            `<span class="dim">  JOB : ${esc(o.job || 'N/A')}  |  STATUS : ${esc(o.status || 'AVAILABLE')}</span>`;
        container.appendChild(div);
    });
    switchView('officers');
    flashDataLED();
}

// ── Incoming Message ─────────────────────────────────────────

function onMessage({ from, fromName, message }) {
    printLines([
        '',
        '╔══ INCOMING TRANSMISSION ═══════════════════════╗',
        '  FROM  : UNIT ' + (from || '??') + ' — ' + (fromName || 'UNKNOWN'),
        '  MSG   : ' + (message || ''),
        '╚════════════════════════════════════════════════╝',
        '',
    ]);
    flashDataLED(600);
}

// ── Status Update ─────────────────────────────────────────────

function onStatusUpdated(status) {
    $('fk-status-text').textContent = status || 'AVAILABLE';
}

// ── Report Form ───────────────────────────────────────────────

function openReportForm() {
    ['rep-title','rep-suspects','rep-plates','rep-officers','rep-charges','rep-evidence']
        .forEach(id => { $(id).value = ''; });
    $('rep-narrative').value = '';
    $('rep-status').value    = 'OPEN';
    $('rep-warrant').checked = false;
    $('rep-bolo').checked    = false;
    MDT.activeCharges = [];
    MDT.chargeMonths  = 0;
    MDT.chargeFine    = 0;
    switchView('reportForm');
    $('rep-title').focus();
}

$('btn-cancel-report').addEventListener('click', () => {
    switchView('terminal');
    printLine('REPORT ENTRY CANCELLED.', 't-dim');
    $('cmdInput').focus();
});

$('btn-submit-report').addEventListener('click', () => {
    const title     = $('rep-title').value.trim().toUpperCase();
    const narrative = $('rep-narrative').value.trim().toUpperCase();
    if (!title || !narrative) {
        printLine('SYS_ERR: TITLE AND NARRATIVE ARE REQUIRED.', 't-alert');
        switchView('terminal'); return;
    }
    const data = {
        title, narrative,
        suspects  : $('rep-suspects').value.trim().toUpperCase(),
        officers  : $('rep-officers').value.trim().toUpperCase(),
        plates    : $('rep-plates').value.trim().toUpperCase(),
        charges   : $('rep-charges').value.trim().toUpperCase(),
        evidence  : $('rep-evidence').value.trim(),
        status    : $('rep-status').value,
        is_warrant: $('rep-warrant').checked,
        is_bolo   : $('rep-bolo').checked,
    };
    fetch(`https://${GetParentResourceName()}/submitReport`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(data),
    });
    switchView('terminal');
    printLine('TRANSMITTING REPORT TO DISPATCH SERVER...', 't-sys');
    $('cmdInput').focus();
});

// ── Charges Selector ─────────────────────────────────────────

$('btn-open-charges').addEventListener('click', () => {
    buildChargesList();
    $('charges-overlay').classList.remove('hidden');
});

$('btn-close-charges').addEventListener('click', closeChargesOverlay);

function closeChargesOverlay() {
    $('charges-overlay').classList.add('hidden');
    updateChargesSummary();
}

function buildChargesList() {
    const container = $('charges-list');
    container.innerHTML = '';
    const catNames = {
        1: 'CAT 1 — CRIMES AGAINST PERSONS',
        2: 'CAT 2 — PROPERTY CRIMES',
        3: 'CAT 3 — DRUG OFFENSES',
        4: 'CAT 4 — WEAPONS OFFENSES',
        5: 'CAT 5 — TRAFFIC VIOLATIONS',
        6: 'CAT 6 — CRIMES AGAINST GOVERNMENT',
    };
    for (const catNum in MDT.penalCode) {
        const hdr = document.createElement('div');
        hdr.className   = 'charge-cat-title';
        hdr.textContent = catNames[catNum] || 'CAT ' + catNum;
        container.appendChild(hdr);

        MDT.penalCode[catNum].forEach(charge => {
            const div = document.createElement('div');
            div.className   = 'charge-item' + (isChargeActive(charge.id) ? ' selected' : '');
            const months    = charge.months > 0 ? charge.months + ' MO' : '0 MO';
            div.textContent = `${isChargeActive(charge.id) ? '[X]' : '[ ]'} ${charge.id} — ${charge.title.toUpperCase()} (${months} | $${charge.fine})`;
            div.title = charge.description || '';
            div.addEventListener('click', () => {
                toggleCharge(charge);
                div.classList.toggle('selected', isChargeActive(charge.id));
                div.textContent = `${isChargeActive(charge.id) ? '[X]' : '[ ]'} ${charge.id} — ${charge.title.toUpperCase()} (${months} | $${charge.fine})`;
                updateChargeTotalsDisplay();
            });
            container.appendChild(div);
        });
    }
    updateChargeTotalsDisplay();
}

function isChargeActive(id)  { return MDT.activeCharges.some(c => c.id === id); }

function toggleCharge(charge) {
    const idx = MDT.activeCharges.findIndex(c => c.id === charge.id);
    if (idx > -1) {
        MDT.activeCharges.splice(idx, 1);
        MDT.chargeMonths -= charge.months;
        MDT.chargeFine   -= charge.fine;
    } else {
        MDT.activeCharges.push(charge);
        MDT.chargeMonths += charge.months;
        MDT.chargeFine   += charge.fine;
    }
}

function updateChargeTotalsDisplay() {
    $('charge-totals').textContent = MDT.chargeMonths + ' MO | $' + MDT.chargeFine;
}

function updateChargesSummary() {
    $('rep-charges').value = MDT.activeCharges.map(c => c.id).join(', ');
}

// ── Dispatch System ───────────────────────────────────────────

let _dispatchAlertTimer = null;

function onDispatchCall(call, mdtOpen) {
    // Always show the HUD popup (visible even when MDT is closed)
    showDispatchHUD(call);

    // If MDT is open, also do the in-terminal banner + log
    if (mdtOpen || MDT.open) {
        MDT.dispatchCalls.unshift(call);
        if (MDT.dispatchCalls.length > 20) MDT.dispatchCalls.pop();
        showDispatchBanner(call);
        if (MDT.view === 'dispatch') renderDispatchList();
    }
}

function showDispatchBanner(call) {
    $('da-code').textContent = '!! ' + (call.code || '10-0');
    $('da-msg').textContent  = (call.message || 'INCIDENT').toUpperCase();
    $('da-loc').textContent  = call.street ? ('LOC: ' + call.street.toUpperCase()) : '';

    const banner = $('dispatch-alert');
    banner.classList.remove('hidden');
    flashDataLED(2500);

    clearTimeout(_dispatchAlertTimer);
    _dispatchAlertTimer = setTimeout(() => banner.classList.add('hidden'), 8000);
}

// ── Standalone HUD popup (works even when MDT is closed) ─────
let _hudTimer = null;

function showDispatchHUD(call) {
    $('dh-code').textContent = call.code    || '10-0';
    $('dh-msg').textContent  = (call.message || 'INCIDENT').toUpperCase();
    $('dh-loc').textContent  = call.street ? ('LOC: ' + call.street.toUpperCase()) : '';

    const hud = $('dispatch-hud');
    // Re-trigger animation by briefly removing element
    hud.classList.add('hidden');
    void hud.offsetWidth; // force reflow
    hud.classList.remove('hidden');

    clearTimeout(_hudTimer);
    _hudTimer = setTimeout(() => hud.classList.add('hidden'), 10000);
}

$('da-close').addEventListener('click', () => {
    $('dispatch-alert').classList.add('hidden');
    clearTimeout(_dispatchAlertTimer);
});

function renderDispatchList() {
    const container = $('dispatch-list');
    container.innerHTML = '';

    if (!MDT.dispatchCalls || MDT.dispatchCalls.length === 0) {
        container.innerHTML = '<div class="dim">NO CALLS ON LOG.  AWAITING DISPATCH FEED...</div>';
        return;
    }

    MDT.dispatchCalls.forEach(call => {
        const div = document.createElement('div');
        div.className = 'list-item dispatch-call-item';
        div.innerHTML =
            `<span class="t-alert">!! ${esc(call.code || '10-0')}</span>  ` +
            `<span class="bright">${esc((call.message || 'INCIDENT').toUpperCase())}</span>` +
            (call.time ? `  <span class="dim">[${esc(call.time)}]</span>` : '') +
            '<br>' +
            (call.street
                ? `<span class="dim">   LOC: ${esc(call.street.toUpperCase())}</span><br>`
                : '') +
            (call.priority
                ? `<span class="dim">   PRIORITY: CODE ${esc(String(call.priority))}</span>`
                : '');
        container.appendChild(div);
    });
}

// ── Roster / Personnel Management ────────────────────────────

function _populateRosterJobs() {
    const sel = $('roster-job');
    if (!sel) return;
    sel.innerHTML = '';
    MDT.rosterJobs.forEach(j => {
        const opt = document.createElement('option');
        opt.value       = j.name;
        opt.textContent = j.label;
        sel.appendChild(opt);
    });
}

function displayRoster(roster, canManage) {
    MDT.canManageRoster = !!canManage;
    const container = $('roster-list');
    container.innerHTML = '';

    if (!roster || roster.length === 0) {
        container.innerHTML = '<div class="dim">NO OFFICERS CURRENTLY ONLINE.</div>';
    } else {
        roster.forEach(o => {
            const div = document.createElement('div');
            div.className = 'list-item roster-item';

            div.innerHTML =
                `<span class="warn">UNIT ${esc(o.callsign || '??')}</span>  ` +
                `<span class="bright">${esc(o.name)}</span>  ` +
                `<span class="dim">[SID:${o.src}]</span><br>` +
                `<span class="dim">  JOB: ${esc(o.job || 'N/A')} / GRADE ${o.grade || 0}</span>`;

            if (canManage && o.canEdit) {
                const actions = document.createElement('div');
                actions.className = 'roster-actions';
                actions.innerHTML =
                    `<button class="s-btn s-btn-sm roster-act" data-action="promote" data-sid="${o.src}">[ PROMOTE ]</button>` +
                    `<button class="s-btn s-btn-sm roster-act" data-action="demote"  data-sid="${o.src}">[ DEMOTE  ]</button>` +
                    `<button class="s-btn s-btn-sm s-btn-danger roster-act" data-action="fire" data-sid="${o.src}">[ DISMISS ]</button>`;
                div.appendChild(actions);
            }
            container.appendChild(div);
        });
    }

    // Show/hide management hire panel
    const panel = $('roster-mgmt-panel');
    if (canManage) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }

    switchView('roster');
    flashDataLED();
}

// Delegated click handler for inline roster action buttons
$('roster-list').addEventListener('click', e => {
    const btn = e.target.closest('.roster-act');
    if (!btn) return;
    const action    = btn.dataset.action;
    const targetSrc = parseInt(btn.dataset.sid);
    if (!action || isNaN(targetSrc)) return;
    fetch(`https://${GetParentResourceName()}/rosterAction`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ action, targetSrc }),
    });
    switchView('terminal');
    printLine('ROSTER: ' + action.toUpperCase() + ' — SID ' + targetSrc + '...', 't-sys');
});

// Hire / Set-job button
$('btn-roster-set').addEventListener('click', () => {
    const sid   = parseInt($('roster-sid').value.trim());
    const job   = $('roster-job').value;
    const grade = parseInt($('roster-grade').value.trim()) || 0;
    if (isNaN(sid)) { printLine('SYS_ERR: ENTER A VALID SERVER ID.', 't-alert'); switchView('terminal'); return; }
    fetch(`https://${GetParentResourceName()}/rosterAction`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ action: 'setjob', targetSrc: sid, job, grade }),
    });
    switchView('terminal');
    printLine('ROSTER: ASSIGNING ' + job.toUpperCase() + ' GRADE ' + grade + ' TO SID ' + sid + '...', 't-sys');
});

// Dismiss / Fire button
$('btn-roster-fire').addEventListener('click', () => {
    const sid = parseInt($('roster-sid').value.trim());
    if (isNaN(sid)) { printLine('SYS_ERR: ENTER A VALID SERVER ID.', 't-alert'); switchView('terminal'); return; }
    fetch(`https://${GetParentResourceName()}/rosterAction`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ action: 'fire', targetSrc: sid }),
    });
    switchView('terminal');
    printLine('ROSTER: DISMISSING SID ' + sid + ' FROM SERVICE...', 't-sys');
});

// ── Utility ───────────────────────────────────────────────────

function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

if (typeof window.GetParentResourceName !== 'function') {
    window.GetParentResourceName = function() {
        return 'juergen_mdt';
    };
}
