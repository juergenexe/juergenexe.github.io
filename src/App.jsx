import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { 
  Terminal, Server, MonitorPlay, Database, Quote, 
  ChevronDown, MapPin, Activity, Cpu, Wifi, ShieldCheck, Zap,
  Skull, Music, Map, ArrowLeft, Package, Truck, Headset, Network, HeartHandshake, 
  GitCommit, Target, XCircle, FileWarning, CheckCircle, Download, HelpCircle, 
  Code, Layers, Lock, Hammer, Camera
} from 'lucide-react';
import ModernApp from './components/ModernMDT/ModernApp'; 

// --- 1. DYNAMIC CYBER BACKGROUND ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
    <motion.div animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full" />
    <motion.div animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.5, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-800/10 blur-[150px] rounded-full" />
    <motion.div animate={{ opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
  </div>
);

// --- 2. CUSTOM CURSOR ---
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <motion.div className="fixed top-0 left-0 w-4 h-4 border border-cyan-500 rounded-full pointer-events-none z-[9999] mix-blend-screen flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]" animate={{ x: mousePosition.x - 8, y: mousePosition.y - 8, scale: isClicked ? 0.5 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}>
        <div className="w-1 h-1 bg-white rounded-full" />
      </motion.div>
      <motion.div className="fixed top-0 left-0 w-12 h-12 border border-cyan-500/30 rounded-full pointer-events-none z-[9998] mix-blend-screen" animate={{ x: mousePosition.x - 24, y: mousePosition.y - 24, scale: isClicked ? 1.5 : 1, opacity: isClicked ? 0 : 1 }} transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.8 }} />
    </>
  );
};

// --- 3. SYSTEM HUD ---
const SystemHUD = ({ setView }) => (
  <div className="fixed top-0 left-0 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 z-[60] flex justify-between items-center px-6 py-2 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest hidden md:flex shadow-[0_0_15px_rgba(6,182,212,0.05)]">
    <div className="flex gap-6 items-center">
      <span className="flex items-center gap-2"><Activity size={12} className="animate-pulse text-cyan-400"/> SYS_UPTIME: 99.99%</span>
      <span className="flex items-center gap-2"><GitCommit size={12}/> LAST_COMMIT: RECENT</span>
      <span className="flex items-center gap-2"><Target size={12}/> TARGET: SYSTEMINTEGRATION</span>
    </div>
    <div className="flex gap-6 items-center">
      <button onClick={() => setView('timeline')} className="flex items-center gap-2 px-3 py-1 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
        <Terminal size={12} /> // INIT_BIO_ENGINE
      </button>
      <span className="flex items-center gap-2 text-zinc-500 hidden lg:flex"><Music size={12}/> NOW_PLAYING: GHOST - SQUARE HAMMER</span>
      <span className="flex items-center gap-2 text-zinc-300"><ShieldCheck size={12} className="text-success"/> AUTH: JUSTIN.BALTES</span>
    </div>
  </div>
);

// --- 4. INITIAL LOADER ---
const Loader = ({ finishLoading }) => {
  const [text, setText] = useState("");
  const fullText = "MOUNTING IDENTITY_MATRIX... // USER: JUSTIN_BALTES";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(finishLoading, 800);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [finishLoading]);

  return (
    <motion.div exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="fixed inset-0 z-[100] bg-[#030712] flex items-center justify-center font-mono cursor-none">
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-6">
        <div className="w-full flex items-center gap-3">
          <span className="text-cyan-500 text-2xl font-black">{">"}</span>
          <span className="text-zinc-100 text-lg md:text-xl tracking-wide">{text}</span>
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-6 bg-cyan-500" />
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "circInOut" }} className="h-full bg-cyan-500" />
        </div>
      </div>
    </motion.div>
  );
};

// --- 5. SIGNAL BADGES ---
const SignalBadges = () => {
  const signals = [
    "OPEN FOR IT OPS", "DEBIAN / UBUNTU", "DOCKER", "REACT", "PTERODACTYL", "QUEREINSTEIGER", "REFERENCE-BACKED"
  ];
  return (
    <div className="w-full overflow-hidden bg-cyan-950/20 border-y border-cyan-500/20 py-3 mt-8 relative z-20 backdrop-blur-sm">
      <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] items-center gap-8 px-4">
        {[...signals, ...signals, ...signals].map((signal, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle size={14} className="text-cyan-500" />
            <span className="text-cyan-300 font-mono text-xs md:text-sm font-bold tracking-widest uppercase">{signal}</span>
            <span className="text-zinc-800 font-black">/</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 6. TERMINAL COMMAND CENTER ---
const TerminalCV = () => {
  const [history, setHistory] = useState([
    "Justin Markus Baltes --version 4.0.0", 
    "Type 'help' to access the vault. Hidden protocols active."
  ]);
  const [input, setInput] = useState("");

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.toLowerCase().trim();
      let response = "";
      
      if (cmd === "help") response = "Commands: manifesto, mood, skills, archive, graveyard, fcs, ghost, clear";
      else if (cmd === "manifesto") response = "I build systems that work. No ego. Just executed operations. Chaos must be structured.";
      else if (cmd === "mood") response = "Current Mode: Brutalist Architecture. Coffee level: Critical. Focus: Deep Work.";
      else if (cmd === "skills") response = "Linux (Debian), Docker, React, IT-Support, English (C2). From dispatch to code.";
      else if (cmd === "archive") response = "Vault accessed. Version 1: Logistics. Version 2: Support. Version 3: Fullstack Ops.";
      else if (cmd === "graveyard") response = "Fetching failures... 3 broken deployments, 1 failed server migration. Lesson: Always backup the DNS zone.";
      else if (cmd === "ghost") response = "Are you on the square? Are you on the level? 🤘 (Listening to Opus Eponymous to Impera)";
      else if (cmd === "fcs") response = "Blau-Schwarz ein Leben lang! Nur der 1. FC Saarbrücken!";
      else if (cmd === "clear") { setHistory([]); setInput(""); return; }
      else response = `ERR: Command '${cmd}' not recognized. Try 'help'.`;

      setHistory([...history, `justin@vault:~$ ${input}`, response]);
      setInput("");
    }
  };

  return (
    <div className="font-mono bg-[#050505]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800 h-80 overflow-y-auto text-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] relative group cursor-text flex flex-col w-full">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4 text-xs text-zinc-500 uppercase tracking-widest">
        <span>Terminal_Link</span>
        <span className="flex items-center gap-2"><Wifi size={10} className="text-cyan-500"/> ONLINE</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((line, i) => (
          <div key={i} className={`mb-3 leading-relaxed break-words ${line.startsWith('justin@vault') ? 'text-cyan-400 font-bold' : 'text-zinc-400'}`}>
            {line}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 pt-2 border-t border-zinc-900">
        <span className="text-cyan-500 font-bold">justin@vault:~$</span>
        <input 
          className="bg-transparent border-none outline-none text-zinc-100 flex-1 focus:ring-0 p-0 min-w-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          spellCheck="false"
        />
      </div>
    </div>
  );
};

// --- 7. VERSIONING & MANIFESTO ---
const IdentityMatrix = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
    <div className="grid lg:grid-cols-2 gap-16">
      <div className="space-y-8">
        <h3 className="text-sm font-mono text-cyan-500 tracking-widest uppercase">// Core Manifesto</h3>
        <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter uppercase">Substanz <br/><span className="text-zinc-600">über Ästhetik.</span></h2>
        <div className="space-y-6 text-zinc-400 text-lg font-light leading-relaxed">
          <p>
            "Ich halte wenig von großen Selbstdarstellungen und viel von erledigter Arbeit." Ein Portfolio muss nicht nur hübsch sein, es muss beweisen, dass die Architektur darunter atmet.
          </p>
          <p>
            Von der Lagerlogistik in die IT-Infrastruktur. Logistik und Code sind dasselbe: Es geht darum, Dinge effizient und sicher von A nach B zu bringen, ohne dass das System kollabiert.
          </p>
          <p className="pl-4 border-l-2 border-cyan-500 italic text-zinc-300">
            Dinge funktionieren selten perfekt, aber sie funktionieren besser, wenn man sie ernst nimmt.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col justify-center space-y-4">
        <h3 className="text-sm font-mono text-zinc-500 tracking-widest uppercase mb-2">// Version History</h3>
        
        <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400"><Package size={20}/></div>
          <div>
            <div className="font-mono text-xs text-zinc-500">v1.0 // 2019 - 2023</div>
            <div className="font-bold text-zinc-300">Logistics & Dispatching</div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 opacity-70 hover:opacity-100 transition-all">
          <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-400"><Headset size={20}/></div>
          <div>
            <div className="font-mono text-xs text-blue-500">v2.0 // 2023 - 2024</div>
            <div className="font-bold text-zinc-200">IT-Support & Consulting</div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-cyan-500/30 p-5 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="p-3 bg-cyan-900/50 border border-cyan-500/50 rounded-lg text-cyan-400"><Server size={20}/></div>
          <div>
            <div className="font-mono text-xs text-cyan-500 animate-pulse">v3.0 // CURRENT</div>
            <div className="font-bold text-zinc-100">IT-Operations & Infrastructure</div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/50 border-dashed p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-zinc-900 rounded-lg text-zinc-600"><Layers size={20}/></div>
          <div>
            <div className="font-mono text-xs text-zinc-600">v4.0 // TARGET</div>
            <div className="font-bold text-zinc-500">Systemintegrator / Fullstack</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- 8. WHY HIRE ME & TOOLBELT ---
const SystemCapabilities = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-zinc-900/50">
    <div className="text-center mb-16">
      <h3 className="text-sm font-mono text-cyan-500 tracking-widest uppercase mb-4">// Candidate Profile</h3>
      <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">Why Hire Me.</h2>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 transition-colors">
        <Server className="text-cyan-500 mb-4" />
        <h4 className="text-xl font-bold text-zinc-100 mb-2">Ops & Support Erfahrung</h4>
        <p className="text-sm text-zinc-400">Kein blinder Theoretiker. Ich kenne den First- und Second-Level Support und weiß, wie man Kundensysteme am Leben hält.</p>
      </div>
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 transition-colors">
        <Layers className="text-cyan-500 mb-4" />
        <h4 className="text-xl font-bold text-zinc-100 mb-2">Strukturierte Arbeitsweise</h4>
        <p className="text-sm text-zinc-400">Durch meinen Logistik-Hintergrund denke ich in sauberen Prozessen. Chaos wird strukturiert, dokumentiert und gelöst.</p>
      </div>
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 transition-colors">
        <Hammer className="text-cyan-500 mb-4" />
        <h4 className="text-xl font-bold text-zinc-100 mb-2">Belastbar & Resilient</h4>
        <p className="text-sm text-zinc-400">Wenn Systeme crashen, bleibe ich ruhig. Beschwerdemanagement und Disposition haben mich gelehrt, unter Druck zu funktionieren.</p>
      </div>
    </div>

    <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
      <h3 className="text-sm font-mono text-zinc-500 tracking-widest uppercase mb-8">// Technical Toolbelt</h3>
      <div className="flex flex-wrap gap-4">
        {["Linux", "Bash", "Docker", "Pterodactyl", "Git", "React", "Troubleshooting", "DNS Mgmt", "SSL", "Log Analysis"].map((tool, i) => (
          <span key={i} className="px-5 py-2 border border-zinc-700 bg-zinc-900/50 rounded-full text-zinc-300 font-mono text-sm hover:border-cyan-500 hover:text-cyan-400 transition-colors cursor-default">
            {tool}
          </span>
        ))}
      </div>
    </div>
  </section>
);

// --- 9. COMPACT EXPERIENCE (Fixed cutoffs) ---
const CompactExperience = () => {
  const [activeTab, setActiveTab] = useState(0);

  const experiences = [
    { company: "IONOS SE", role: "Technical Support - Cloud & Webhosting", period: "Integrierter Track", details: ["Troubleshooting von Datenbank-Clustern (MySQL/MSSQL)", "DNS-Management und SSL-Infrastruktur für Enterprise-Kunden", "Analyse von Log-Dateien zur Fehlerbehebung"], icon: <Database size={20} /> },
    { company: "VSE AG", role: "IT-Operations & Infrastructure", period: "Integrierter Track", details: ["Monitoring kritischer Netzwerkinfrastrukturen", "Hardware-Rollouts und Client-Management", "Sicherstellung der Systemverfügbarkeit"], icon: <Server size={20} /> },
    { company: "WALTER-TEC", role: "IT-Einzelunternehmer", period: "12/2023 - 06/2024", details: ["Beratung & Consulting für IT-Infrastruktur", "Installation von Hardware-Systemen", "Eigenverantwortlicher Vertrieb"], icon: <Terminal size={20} /> },
    { company: "Contact & Sales GmbH", role: "IT-Support & Beschwerdemanagement", period: "2023 - 2024", details: ["Technischer IT-Support im Dialogmarketing-Umfeld", "Projektverwaltung und Deeskalationsmanagement", "Wartung interner Kommunikationssysteme"], icon: <MonitorPlay size={20} /> },
    { company: "Logistik & Disposition", role: "DPD / Nestlé Wagner", period: "2019 - 2023", details: ["Tourenmanagement und strategische Disponenz", "Fachkraft für Lagerlogistik (Pizza Wagner)", "Warenwirtschaft & Lagermanagement"], icon: <MapPin size={20} /> }
  ];

  return (
    <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 p-6 md:p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-sm shadow-2xl relative overflow-hidden min-h-[480px]">
      <div className="space-y-3 relative z-10 flex flex-col">
        {experiences.map((exp, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-300 border ${ activeTab === i ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' : 'border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300' }`}>
            <div className="font-bold text-sm md:text-[15px] tracking-wide break-words leading-tight">{exp.company}</div>
            <div className="text-[10px] md:text-xs opacity-50 font-mono mt-1 md:mt-1.5 uppercase">{exp.period}</div>
          </button>
        ))}
      </div>
      <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-zinc-950/80 p-6 md:p-8 rounded-3xl border border-zinc-800/50 relative z-10 flex flex-col w-full h-full overflow-hidden">
        <div className="flex items-start gap-4 md:gap-5 mb-6 md:mb-8">
          <div className="p-3 md:p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl md:rounded-2xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
            {experiences[activeTab].icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl md:text-2xl lg:text-3xl font-black text-zinc-100 tracking-tight leading-tight break-words hyphens-auto">{experiences[activeTab].role}</h4>
            <p className="text-cyan-500/80 font-mono text-[10px] md:text-xs mt-2 uppercase tracking-widest break-words">{experiences[activeTab].company}</p>
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-zinc-800 to-transparent mb-6 md:mb-8 flex-shrink-0" />
        <ul className="space-y-4 md:space-y-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {experiences[activeTab].details.map((d, i) => (
            <li key={i} className="flex items-start gap-3 md:gap-4 text-zinc-300 text-sm md:text-base leading-relaxed w-full">
              <Zap size={16} className="text-cyan-600 mt-1 flex-shrink-0" />
              <span className="flex-1 min-w-0 break-words">{d}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

// --- 10. PROJECT GRAVEYARD ---
const ProjectGraveyard = () => {
  const failures = [
    { title: "React State Collision", reason: "Attempted to mutate complex MDT object states without deep cloning. Resulted in ghost-renders.", lesson: "Immutability is law. Implemented robust state handling." },
    { title: "CSS Viewport Trap", reason: "Used absolute vw/vh units inside a constrained iframe component. UI imploded.", lesson: "Contextual scaling. 100% relative width over strict viewport ties." },
    { title: "Premature API Integration", reason: "Built UI dependent on backend that wasn't ready. Constant crashes.", lesson: "Always build resilient mock layers first. Defensive coding." }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-zinc-900/50">
      <div className="flex items-center gap-4 mb-12">
        <FileWarning size={32} className="text-red-500" />
        <div>
          <h3 className="text-sm font-mono text-red-500 tracking-widest uppercase">// Error Logs</h3>
          <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">Project Cemetery.</h2>
        </div>
      </div>
      <p className="text-zinc-400 mb-10 max-w-2xl text-lg font-light">Ein System ist nur so gut wie die Fehler, aus denen es gelernt hat. Gescheiterte Ansätze formen die Architektur von morgen.</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {failures.map((fail, i) => (
          <div key={i} className="bg-[#110505] border border-red-900/30 p-6 rounded-3xl hover:border-red-500/50 transition-colors group h-full flex flex-col">
            <XCircle size={20} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-xl font-bold text-zinc-200 mb-2">{fail.title}</h4>
            <div className="text-sm text-zinc-500 mb-4 bg-red-950/20 p-3 rounded-xl font-mono flex-1">CAUSE: {fail.reason}</div>
            <div className="text-sm text-zinc-300 border-l-2 border-red-500 pl-3">
              <span className="block text-[10px] text-red-400 font-mono mb-1 uppercase">Patch applied</span>
              {fail.lesson}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- 11. ARTIFACT GALLERY ---
// --- MDT PREVIEW SECTION ---
const MDTSection = ({ mode, setMode }) => (
  <section id="mdt-preview" className="py-32 px-6 bg-[#03050a] border-t border-zinc-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />


    <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
      <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-4 block">// Engineering Showcase</span>
      <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 mb-6 tracking-tighter uppercase">
        MDT-9100 System
      </h2>
      <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
        Entwicklung einer reaktiven Datenbank-Schnittstelle. Architektur-Design, API-Mocking und State-Management. Wähle zwischen der <strong>Legacy CLI</strong> oder der <strong>Modern React</strong> Lösung.
      </p>


      <div className="flex justify-center gap-4 mb-12">
        <button onClick={() => setMode('retro')} className={`px-8 py-3 rounded-xl border text-sm uppercase tracking-widest transition-all ${mode === 'retro' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}>
          Legacy Terminal
        </button>
        <button onClick={() => setMode('modern')} className={`px-8 py-3 rounded-xl border text-sm uppercase tracking-widest transition-all ${mode === 'modern' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}>
          React Interface
        </button>
      </div>
    </div>


    <div className="relative mx-auto w-full max-w-[1100px] aspect-[16/10] bg-zinc-900 rounded-[2.5rem] p-3 md:p-5 border border-zinc-800 shadow-[0_0_100px_rgba(6,182,212,0.07)] z-10">
      <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative shadow-inner">
        {mode === 'retro' ? (
          <iframe src="/mdt/index.html" className="w-full h-full border-none" title="Retro MDT Demo" scrolling="no" />
        ) : (
          <div className="w-full h-full overflow-hidden">
            <ModernApp /> 
          </div>
        )}
      </div>
    </div>
  </section>
);


// --- 12. IDENTITY PROTOCOL (Vault) ---
const IdentityProtocol = () => (
  <section className="py-24 px-6 max-w-6xl mx-auto relative border-t border-zinc-900/50 z-10">
    <h3 className="text-sm font-mono text-cyan-500 mb-4 tracking-widest uppercase text-center">// Personal Vault</h3>
    <h2 className="text-4xl md:text-5xl font-black mb-12 text-zinc-100 tracking-tighter text-center uppercase">Beyond the Code.</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-zinc-800 hover:border-zinc-500 transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <Skull size={32} className="text-zinc-600 group-hover:text-zinc-100 mb-6 transition-colors duration-500" />
        <div className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-widest">Ritual Audio</div>
        <div className="text-sm text-zinc-400 font-mono mb-4">Soundtrack of my code.</div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Listening to <strong className="text-zinc-300">Ghost</strong>. Heavy riffs and theatrical darkness fuel the midnight deployments.
        </p>
      </div>

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#003366]/20 to-[#000000] border border-[#003366]/50 hover:border-[#003366] transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center">
        <img src="/fcs.png" alt="1. FC Saarbrücken" className="w-16 h-16 mb-4 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(0,119,230,0.5)]" />
        <div className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-widest">Blau & Schwarz</div>
        <div className="text-sm text-zinc-400 font-mono mb-4">Ein Leben lang.</div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Die treue Seele gehört dem <strong className="text-zinc-300">1. FC Saarbrücken</strong>. Leidenschaft auf dem Platz und Resilienz im System-Support.
        </p>
      </div>

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-cyan-900/10 to-transparent border border-zinc-800 hover:border-cyan-900/50 transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center">
        <Map size={32} className="text-cyan-800 group-hover:text-cyan-500 mb-6 transition-colors duration-500" />
        <div className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-widest">Base of Ops</div>
        <div className="text-sm text-zinc-400 font-mono mb-4">Coordinates Locked.</div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Stationed in <strong className="text-zinc-300">Nonnweiler, Saarland</strong>. Remote capabilities worldwide, deeply rooted locally.
        </p>
      </div>

    </div>
  </section>
);

// --- 13. MINI FAQ ---
const MiniFAQ = () => {
  const faqs = [
    { q: "Warum der Wechsel in die IT?", a: "Systeme zu bauen, zu verstehen und zu reparieren war schon immer mein intrinsischer Antrieb. Die Logistik war eine gute Schule für Prozesse, aber mein Kopf gehört der Technologie und Infrastruktur." },
    { q: "Warum ein Quereinsteiger?", a: "Weil Quereinsteiger out-of-the-box denken. Ich bringe Soft Skills aus dem Beschwerdemanagement und logistische Struktur mit. Coden und SysAdmin-Wissen habe ich mir aus purer Leidenschaft beigebracht." },
    { q: "Was unterscheidet dich?", a: "Ich gebe nicht auf, wenn der Screen rot wird. Wo andere frustriert abbrechen, lese ich Logs, recherchiere und baue Workarounds, bis das System stabil läuft. Substanz über Ästhetik." }
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto relative z-10 border-t border-zinc-900/50">
      <div className="text-center mb-12">
        <h3 className="text-sm font-mono text-cyan-500 tracking-widest uppercase mb-4">// Query Handler</h3>
        <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">FAQ.</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-zinc-800 rounded-2xl bg-zinc-900/30 overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full text-left p-6 flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
              <span className="font-bold text-zinc-100">{faq.q}</span>
              <ChevronDown className={`text-cyan-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 text-zinc-400">
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- 14. BIO ENGINE (DUAL TIMELINE) ---
const AnimatedTimelineExperience = ({ onBack }) => {
  const timelineData = [
    { id: 1, date: "08/2019", title: "Nestlé Wagner GmbH", role: "Start Berufsausbildung (Lagerlogistik)", icon: <Package size={20} />, type: "Origin", color: "from-red-500/20", borderColor: "border-red-500", iconColor: "text-red-400" },
    { id: 2, date: "2020", title: "First Server Deploy", role: "Erster eigener Linux-Root-Server aufgesetzt.", icon: <Server size={20} />, type: "Milestone", color: "from-orange-500/20", borderColor: "border-orange-500", iconColor: "text-orange-400" },
    { id: 3, date: "08/2022", title: "Globus Baumarkt", role: "Fachkraft für Lagerlogistik", icon: <Database size={20} />, type: "CV", color: "from-yellow-500/20", borderColor: "border-yellow-500", iconColor: "text-yellow-400" },
    { id: 4, date: "10/2022", title: "DPD Deutschland", role: "Disponent im Nahverkehr", icon: <Truck size={20} />, type: "CV", color: "from-red-600/20", borderColor: "border-red-600", iconColor: "text-red-500" },
    { id: 5, date: "04/2023", title: "Contact & Sales", role: "IT-Support & Dialogmarketing", icon: <Headset size={20} />, type: "CV", color: "from-blue-500/20", borderColor: "border-blue-500", iconColor: "text-blue-400" },
    { id: 6, date: "12/2023", title: "WALTER-TEC", role: "Gründung IT-Einzelunternehmen", icon: <Network size={20} />, type: "CV", color: "from-cyan-500/20", borderColor: "border-cyan-500", iconColor: "text-cyan-400" },
    { id: 7, date: "Early 2024", title: "First Client Fix", role: "Komplexe DNS/Network-Störung beim Kunden gelöst.", icon: <Lock size={20} />, type: "Milestone", color: "from-indigo-500/20", borderColor: "border-indigo-500", iconColor: "text-indigo-400" },
    { id: 8, date: "06/2024", title: "Contact & Sales", role: "Projektverwaltung & IT-Support", icon: <MonitorPlay size={20} />, type: "CV", color: "from-blue-600/20", borderColor: "border-blue-600", iconColor: "text-blue-500" },
    { id: 9, date: "Late 2024", title: "React MDT Build", role: "Erste komplexe React-Architektur geschrieben.", icon: <Code size={20} />, type: "Milestone", color: "from-cyan-400/20", borderColor: "border-cyan-400", iconColor: "text-cyan-300" },
    { id: 10, date: "12/2024", title: "Rink Rehaservice", role: "Kassenmanagement & Vertrieb", icon: <HeartHandshake size={20} />, type: "CV", color: "from-emerald-500/20", borderColor: "border-emerald-500", iconColor: "text-emerald-400" }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 overflow-x-hidden relative font-sans cursor-none">
      <CustomCursor />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0" />
      
      <div className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-[60] p-4 flex justify-between items-center border-b border-zinc-900">
        <button onClick={onBack} className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors font-mono uppercase tracking-widest text-xs border border-cyan-500/30 px-4 py-2 rounded-full">
          <ArrowLeft size={14} /> System Exit
        </button>
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Bio_Engine v2.0 // Dual Track</span>
      </div>

      <div className="relative max-w-5xl mx-auto pt-24 pb-40 px-6 z-10">
        <motion.div 
          className="absolute left-[30px] md:left-[50%] top-[120px] bottom-[50px] w-1 bg-gradient-to-b from-red-500 via-cyan-400 to-emerald-500 origin-top rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 4, ease: "linear" }}
        />

        <motion.div 
          className="relative z-20 flex items-center justify-center text-4xl md:text-5xl mx-auto md:ml-auto md:mr-auto ml-0 w-20 h-20 mb-16 bg-black border-4 border-red-500/50 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.3)] mt-8"
          initial={{ scale: 10, y: '40vh', opacity: 0, rotate: -180 }}
          animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "circOut" }}
        >
          🍕
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {timelineData.map((item, index) => {
            return (
              <motion.div 
                key={item.id}
                className={`relative flex flex-col md:flex-row items-center w-full justify-between group pl-12 md:pl-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? 100 : -100, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="hidden md:block w-[45%]" />

                <div className={`absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#050505] border-2 ${item.borderColor} rounded-full flex items-center justify-center ${item.iconColor} z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover:scale-125 transition-transform duration-500`}>
                  {item.icon}
                </div>

                <div className={`w-full md:w-[45%] bg-gradient-to-br ${item.color} to-black/80 backdrop-blur-xl border border-zinc-800/80 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden hover:border-zinc-500 transition-colors duration-300`}>
                  <div className={`absolute top-0 ${index % 2 === 0 ? 'right-0' : 'left-0'} w-2 h-full ${item.borderColor.replace('border-', 'bg-')} opacity-50`} />
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-mono tracking-widest text-xs font-bold ${item.iconColor}`}>{item.date}</span>
                    <span className="text-[10px] uppercase font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-500 border border-zinc-800">{item.type}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-zinc-100 mb-2 uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed break-words">{item.role}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 15. MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState('main'); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  if (view === 'timeline') {
    return <AnimatedTimelineExperience onBack={() => setView('main')} />;
  }

  return (
    <div className="bg-[#050505] text-zinc-100 selection:bg-cyan-500/30 min-h-screen cursor-none relative overflow-x-hidden">
      <CustomCursor />
      <AnimatedBackground />
      <SystemHUD setView={setView} />
      
      <AnimatePresence>
        {isLoading && <Loader finishLoading={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="relative z-10">
          
          <header className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center pt-20">
             <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
             
             <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="relative z-20 w-full max-w-6xl mx-auto">
                <div className="mb-6 inline-flex justify-center w-full">
                  <span className="px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest uppercase">
                    Status: System Ready // Target: Systemintegration
                  </span>
                </div>
                
                <h1 className="text-6xl md:text-[8.5rem] font-black mb-6 tracking-tighter leading-[0.85] uppercase">
                  IT-Operations & <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-700">Infrastructure.</span>
                </h1>
                
                <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                  <strong className="text-zinc-200">Justin Markus Baltes.</strong> Building systems with structure, taste, and practical understanding.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-16">
                  <a href="/Lebenslauf.pdf" download className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-black rounded-full font-bold uppercase tracking-widest text-sm hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-none">
                    <Download size={16} /> Download CV
                  </a>
                  <button onClick={() => setView('timeline')} className="flex items-center gap-2 px-6 py-3 border border-zinc-800 rounded-full font-bold uppercase tracking-widest text-sm text-zinc-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors cursor-none">
                    <Activity size={16} /> Bio Engine
                  </button>
                </div>
             </motion.div>
          </header>

          <SignalBadges />
          <IdentityMatrix />
          
          <section id="experience" className="py-24 px-6 max-w-7xl mx-auto space-y-12 relative z-10 border-t border-zinc-900/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 border-b border-zinc-800/50 pb-4">
              <h3 className="text-sm font-mono text-cyan-500 tracking-widest uppercase">// Professional History</h3>
            </div>
            
            <div className="grid xl:grid-cols-[1fr_400px] gap-10">
              <CompactExperience />
              
              <div className="space-y-8">
                <div className="p-10 rounded-[2rem] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden h-full flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full" />
                  <Quote size={32} className="text-cyan-400 mb-6 relative z-10" />
                  <p className="text-xl md:text-2xl font-bold leading-tight mb-8 text-zinc-100 relative z-10">
                    "Justin has consistently demonstrated exceptional technical aptitude and a profound understanding of server environments."
                  </p>
                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Jamie Lee Garner</p>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Director @ Optiserve (UK)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <SystemCapabilities />
          
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto px-6 mb-24 relative z-10">
             <TerminalCV />
             <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group flex flex-col justify-center">
                <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-colors duration-500" />
                <h3 className="text-sm font-mono text-cyan-500 tracking-widest uppercase mb-4">// System Directives</h3>
                <p className="text-zinc-300 text-lg leading-relaxed relative z-10">
                  KI als Werkzeug. Architektur und Entscheidungen von mir. Ich nutze Tools, aber ich verstehe sie. 
                </p>
             </div>
          </div>

          
          <ProjectGraveyard />
          <IdentityProtocol />
          <MiniFAQ />

          <footer className="py-32 px-6 text-center border-t border-zinc-900 bg-[#020305] relative overflow-hidden z-10">
             <div className="absolute bottom-0 left-[50%] translate-x-[-50%] w-[100%] h-[50%] bg-cyan-900/5 blur-[120px] rounded-full pointer-events-none" />
             <h2 className="text-4xl md:text-5xl font-black mb-8 text-zinc-100 tracking-tighter uppercase">Initialize Contact.</h2>
             <p className="text-zinc-500 mb-10 max-w-xl mx-auto font-mono text-sm">System is accepting new operations. End of archive.</p>
             <a href="mailto:me@jbaltes.de" className="inline-block px-10 py-5 bg-zinc-100 text-black font-black text-lg uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] cursor-none">
               Deploy Mail
             </a>
             <div className="mt-24 text-xs font-mono text-zinc-700 uppercase tracking-widest">
               // END OF TRANSMISSION. JUSTIN OUT.
             </div>
          </footer>

        </motion.div>
      )}
    </div>
  );
}