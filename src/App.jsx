import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import ModernApp from './components/ModernMDT/ModernApp';
import './App.css';

/* ============================================================
   SCROLL PROGRESS
   ============================================================ */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el  = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div className="scroll-progress">
      <motion.div className="scroll-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ============================================================
   KONAMI CODE EASTER EGG
   ============================================================ */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function KonamiOverlay({ onClose }) {
  return (
    <motion.div
      className="konami-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.img
        src="/vault-logo.png"
        alt="Vault-Tec Logo"
        className="konami-img"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      />
      <div className="konami-title">KANDIDAT GENEHMIGT</div>
      <div className="konami-sub">
        VAULT JB-001 // SICHERHEITSSTUFE: MAKSIMUM<br />
        WILLKOMMEN IN DER ZUKUNFT, JUSTIN.
      </div>
      <div className="konami-dismiss">[ BELIEBIGE TASTE DRÜCKEN ]</div>
    </motion.div>
  );
}

/* ============================================================
   ACHIEVEMENT TOASTS
   ============================================================ */
const ACH = [
  { id: 'about',      star: '★', label: 'VAULT-TEC MELDUNG',  text: 'KANDIDATENPROFIL GELADEN'    },
  { id: 'experience', star: '★', label: 'VAULT-TEC MELDUNG',  text: 'OPERATIVE HISTORY GEFUNDEN'  },
  { id: 'special',    star: '!', label: 'APTITUDE SCAN',       text: 'S.P.E.C.I.A.L. AUSGEWERTET' },
  { id: 'mdt',        star: '!', label: 'CLASSIFIED FILE',     text: 'PROJEKT MDT-9100 ENTDECKT'   },
  { id: 'lessons',    star: '▲', label: 'INCIDENT REPORT',     text: 'SICHERHEITSPROTOKOLL AKTIV'  },
  { id: 'personal',   star: '★', label: 'PSYCHOLOGISCHES PROFIL', text: 'PERSÖNLICHKEIT ERFASST'  },
];

function AchievementShelf({ toasts }) {
  return (
    <div className="achievement-shelf">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.key}
            className="achievement-toast"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="toast-star">{t.star}</div>
            <div className="toast-body">
              <span className="toast-label">{t.label}</span>
              <span className="toast-text">{t.text}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   UTILITIES
   ============================================================ */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

function SectionLabel({ number, label }) {
  return (
    <div className="section-label">
      <span className="section-num">{number}</span>
      <span>—</span>
      <span>{label}</span>
    </div>
  );
}

function VtDivider({ text }) {
  return (
    <div className="vt-divider">
      <div className="vt-divider-line" />
      <span className="vt-divider-star">{text || '★ VAULT-TEC INDUSTRIES ★'}</span>
      <div className="vt-divider-line" />
    </div>
  );
}

function useAchieveTrigger(id, fn) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  useEffect(() => { if (isInView) fn(id); }, [isInView]); // eslint-disable-line
  return ref;
}

function SkillBar({ name, pct, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  return (
    <div ref={ref}>
      <div className="skill-row">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-track">
        <motion.div className="skill-fill"
          style={{ background: color || 'var(--blue)' }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   HERO — VAULT-TEC RECRUITMENT POSTER
   ============================================================ */
function Hero() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [easterMsg, setEasterMsg] = useState(false);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) { setEasterMsg(true); setLogoClicks(0); }
  };

  return (
    <section className="hero-section">
      <motion.div className="hero-vault-header"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8 }}
      >
        VAULT-TEC INDUSTRIES — TALENT ACQUISITION DIVISION
      </motion.div>

      <motion.div className="hero-logo-wrap"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleLogoClick}
        title="..."
      >
        <img src="/vault-logo.png" alt="Justin Baltes — Vault-Tec" className="hero-logo" />
        <AnimatePresence>
          {easterMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', bottom: '-2rem', left: '50%',
                transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                fontFamily: 'var(--ff-data)', fontSize: '0.65rem',
                letterSpacing: '0.18em', color: 'var(--yellow)',
              }}
              onAnimationComplete={() => setTimeout(() => setEasterMsg(false), 2000)}
            >
              // VAULT-TEC SICHERHEIT AKTIV //
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div className="hero-candidate-id"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        KANDIDATEN-NR. <span>JB-001</span> // KLASSIFIZIERUNG: SYSTEMINTEGRATION
      </motion.div>

      <motion.div className="hero-rule-wrap"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="hero-rule" />
        <span className="hero-rule-text">OPERATIVE DOSSIER</span>
        <div className="hero-rule" />
      </motion.div>

      <motion.div className="hero-tagline"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        IT-Operations &amp; Infrastruktur
      </motion.div>

      <motion.p className="hero-tagline-sub"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Systemadministrator ohne Titel. Jahre echter Praxis, keine Abkürzungen.
        Ich baue, bis es funktioniert — und dokumentiere, was andere vergessen.
      </motion.p>

      <motion.div className="hero-tags"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="hero-tag">SAARLAND</span>
        <span className="hero-tag-sep">·</span>
        <span className="hero-tag">QUEREINSTEIGER</span>
        <span className="hero-tag-sep">·</span>
        <span className="hero-tag">SEIT 2019 AKTIV</span>
      </motion.div>

      <motion.div className="hero-actions"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
      >
        <a href="/cv.pdf" className="site-btn-cta" download>Lebenslauf</a>
        <a href="#kontakt" className="site-btn-outline">Kontakt aufnehmen</a>
      </motion.div>

      <div className="hero-scroll">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Dossier einsehen</span>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIAL — VAULT-TEC CERTIFIED ENDORSEMENT
   ============================================================ */
function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="container">
        <FadeIn>
          <SectionLabel number="REF" label="EXTERNE VERIFIZIERUNG" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="testimonial-doc">
            <div className="doc-header">
              <div className="doc-from">
                <div className="doc-company">Optiserve Hosting Solutions Ltd.</div>
                <div className="doc-location">33 Lombard Street, London, EC3V 9BQ</div>
              </div>
              <div className="doc-date">01. April 2026</div>
            </div>

            <blockquote className="doc-quote">
              „Justin besitzt eine seltene Kombination aus rohem technischem Instinkt
              und akribischer Aufmerksamkeit für Details — Eigenschaften, die in der
              IT-Operations unerlässlich sind."
            </blockquote>

            <div className="doc-highlights">
              <div className="doc-highlight">
                <span className="doc-highlight-bullet">[ + ]</span>
                <span>
                  <strong>Infrastruktur-Setup:</strong> Provisionierte, konfigurierte
                  und deployede neue Server unter Debian/Ubuntu Linux zur Erweiterung
                  der Hosting-Kapazität.
                </span>
              </div>
              <div className="doc-highlight">
                <span className="doc-highlight-bullet">[ + ]</span>
                <span>
                  <strong>Game-Server-Management:</strong> Umfassende Verwaltung der
                  Pterodactyl-Panel-Umgebungen, einschließlich Docker-Container-Betrieb
                  für diverse Game-Server.
                </span>
              </div>
              <div className="doc-highlight">
                <span className="doc-highlight-bullet">[ + ]</span>
                <span>
                  <strong>Wartung &amp; Bug-Fixing:</strong> Proaktives Server-Health-Monitoring,
                  kritische Patches und Bugfixes zur Maximierung der Uptime.
                </span>
              </div>
              <div className="doc-highlight">
                <span className="doc-highlight-bullet">[ + ]</span>
                <span>
                  <strong>Technische Fehleranalyse:</strong> Lösung komplexer Backend-Probleme,
                  Log-Analyse, gelegentliche direkte Unterstützung des Kundenteams.
                </span>
              </div>
            </div>

            <div className="doc-footer">
              <div className="doc-author">
                <div className="doc-author-name">Jamie Lee Garner</div>
                <div className="doc-author-title">Director @ Optiserve Hosting Solutions · London</div>
              </div>
              <div className="doc-stamp">
                <div className="doc-stamp-text">VAULT-TEC</div>
                <div className="doc-stamp-text">VERIFIZIERT</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   ABOUT — CANDIDATE DOSSIER
   ============================================================ */
function About({ onAchieve }) {
  const ref = useAchieveTrigger('about', onAchieve);
  return (
    <section className="section" ref={ref}>
      <div className="container">
        <VtDivider text="KANDIDATENPROFIL // SEKTION 01" />
        <FadeIn>
          <SectionLabel number="01" label="HINTERGRUND" />
          <h2 className="section-heading">Kandidatenprofil</h2>
        </FadeIn>
        <div className="about-grid">
          <FadeIn delay={0.1}>
            <div className="about-stat-block">
              <div className="about-stat-header">VAULT-TEC KANDIDATENDATEN</div>
              {[
                ['Name',         'Justin Markus Baltes'],
                ['Kandidaten-Nr.','JB-001'],
                ['Standort',     'Nonnweiler, Saarland'],
                ['Geburtsjahr',  '2003'],
                ['Status',       'Aktiv suchend'],
                ['Zielposition', 'IT-Systemintegrator'],
                ['Erfahrung',    'Seit 2019'],
                ['Kontakt',      'me@jbaltes.de'],
              ].map(([k, v]) => (
                <div className="about-stat-row" key={k}>
                  <span className="about-stat-key">{k}</span>
                  <span className="about-stat-val">{v}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.18} className="about-right">
            <p>
              Ich bin Justin, 23 Jahre alt, aufgewachsen in{' '}
              <strong>Nonnweiler im Saarland</strong>. Mein Weg in die IT
              war kein gerader, aber er war echt. Während andere Ausbildungen
              absolvierten, habe ich Systeme gebaut, Netzwerke konfiguriert
              und Fehler so lange debuggt, bis ich sie verstanden habe.
            </p>
            <p>
              Seit 2019 arbeite ich in verschiedenen Umgebungen: Logistik,
              Disposition, IT-Support, Systemintegration, zuletzt auch als
              externer technischer Berater für{' '}
              <strong>Optiserve Hosting Solutions</strong>, ein UK-basierter
              Hosting-Anbieter. Serverbetrieb, Docker-Umgebungen, Debian/Ubuntu:
              produktive Praxis, nicht simulierte Übungen.
            </p>
            <p>
              Was ich suche: eine Umgebung, in der{' '}
              <strong>Leistung über Formalitäten</strong> steht. Kein Zertifikat
              beschreibt, was jemand kann. Nur die Arbeit tut es.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EXPERIENCE — OPERATIVE HISTORY
   ============================================================ */
const EXPS = [
  {
    date: '2024 – Heute',
    company: 'IONOS',
    role: 'IT-Support / Systemintegration',
    desc: 'Technischer Support und Systembetreuung. Infrastruktur, Ticketsysteme, interne Prozessverbesserung.',
    tags: ['Linux','Netzwerk','Ticketsystem','ITIL'],
  },
  {
    date: '2024',
    company: 'Optiserve Hosting Solutions',
    role: 'Externer Technischer Berater (UK-Remote)',
    desc: 'Server-Provisioning unter Debian/Ubuntu, Docker/Pterodactyl-Management, Monitoring, Backend-Fehleranalyse für britischen Hosting-Provider.',
    tags: ['Debian','Docker','Pterodactyl','Remote','Server-Ops'],
  },
  {
    date: '2023 – 2024',
    company: 'VSE AG',
    role: 'IT-Support',
    desc: 'Ersteinrichtung und Pflege von Arbeitsplatzsystemen. Hardware-Fehleranalyse, Windows-Administration, Nutzerverwaltung.',
    tags: ['Windows','Active Directory','Hardware','Helpdesk'],
  },
  {
    date: '2022 – 2023',
    company: 'WALTER-TEC',
    role: 'IT-Support / Dienstleistung',
    desc: 'Installation und Wartung von IT-Infrastruktur vor Ort. Netzwerkkonfiguration, direkter Kundenkontakt.',
    tags: ['Vor-Ort','Netzwerk','Kundendienst'],
  },
  {
    date: '2019 – 2022',
    company: 'Logistik / Verkauf',
    role: 'Diverse Stationen',
    desc: 'Disposition, Kundenkontakt, Prozessverbesserung. Grundlage für Strukturdenken und Kommunikation.',
    tags: ['Disposition','Kommunikation','Problemlösung'],
  },
];

function Experience({ onAchieve }) {
  const ref = useAchieveTrigger('experience', onAchieve);
  return (
    <section className="section" ref={ref}>
      <div className="container">
        <VtDivider text="OPERATIVE HISTORY // SEKTION 02" />
        <FadeIn>
          <SectionLabel number="02" label="OPERATIVE HISTORY" />
          <h2 className="section-heading">Berufliche Stationen</h2>
        </FadeIn>
        <div className="exp-list">
          {EXPS.map((e, i) => (
            <FadeIn key={e.company + e.date} delay={i * 0.05}>
              <div className="exp-item">
                <div>
                  <div className="exp-date">{e.date}</div>
                  <div className="exp-company">{e.company}</div>
                </div>
                <div className="exp-detail">
                  <div className="exp-role">{e.role}</div>
                  <p className="exp-desc">{e.desc}</p>
                  <div className="exp-tags">
                    {e.tags.map(t => <span key={t} className="exp-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   S.P.E.C.I.A.L. — APTITUDE ASSESSMENT
   ============================================================ */
const SPECIAL = [
  { letter: 'S', stat: 'STRUKTUR',         desc: 'Dokumentation, Ticketing, saubere Prozesse.', val: 8 },
  { letter: 'P', stat: 'PROBLEMLÖSUNG',     desc: 'Root-Cause-Analyse, Debugging, Eskalation.', val: 9 },
  { letter: 'E', stat: 'EIGENSTÄNDIGKEIT',  desc: 'Autodidaktisch seit 2019 — kein Kurs nötig.', val: 10 },
  { letter: 'C', stat: 'COMMUNICATION',     desc: 'Kundensupport, Teamarbeit, Stakeholder.', val: 7 },
  { letter: 'I', stat: 'INFRASTRUKTUR',     desc: 'Linux, Windows Server, Netz, Virtualisierung.', val: 8 },
  { letter: 'A', stat: 'ANPASSUNG',         desc: 'Neue Umgebungen, Tools und Teams ab Tag 1.', val: 9 },
  { letter: 'L', stat: 'LEISTUNG',          desc: 'Substanz über Schein. Immer.', val: 10 },
];

function SpecialRow({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className="special-row"
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <div className="special-letter">{item.letter}</div>
      <div className="special-body">
        <div className="special-stat-name">{item.stat}</div>
        <div className="special-desc">{item.desc}</div>
      </div>
      <div className="special-meter">
        <div className="special-dots">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className={`special-dot ${i < item.val ? 'filled' : 'empty'}`}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.2, delay: index * 0.06 + i * 0.04 + 0.3 }}
            />
          ))}
        </div>
        <div className="special-val">{item.val}/10</div>
      </div>
    </motion.div>
  );
}

function SpecialSection({ onAchieve }) {
  const ref = useAchieveTrigger('special', onAchieve);
  return (
    <section className="special-section" ref={ref}>
      <div className="container">
        <VtDivider text="APTITUDE ASSESSMENT // SEKTION 03" />
        <div className="special-header">
          <div className="special-title-wrap">
            <div className="special-title-line" />
            <h2 className="special-title">
              S.<span>P</span>.E.C.I.A.L.
            </h2>
            <div className="special-title-line" />
          </div>
          <div className="special-subtitle">
            KANDIDAT JB-001 // PSYCHOMETRISCHE AUSWERTUNG // VAULT-TEC APPROVED
          </div>
        </div>
        <div className="special-grid">
          {SPECIAL.map((item, i) => <SpecialRow key={item.letter} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SKILLS — SUPPLEMENTAL APTITUDE
   ============================================================ */
const SKILL_GROUPS = [
  {
    label: 'BETRIEBSSYSTEME',
    color: '#4A91D8',
    skills: [
      { name: 'Windows Server / Client',       pct: 85 },
      { name: 'Linux (Debian, Ubuntu, RHEL)',   pct: 72 },
      { name: 'Virtualisierung', pct: 65 },
      { name: 'Active Directory / GPO',         pct: 78 },
    ],
  },
  {
    label: 'NETZWERK',
    color: '#29BCBF',
    skills: [
      { name: 'TCP/IP, OSI-Modell',     pct: 80 },
      { name: 'Firewall-Konfiguration', pct: 68 },
      { name: 'VPN (IPsec, WireGuard)', pct: 62 },
      { name: 'Network-Administration',    pct: 74 },
    ],
  },
  {
    label: 'TOOLS & PROZESSE',
    color: '#F5C200',
    skills: [
      { name: 'Git & Versionskontrolle', pct: 82 },
      { name: 'Docker / Container',      pct: 60 },
      { name: 'Bash & PowerShell',       pct: 70 },
      { name: 'ITSM / Ticketsysteme',    pct: 88 },
    ],
  },
  {
    label: 'ENTWICKLUNG (HOBBY)',
    color: '#52C870',
    skills: [
      { name: 'JavaScript / React', pct: 78 },
      { name: 'HTML, CSS, SCSS',    pct: 85 },
      { name: 'Node.js / SQL',      pct: 62 },
      { name: 'REST APIs',          pct: 68 },
    ],
  },
];

function Skills() {
  return (
    <section className="section">
      <div className="container">
        <VtDivider text="SKILLS DATABASE // SEKTION 04" />
        <FadeIn>
          <SectionLabel number="04" label="SKILL DATABASE" />
          <h2 className="section-heading">Technische Fähigkeiten</h2>
        </FadeIn>
        <div className="skills-groups">
          {SKILL_GROUPS.map((g, i) => (
            <FadeIn key={g.label} delay={i * 0.07}>
              <div>
                <div className="skill-group-label" style={{ color: g.color }}>{g.label}</div>
                <div className="skill-bars">
                  {g.skills.map(s => <SkillBar key={s.name} name={s.name} pct={s.pct} color={g.color} />)}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MDT PROJECT — CLASSIFIED FILE
   ============================================================ */
function MDTProject({ onAchieve }) {
  const [mode, setMode] = useState('modern');
  const ref = useAchieveTrigger('mdt', onAchieve);
  return (
    <section className="section" ref={ref} style={{ background: 'var(--bg-2,#0D1B2E)' }}>
      <div className="container">
        <VtDivider text="CLASSIFIED PROJECT FILE // SEKTION 05" />
        <FadeIn>
          <SectionLabel number="05" label="EIGENENTWICKLUNG" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="project-kicker">PROJEKT-AKTE // FIVEM / ROLEPLAY // KLASSIFIZIERT</div>
          <h2 className="project-title">MDT-9100 System</h2>
          <p className="project-desc">
            Vollständig eigenentwickeltes Mobile Data Terminal für FiveM-Rollenspielserver.
            React-Frontend, proprietäre NUI-Kommunikationsschicht, Echtzeit-Datenverwaltung —
            plus einer separaten Retro-Version in HTML/CSS/JS. Beide Versionen laufen produktiv
            auf aktiven Servern.
          </p>
          <div className="mdt-toggle">
            <button className={`mdt-toggle-btn${mode === 'modern' ? ' active' : ''}`} onClick={() => setMode('modern')}>
              React Interface
            </button>
            <button className={`mdt-toggle-btn${mode === 'retro' ? ' active' : ''}`} onClick={() => setMode('retro')}>
              Retro Terminal
            </button>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          {mode === 'retro' ? (
            <div className="mdt-frame">
              <iframe src="/mdt/index.html" title="MDT Legacy Terminal" />
            </div>
          ) : (
            <div className="mdt-frame-modern mdt-vars-reset">
              <ModernApp />
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   LESSONS — INCIDENT REPORTS
   ============================================================ */
const LESSONS = [
  {
    title: 'Das Netzwerk Das Nie Fertig War',
    cause: 'Scope Creep ohne Ende. Jede Woche eine neue Idee, nie ein klares Ziel.',
    lesson: 'Projekte ohne definierten Abschluss laufen ewig. Seitdem: erst Ziel, dann Code.',
  },
  {
    title: 'Das Skript Das Die Produktion Brach',
    cause: 'Änderungen direkt live getestet. Backup? "Mach ich danach."',
    lesson: 'Staging-Umgebungen existieren aus gutem Grund. Seitdem: kein Live-System ohne Netz.',
  },
  {
    title: 'Das Ticket Das Verschwand',
    cause: 'Fehler mündlich weitergegeben, nicht dokumentiert. Drei Stunden später: vergessen.',
    lesson: 'Wenn es nicht schriftlich ist, existiert es nicht. Seitdem: alles ins System.',
  },
];

function Lessons({ onAchieve }) {
  const ref = useAchieveTrigger('lessons', onAchieve);
  return (
    <section className="section" ref={ref}>
      <div className="container">
        <VtDivider text="INCIDENT REPORTS // SEKTION 06" />
        <FadeIn>
          <SectionLabel number="06" label="INCIDENT REPORTS" />
          <h2 className="section-heading">Was schief lief</h2>
          <p className="lessons-intro">Fehler passieren. Was zählt ist was danach kommt.</p>
        </FadeIn>
        <div className="lessons-grid">
          {LESSONS.map((l, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="lesson-card">
                <div className="lesson-num">INCIDENT REPORT-{String(i + 1).padStart(3, '0')}</div>
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-block">
                  <div className="lesson-label">Ursache</div>
                  <p className="lesson-text">{l.cause}</p>
                </div>
                <div className="lesson-block">
                  <div className="lesson-label">Massnahme & Lektion</div>
                  <p className="lesson-text">{l.lesson}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PERSONAL — PSYCHOLOGICAL PROFILE
   ============================================================ */
const PERSONAL = [
  {
    tag: 'AUDIO LOG',
    title: 'Ghost',
    desc: 'Theatralisch, düster, handgemacht. Ghost macht Musik, die man nicht erklärt und genau das ist der Punkt. Qualität ohne Kompromiss.',
    accent: '#9B72CF',
  },
  {
    tag: 'FRAKTIONSZUGEHÖRIGKEIT',
    title: '1. FC Saarbrücken',
    desc: 'Für Blau & Schwarz, wirds wieder Zeit. Und stell dir vor, die ganze Scheiße ist vorbei.',
    accent: '#4A91D8',
  },
  {
    tag: 'STÜTZPUNKT',
    title: 'Nonnweiler, Saarland',
    desc: 'Aufgewachsen im Nordsaarland. Und immernoch da!',
    accent: '#52C870',
  },
];

function Personal({ onAchieve }) {
  const ref = useAchieveTrigger('personal', onAchieve);
  return (
    <section className="section" ref={ref} style={{ background: 'var(--bg-2,#0D1B2E)' }}>
      <div className="container">
        <VtDivider text="PSYCHOLOGICAL PROFILE // SEKTION 07" />
        <FadeIn>
          <SectionLabel number="07" label="PSYCHOLOGISCHES PROFIL" />
          <h2 className="section-heading">Als Mensch</h2>
        </FadeIn>
        <div className="personal-grid">
          {PERSONAL.map((p, i) => (
            <FadeIn key={p.tag} delay={i * 0.08}>
              <div className="personal-card" style={{ borderTop: `3px solid ${p.accent}` }}>
                <div className="personal-tag" style={{ color: p.accent }}>{p.tag}</div>
                <div className="personal-title" style={{ color: p.accent }}>{p.title}</div>
                <p className="personal-desc">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
const FAQS = [
  {
    q: 'Warum IT ohne Ausbildung?',
    a: 'Weil ich nicht auf eine Ausbildung gewartet habe um anzufangen. Ich habe angefangen, gebaut, gelernt — und dann gearbeitet. Die Ausbildung würde mir Theorie beibringen die ich teils schon kenne. Was sie nicht ersetzen kann: die Jahre an echten Systemen.',
  },
  {
    q: 'Was unterscheidet dich von jemandem mit Abschluss?',
    a: 'Ich habe keinen Abschluss der beweist was ich kann. Ich habe Code, Systeme und eine dokumentierte Erfahrung bei einem britischen Hosting-Provider.',
  },
  {
    q: 'Bist du an Zertifizierungen interessiert?',
    a: 'Ja. CompTIA, Microsoft, LPIC stehen auf meiner Liste. Ich warte damit aber nicht um anzufangen. Ich fange an und hole formale Belege nach, sobald Umstände und Arbeitgeber das sinnvoll machen.',
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section">
      <div className="container">
        <VtDivider text="VAULT-TEC FAQ // SEKTION 08" />
        <FadeIn>
          <SectionLabel number="08" label="VAULT-TEC PROTOKOLL: HÄUFIGE ANFRAGEN" />
          <h2 className="section-heading">Direkte Antworten</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className={`faq-icon${open === i ? ' open' : ''}`}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <div className="faq-answer-inner">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT — JOIN THE VAULT
   ============================================================ */
function Contact() {
  return (
    <section id="kontakt" className="contact-section" style={{ background: 'var(--bg-2,#0D1B2E)' }}>
      <div className="contact-inner">
        <VtDivider text="EINSTELLUNGSPROTOKOLL // SEKTION 09" />
        <FadeIn>
          <SectionLabel number="09" label="EINSTELLUNGSPROTOKOLL" />
          <h2 className="contact-heading">
            Der Vault<br /><span>braucht dich.</span>
          </h2>
          <a href="mailto:me@jbaltes.de" className="contact-email-link">
            me@jbaltes.de
          </a>
          <p className="contact-note">
            Kein Formular. Kein Umweg. Direktkontakt zu Kandidat JB-001 —
            Antwort innerhalb eines Tages garantiert.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ footerClicks, onFooterClick }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-name">Justin Baltes // JB-001</span>
        <div className="footer-links">
          <a href="mailto:me@jbaltes.de" className="footer-link">Kontakt</a>
          <a href="/cv.pdf" download className="footer-link">Lebenslauf</a>
        </div>
        <span className="footer-copy" onClick={onFooterClick}>
          {footerClicks >= 3
            ? <span className="footer-secret">// VAULT-TEC VERTRAUT DIR //</span>
            : '© 2025 VAULT-TEC INDUSTRIES // NONNWEILER SAARLAND'}
        </span>
      </div>
    </footer>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const [toasts, setToasts]         = useState([]);
  const [konami, setKonami]         = useState(false);
  const [footerClicks, setFooterClicks] = useState(0);
  const triggered = useRef(new Set());
  const konamiSeq = useRef([]);

  // Smooth scroll
  useEffect(() => {
    const lenis = new Lenis();
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Konami code detector
  useEffect(() => {
    const fn = (e) => {
      konamiSeq.current = [...konamiSeq.current, e.key].slice(-10);
      if (konamiSeq.current.join(',') === KONAMI.join(',')) {
        setKonami(true);
        konamiSeq.current = [];
      }
      if (konami) setKonami(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [konami]);

  const onAchieve = useCallback((id) => {
    if (triggered.current.has(id)) return;
    triggered.current.add(id);
    const ach = ACH.find(a => a.id === id);
    if (!ach) return;
    const key = Date.now() + Math.random();
    setToasts(q => [...q, { ...ach, key }]);
    setTimeout(() => setToasts(q => q.filter(t => t.key !== key)), 4000);
  }, []);

  return (
    <motion.div className="portfolio-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ScrollProgress />
      <AchievementShelf toasts={toasts} />

      <AnimatePresence>
        {konami && <KonamiOverlay onClose={() => setKonami(false)} />}
      </AnimatePresence>

      <Hero />
      <Testimonial />
      <About       onAchieve={onAchieve} />
      <Experience  onAchieve={onAchieve} />
      <SpecialSection onAchieve={onAchieve} />
      <Skills />
      <MDTProject  onAchieve={onAchieve} />
      <Lessons     onAchieve={onAchieve} />
      <Personal    onAchieve={onAchieve} />
      <FAQ />
      <Contact />
      <Footer
        footerClicks={footerClicks}
        onFooterClick={() => setFooterClicks(n => n + 1)}
      />
    </motion.div>
  );
}
