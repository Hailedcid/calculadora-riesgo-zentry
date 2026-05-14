import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Epilogue:wght@400;600;700;900&display=swap');`;

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a1025;
  --surface: #1d2433;
  --surface2: #111620;
  --border: #1C2333;
  --border-hi: #2A3650;
  --cyan: rgb(49, 105, 190);
  --cyan-dim: rgba(49,105,190,0.08);
  --cyan-glow: rgba(14, 87, 197, 0.18);
  --red: #FF3B5C;
  --amber: #FFAA00;
  --green: #00E599;
  --text: #dedede;
  --muted: #7592b6;
  --font-display: 'Epilogue', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}
body { background: var(--bg); color: var(--text); font-family: var(--font-display); }

.root {
  min-height: 100vh;
  background: var(--bg);
  position: relative;
  overflow-x: hidden;
}

/* animated scan lines */
.scanlines {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,212,255,0.012) 2px,
    rgba(0,212,255,0.012) 4px
  );
}
.corner-glow {
  position: fixed; pointer-events: none; z-index: 0;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
}
.corner-glow.tl { top: -200px; left: -100px; }
.corner-glow.br { bottom: -200px; right: -100px; background: radial-gradient(circle, rgba(255,59,92,0.05) 0%, transparent 70%); }

.wrap {
  position: relative; z-index: 1;
  max-width: 720px; margin: 0 auto;
  padding: 40px 24px 80px;
}

/* ---- HEADER ---- */
.header { margin-bottom: 40px; }
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 40px;
}
.logo {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  color: var(--cyan); letter-spacing: 0.15em; text-transform: uppercase;
}
.logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }

.step-counter { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
.step-counter span { color: var(--text); }

.headline { font-size: clamp(24px,4.5vw,38px); font-weight: 900; line-height: 1.12; margin-bottom: 12px; }
.headline em { font-style: normal; color: var(--cyan); }
.tagline { font-family: var(--font-mono); font-size: 13px; color: var(--muted); }

/* ---- PROGRESS TRACK ---- */
.track-wrap { margin-bottom: 36px; }
.track-bar {
  height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 8px;
}
.track-fill {
  height: 100%; background: var(--cyan); border-radius: 2px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 12px rgba(14, 87, 197, 0.18);
}
.track-label { font-family: var(--font-mono); font-size: 11px; color: var(--muted); display: flex; justify-content: space-between; }

/* ---- QUESTION CARD ---- */
.q-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 32px;
  animation: fadeUp .35s ease;
}
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

.q-cat {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: var(--cyan); letter-spacing: 0.12em; text-transform: uppercase;
  margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.q-cat::before { content:''; width:20px; height:1px; background:var(--cyan); display:block; }
.q-text { font-size: clamp(17px,2.5vw,21px); font-weight: 700; line-height: 1.35; margin-bottom: 28px; }

/* Options */
.options { display: grid; gap: 10px; }
.options.two-col { grid-template-columns: 1fr 1fr; }
.opt {
  border: 1px solid var(--border); border-radius: 12px;
  padding: 16px 18px; cursor: pointer; background: var(--surface2);
  transition: all .2s; display: flex; align-items: flex-start; gap: 14px;
  text-align: left;
}
.opt:hover { border-color: var(--border-hi); background: #141B28; }
.opt.selected { border-color: var(--cyan); background: var(--cyan-dim); }
.opt-icon { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
.opt-label { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.3; }
.opt-sub { font-size: 12px; color: var(--muted); margin-top: 3px; font-family: var(--font-mono); }
.opt-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid var(--border-hi); flex-shrink: 0; margin-top: 3px;
  display: flex; align-items: center; justify-content: center; transition: all .2s;
}
.opt.selected .opt-radio { border-color: var(--cyan); background: var(--cyan); }
.opt-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #06080F; }

.btn-row { display: flex; gap: 12px; margin-top: 28px; align-items: center; }
.btn-next {
  flex: 1; padding: 15px; background: var(--cyan); color: var(--bg);
  border: none; border-radius: 10px; font-size: 15px; font-weight: 700;
  font-family: var(--font-display); cursor: pointer; transition: all .2s;
}
.btn-next:disabled { opacity: .35; cursor: default; }
.btn-next:not(:disabled):hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(228, 228, 228, 0.3); }
.btn-back {
  padding: 15px 20px; background: transparent; border: 1px solid var(--border);
  border-radius: 10px; color: var(--muted); font-size: 14px; font-weight: 600;
  font-family: var(--font-display); cursor: pointer; transition: all .2s;
}
.btn-back:hover { border-color: var(--border-hi); color: var(--text); }

/* ---- TYPE SELECTOR (Q0) ---- */
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.type-card {
  border: 1.5px solid var(--border); border-radius: 16px; padding: 28px 24px;
  cursor: pointer; background: var(--surface2); transition: all .25s; text-align: center;
}
.type-card:hover { border-color: var(--border-hi); transform: translateY(-2px); }
.type-card.selected { border-color: var(--cyan); background: var(--cyan-dim); box-shadow: 0 0 28px var(--cyan-glow); }
.type-icon { font-size: 36px; margin-bottom: 14px; }
.type-label { font-size: 18px; font-weight: 900; margin-bottom: 6px; }
.type-sub { font-size: 12px; color: var(--muted); font-family: var(--font-mono); line-height: 1.5; }

/* ---- SCANNING ANIMATION ---- */
.scanning {
  text-align: center; padding: 60px 32px;
  animation: fadeUp .3s ease;
}
.scan-title { font-family: var(--font-mono); font-size: 13px; color: var(--cyan); letter-spacing: .15em; margin-bottom: 32px; text-transform: uppercase; }
.scan-bar-wrap { width: 240px; margin: 0 auto 32px; }
.scan-bar-bg { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
.scan-fill {
  height: 100%; background: var(--cyan); border-radius: 2px;
  animation: scanning 2s ease-in-out forwards;
  box-shadow: 0 0 10px rgba(14, 87, 197, 0.8);
}
@keyframes scanning {
  0%{width:0} 30%{width:40%} 60%{width:72%} 85%{width:90%} 100%{width:100%}
}
.scan-items { display: flex; flex-direction: column; gap: 10px; width: 280px; margin: 0 auto; }
.scan-item {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 12px; color: var(--muted);
  opacity: 0; animation: appear .3s ease forwards;
}
.scan-item:nth-child(1){animation-delay:.3s}
.scan-item:nth-child(2){animation-delay:.7s}
.scan-item:nth-child(3){animation-delay:1.1s}
.scan-item:nth-child(4){animation-delay:1.5s}
@keyframes appear{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.scan-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); flex-shrink: 0; }

/* ---- RESULTS ---- */
.results { animation: fadeUp .4s ease; }
.result-header { margin-bottom: 28px; }
.result-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  border-radius: 40px; padding: 5px 14px; margin-bottom: 20px;
}
.badge-red { background: rgba(255,59,92,.12); border: 1px solid rgba(255,59,92,.3); color: var(--red); }
.badge-amber { background: rgba(255,170,0,.12); border: 1px solid rgba(255,170,0,.3); color: var(--amber); }
.badge-green { background: rgba(0,229,153,.1); border: 1px solid rgba(0,229,153,.25); color: var(--green); }
.result-headline { font-size: clamp(22px,4vw,32px); font-weight: 900; line-height: 1.15; margin-bottom: 10px; }
.result-sub { font-size: 14px; color: var(--muted); font-family: var(--font-mono); }

/* Score ring */
.score-section { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 16px; }
.ring-wrap { position: relative; width: 110px; height: 110px; flex-shrink: 0; }
.ring-svg { width: 110px; height: 110px; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: var(--border); stroke-width: 8; }
.ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1); }
.ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-score { font-family: var(--font-mono); font-size: 24px; font-weight: 600; line-height: 1; }
.ring-label { font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-top: 3px; }
.score-info-label { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; }
.score-info-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; }
.score-info-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

/* Sub-scores */
.sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.sub-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.sub-cat { font-family: var(--font-mono); font-size: 11px; color: var(--muted); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.sub-pct { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
.sub-bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.sub-bar-fill { height: 100%; border-radius: 2px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }

/* Insights */
.insights { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.insight {
  display: flex; gap: 14px; align-items: flex-start;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px;
}
.insight-icon { font-size: 18px; flex-shrink: 0; }
.insight-body { font-size: 13px; color: var(--muted); line-height: 1.6; }
.insight-body strong { color: var(--text); font-weight: 600; }

/* Email capture -> Modificado para WhatsApp CTA */
.email-capture {
  background: linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 100%);
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 16px; padding: 32px; text-align: center;
}
.ec-icon { font-size: 36px; margin-bottom: 16px; }
.ec-title { font-size: 20px; font-weight: 900; margin-bottom: 8px; }
.ec-sub { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; max-width: 380px; margin-left: auto; margin-right: auto; }
.ec-form { display: flex; flex-direction: column; gap: 10px; max-width: 360px; margin: 0 auto; }

.btn-wa {
  padding: 15px; background: #25D366; color: #FFF;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 700;
  font-family: var(--font-display); cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-wa:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,211,102,0.3); }

@media(max-width:580px){
  .type-grid,.sub-grid,.options.two-col{grid-template-columns:1fr;}
  .score-section{grid-template-columns:1fr;text-align:center;}
  .ring-wrap{margin:0 auto;}
  .q-card,.email-capture{padding:24px 18px;}
}
`;

// ─── DATA ──────────────────────────────────────────────────────────────────

const QUESTIONS_HOME = [
  {
    id: "h_perimeter",
    cat: "Perímetro exterior",
    text: "¿Cómo describes el acceso a tu propiedad?",
    weight: "perimeter",
    options: [
      {
        icon: "🚪",
        label: "Sin barda, portón abierto",
        sub: "Acceso directo desde la calle",
        score: 0,
      },
      {
        icon: "🧱",
        label: "Barda baja o malla",
        sub: "Algo de delimitación",
        score: 1,
      },
      {
        icon: "🔒",
        label: "Barda alta con portón cerrado",
        sub: "Buen control de acceso",
        score: 2,
      },
      {
        icon: "⚡",
        label: "Barda + cerco eléctrico o picos",
        sub: "Perímetro activo",
        score: 3,
      },
    ],
  },
  {
    id: "h_cameras",
    cat: "Vigilancia",
    text: "¿Tienes cámaras de seguridad instaladas?",
    weight: "surveillance",
    options: [
      {
        icon: "❌",
        label: "No tengo cámaras",
        sub: "Sin vigilancia visual",
        score: 0,
      },
      {
        icon: "📷",
        label: "1–2 cámaras básicas",
        sub: "Cobertura parcial",
        score: 1,
      },
      {
        icon: "🎥",
        label: "3–5 cámaras con grabación",
        sub: "Buena cobertura",
        score: 2,
      },
      {
        icon: "🛡️",
        label: "Sistema profesional + monitoreo",
        sub: "Vigilancia completa 24/7",
        score: 3,
      },
    ],
  },
  {
    id: "h_alarm",
    cat: "Alarmas y sensores",
    text: "¿Qué sistemas de alerta tienes activos?",
    weight: "alarm",
    options: [
      {
        icon: "🔕",
        label: "Ninguno",
        sub: "Sin alertas automáticas",
        score: 0,
      },
      {
        icon: "🔔",
        label: "Alarma sencilla sin monitoreo",
        sub: "Hace ruido pero nadie responde",
        score: 1,
      },
      {
        icon: "📡",
        label: "Sensores de movimiento/puertas",
        sub: "Alertas al teléfono",
        score: 2,
      },
      {
        icon: "🚨",
        label: "Alarma monitoreada + patrulla",
        sub: "Respuesta garantizada",
        score: 3,
      },
    ],
  },
  {
    id: "h_habits",
    cat: "Hábitos y rutinas",
    text: "¿Con qué frecuencia descuidas puntos de acceso?",
    weight: "habits",
    options: [
      {
        icon: "😬",
        label: "Frecuentemente",
        sub: "Puertas o ventanas sin asegurar",
        score: 0,
      },
      {
        icon: "🤔",
        label: "Ocasionalmente",
        sub: "A veces me olvido",
        score: 1,
      },
      {
        icon: "✅",
        label: "Raramente",
        sub: "Casi siempre precavido",
        score: 2,
      },
      {
        icon: "🔐",
        label: "Nunca",
        sub: "Rutina de seguridad estricta",
        score: 3,
      },
    ],
  },
  {
    id: "h_lighting",
    cat: "Iluminación",
    text: "¿Cómo está la iluminación exterior de tu hogar?",
    weight: "perimeter",
    options: [
      {
        icon: "🌑",
        label: "Sin iluminación exterior",
        sub: "Zonas oscuras en la noche",
        score: 0,
      },
      {
        icon: "💡",
        label: "Iluminación básica fija",
        sub: "Algo de luz, no todo cubierto",
        score: 1,
      },
      {
        icon: "🔆",
        label: "Sensores de movimiento",
        sub: "Se enciende al detectar",
        score: 2,
      },
      {
        icon: "☀️",
        label: "Iluminación total + automatizada",
        sub: "Sin puntos ciegos",
        score: 3,
      },
    ],
  },
  {
    id: "h_response",
    cat: "Plan de respuesta",
    text: "¿Tienes un plan de acción ante una emergencia?",
    weight: "habits",
    options: [
      {
        icon: "🤷",
        label: "No, nunca lo he pensado",
        sub: "Sin protocolo definido",
        score: 0,
      },
      {
        icon: "📋",
        label: "Lo tengo en mente pero informal",
        sub: "Nada documentado",
        score: 1,
      },
      {
        icon: "📱",
        label: "Tengo contactos de emergencia listos",
        sub: "Sé a quién llamar",
        score: 2,
      },
      {
        icon: "🎯",
        label: "Plan documentado y practicado",
        sub: "Toda la familia lo sabe",
        score: 3,
      },
    ],
  },
];

const QUESTIONS_BIZ = [
  {
    id: "b_access",
    cat: "Control de acceso",
    text: "¿Cómo se controla el acceso al inmueble?",
    weight: "perimeter",
    options: [
      {
        icon: "🚪",
        label: "Acceso libre sin control",
        sub: "Cualquiera puede entrar",
        score: 0,
      },
      {
        icon: "🔑",
        label: "Solo llave o código simple",
        sub: "Control básico",
        score: 1,
      },
      {
        icon: "📟",
        label: "Tarjetas o biométrico por área",
        sub: "Control por zonas",
        score: 2,
      },
      {
        icon: "🛡️",
        label: "Sistema integrado + log de accesos",
        sub: "Trazabilidad total",
        score: 3,
      },
    ],
  },
  {
    id: "b_cameras",
    cat: "Vigilancia",
    text: "¿Cuál es la cobertura de cámaras en el negocio?",
    weight: "surveillance",
    options: [
      {
        icon: "❌",
        label: "Sin cámaras",
        sub: "Sin evidencia visual",
        score: 0,
      },
      {
        icon: "📷",
        label: "Solo en entrada principal",
        sub: "Cobertura mínima",
        score: 1,
      },
      {
        icon: "🎥",
        label: "Áreas clave cubiertas",
        sub: "Caja, bodegas, pasillos",
        score: 2,
      },
      {
        icon: "🖥️",
        label: "Cobertura total + monitoreo remoto",
        sub: "Centro de control activo",
        score: 3,
      },
    ],
  },
  {
    id: "b_inventory",
    cat: "Activos y datos",
    text: "¿Cómo proteges el inventario y la información sensible?",
    weight: "assets",
    options: [
      {
        icon: "📦",
        label: "Sin controles especiales",
        sub: "Acceso abierto a todo",
        score: 0,
      },
      {
        icon: "🗄️",
        label: "Áreas restringidas informalmente",
        sub: "Solo de palabra",
        score: 1,
      },
      {
        icon: "🔒",
        label: "Bodega cerrada + acceso limitado",
        sub: "Control físico definido",
        score: 2,
      },
      {
        icon: "💾",
        label: "Seguridad física + digital integrada",
        sub: "Datos y activos protegidos",
        score: 3,
      },
    ],
  },
  {
    id: "b_staff",
    cat: "Personal y protocolos",
    text: "¿Tu equipo tiene capacitación en seguridad?",
    weight: "habits",
    options: [
      {
        icon: "❓",
        label: "Nunca hemos hablado del tema",
        sub: "Sin cultura de seguridad",
        score: 0,
      },
      {
        icon: "📢",
        label: "Reglas informales verbales",
        sub: "Sin documentar ni entrenar",
        score: 1,
      },
      {
        icon: "📋",
        label: "Manual de seguridad por escrito",
        sub: "Pero no revisado frecuente",
        score: 2,
      },
      {
        icon: "🎓",
        label: "Capacitación periódica + simulacros",
        sub: "Cultura de seguridad activa",
        score: 3,
      },
    ],
  },
  {
    id: "b_alarm",
    cat: "Alarmas y monitoreo",
    text: "¿Qué sistema de alarma tiene el negocio?",
    weight: "alarm",
    options: [
      {
        icon: "🔕",
        label: "Sin alarma",
        sub: "Sin detección automática",
        score: 0,
      },
      {
        icon: "🔔",
        label: "Alarma local sin monitoreo",
        sub: "Solo hace ruido",
        score: 1,
      },
      {
        icon: "📡",
        label: "Alarma con notificación al dueño",
        sub: "Alerta al celular",
        score: 2,
      },
      {
        icon: "🚨",
        label: "Monitoreo 24/7 + respuesta",
        sub: "Servicio profesional activo",
        score: 3,
      },
    ],
  },
  {
    id: "b_audit",
    cat: "Auditoría de seguridad",
    text: "¿Con qué frecuencia revisan la infraestructura de seguridad?",
    weight: "habits",
    options: [
      {
        icon: "🤷",
        label: "Nunca lo hemos hecho",
        sub: "Sin evaluaciones",
        score: 0,
      },
      {
        icon: "📅",
        label: "Solo cuando algo falla",
        sub: "Reactivo, no preventivo",
        score: 1,
      },
      {
        icon: "🔍",
        label: "Una revisión al año",
        sub: "Evaluación periódica básica",
        score: 2,
      },
      {
        icon: "⚙️",
        label: "Revisión trimestral + mejora continua",
        sub: "Sistema proactivo y documentado",
        score: 3,
      },
    ],
  },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────

function calcProfile(answers, questions) {
  const weights = {
    perimeter: 0,
    surveillance: 0,
    alarm: 0,
    habits: 0,
    assets: 0,
  };
  const maxes = {
    perimeter: 0,
    surveillance: 0,
    alarm: 0,
    habits: 0,
    assets: 0,
  };
  questions.forEach((q) => {
    const a = answers[q.id];
    if (a !== undefined) weights[q.weight] += a;
    maxes[q.weight] += 3;
  });
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const maxTotal = Object.values(maxes).reduce((a, b) => a + b, 0);
  const pct = Math.round((total / maxTotal) * 100);
  const cats = Object.keys(weights)
    .filter((k) => maxes[k] > 0)
    .map((k) => ({
      key: k,
      label: {
        perimeter: "Perímetro",
        surveillance: "Vigilancia",
        alarm: "Alarmas",
        habits: "Hábitos/Protocolos",
        assets: "Activos",
      }[k],
      pct: Math.round((weights[k] / maxes[k]) * 100),
    }));
  let level, title, desc, badge;
  if (pct >= 75) {
    level = "low";
    title = "Protegido — sigue así";
    badge = "🟢 Riesgo Bajo";
    desc =
      "Tu nivel de seguridad está por encima del promedio. Hay oportunidades de mejora, pero las bases son sólidas.";
  } else if (pct >= 50) {
    level = "medium";
    title = "Vulnerabilidades detectadas";
    badge = "🟡 Riesgo Medio";
    desc =
      "Tienes algunas medidas en marcha, pero existen brechas importantes que un intruso experimentado podría aprovechar.";
  } else if (pct >= 25) {
    level = "high";
    title = "Exposición significativa";
    badge = "🔴 Riesgo Alto";
    desc =
      "Tu seguridad actual tiene múltiples puntos débiles. Un incidente tendría consecuencias económicas y personales serias.";
  } else {
    level = "critical";
    title = "Alerta: Exposición crítica";
    badge = "🚨 Riesgo Crítico";
    desc =
      "Prácticamente sin protección. La probabilidad de un incidente es alta. Requieres acción inmediata.";
  }
  return { pct, level, title, desc, badge, cats };
}

function getRingColor(level) {
  return {
    low: "#00E599",
    medium: "#FFAA00",
    high: "#FF7043",
    critical: "#FF3B5C",
  }[level];
}

const INSIGHTS_HOME = {
  low: [
    "Tus fundamentos son buenos. Considera agregar monitoreo profesional para eliminar los riesgos residuales.",
    "La iluminación automatizada es la mejora con mayor impacto visual-disuasivo para completar tu protección.",
  ],
  medium: [
    "Las brechas en vigilancia y alarmas son los puntos más urgentes a resolver — son las primeras cosas que evalúan los intrusos.",
    "Un sistema de cámaras con grabación en la nube aumenta la protección y facilita la recuperación ante un incidente.",
  ],
  high: [
    "Sin sistema de alarma, los 3–7 minutos de tiempo de respuesta policial son suficientes para consumar un robo.",
    "Integrar cámaras, sensores y control de acceso puede reducir tu exposición hasta en un 80% con una inversión moderada.",
  ],
  critical: [
    "Tu hogar es 4x más probable de ser objetivo que uno con sistemas de seguridad visibles.",
    "El primer paso más impactante es instalar cámaras visibles y una alarma monitoreada — actúan como disuasor inmediato.",
  ],
};

const INSIGHTS_BIZ = {
  low: [
    "Un log de auditoría digital integrado a tu sistema físico es el siguiente nivel para protección completa.",
    "Considera revisiones de seguridad trimestrales para mantener este nivel de protección actualizado.",
  ],
  medium: [
    "El mayor riesgo en negocios de riesgo medio es el robo interno — revisar los controles de acceso a bodega es urgente.",
    "Sin monitoreo 24/7, un incidente fuera de horario laboral puede pasar desapercibido por horas.",
  ],
  high: [
    "Los negocios sin cámaras tienen 3x más probabilidad de ser objetivo de robo que los que sí las tienen.",
    "La falta de protocolos de personal es un vector crítico — muchos robos ocurren desde adentro o con información interna.",
  ],
  critical: [
    "Sin control de acceso ni vigilancia, cualquier empleado, proveedor o cliente puede convertirse en un riesgo.",
    "Implementar un sistema básico cámara + alarma + control de acceso puede reducir el riesgo en más del 70% en semanas.",
  ],
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function ProgressRing({ pct, level, size = 110 }) {
  const r = 46,
    circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const color = getRingColor(level);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg
        className="ring-svg"
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
      >
        <circle className="ring-bg" cx="50" cy="50" r={r} />
        <circle
          className="ring-fill"
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 2px ${color}88)` }}
        />
      </svg>
      <div className="ring-text">
        <span className="ring-score" style={{ color }}>
          {pct}
        </span>
        <span className="ring-label">/ 100</span>
      </div>
    </div>
  );
}

function SubBar({ pct, level }) {
  const color = pct >= 70 ? "#00E599" : pct >= 40 ? "#FFAA00" : "#FF3B5C";
  return (
    <div className="sub-bar-bg">
      <div
        className="sub-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState("type"); // type | quiz | scanning | results
  const [profileType, setProfileType] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [animPcts, setAnimPcts] = useState({});

  const questions = profileType === "home" ? QUESTIONS_HOME : QUESTIONS_BIZ;
  const total = questions.length;
  const progress =
    phase === "results"
      ? 100
      : phase === "quiz"
      ? Math.round((qIdx / total) * 90)
      : phase === "scanning"
      ? 95
      : 0;

  // animate sub-pcts after results appear
  useEffect(() => {
    if (phase === "results" && profile) {
      const t = setTimeout(() => {
        const m = {};
        profile.cats.forEach((c) => {
          m[c.key] = c.pct;
        });
        setAnimPcts(m);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, profile]);

  function handleTypeSelect(type) {
    setProfileType(type);
    setAnswers({});
    setQIdx(0);
    setSelected(null);
    setPhase("quiz");
  }

  function handleAnswer(score) {
    setSelected(score);
  }

  function handleNext() {
    const q = questions[qIdx];
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);
    if (qIdx < total - 1) {
      setQIdx(qIdx + 1);
    } else {
      setPhase("scanning");
      setTimeout(() => {
        const p = calcProfile(newAnswers, questions);
        setProfile(p);
        setPhase("results");
      }, 2600);
    }
  }

  function handleBack() {
    if (qIdx === 0) {
      setPhase("type");
      setProfileType(null);
    } else {
      setQIdx(qIdx - 1);
      setSelected(answers[questions[qIdx - 1].id] ?? null);
    }
  }

  const getWhatsAppLink = () => {
    if (!profile) return "";
    const typeLabel = profileType === "home" ? "Hogar" : "Negocio";
    const msg = `*Hola Zentry, acabo de usar su evaluador de riesgo.* \n\nMi diagnóstico es el siguiente:\n- Tipo: ${typeLabel}\n- Nivel de Riesgo: ${profile.badge}\n- Puntuación: ${profile.pct} / 100\n\nMe interesa conocer más sobre sus soluciones de Ingeniería de Precisión para mejorar mi seguridad.`;
    return `https://wa.me/527202971956?text=${encodeURIComponent(msg)}`;
  };

  const insights =
    profileType === "home"
      ? profile
        ? INSIGHTS_HOME[profile.level]
        : []
      : profile
      ? INSIGHTS_BIZ[profile.level]
      : [];

  const ringColor = profile ? getRingColor(profile.level) : "#00D4FF";

  return (
    <>
      <style>
        {FONTS}
        {css}
      </style>
      <div className="root">
        <div className="scanlines" />
        <div className="corner-glow tl" />
        <div className="corner-glow br" />
        <div className="wrap">
          {/* TOP BAR */}
          <div className="top-bar">
            <div className="logo">
              <div className="logo-dot" />
              Zentry Score
            </div>
            {phase === "quiz" && (
              <div className="step-counter">
                Pregunta <span>{qIdx + 1}</span> de <span>{total}</span>
              </div>
            )}
          </div>

          {/* PROGRESS */}
          {phase !== "type" && (
            <div className="track-wrap">
              <div className="track-bar">
                <div className="track-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="track-label">
                <span>
                  {phase === "results" ? "Análisis completo" : "Analizando..."}
                </span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {/* ── TYPE SELECTOR ── */}
          {phase === "type" && (
            <>
              <div className="header">
                <div className="headline">
                  Descubre<em> con Zentry</em> tu perfil de riesgo.
                </div>
                <div className="tagline">
                  // 8 preguntas · resultado inmediato · sin registro previo
                </div>
              </div>
              <div className="q-card">
                <div className="q-cat">Primero</div>
                <div className="q-text">¿Como es tu inmueble?</div>
                <div className="type-grid">
                  <div
                    className={`type-card ${
                      profileType === "home" ? "selected" : ""
                    }`}
                    onClick={() => setProfileType("home")}
                  >
                    <div className="type-icon">🏠</div>
                    <div className="type-label">Mi hogar</div>
                    <div className="type-sub">
                      Casa, departamento
                      <br />o residencia familiar
                    </div>
                  </div>
                  <div
                    className={`type-card ${
                      profileType === "biz" ? "selected" : ""
                    }`}
                    onClick={() => setProfileType("biz")}
                  >
                    <div className="type-icon">🏢</div>
                    <div className="type-label">Mi negocio</div>
                    <div className="type-sub">
                      Oficina, local comercial
                      <br />o empresa
                    </div>
                  </div>
                </div>
                <div className="btn-row">
                  <button
                    className="btn-next"
                    disabled={!profileType}
                    onClick={() => handleTypeSelect(profileType)}
                  >
                    Comenzar evaluación →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── QUIZ ── */}
          {phase === "quiz" &&
            (() => {
              const q = questions[qIdx];
              return (
                <div className="q-card" key={q.id}>
                  <div className="q-cat">{q.cat}</div>
                  <div className="q-text">{q.text}</div>
                  <div className="options">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`opt ${
                          selected === opt.score ? "selected" : ""
                        }`}
                        onClick={() => handleAnswer(opt.score)}
                      >
                        <div className="opt-radio">
                          {selected === opt.score && (
                            <div className="opt-radio-dot" />
                          )}
                        </div>
                        <div className="opt-icon">{opt.icon}</div>
                        <div>
                          <div className="opt-label">{opt.label}</div>
                          {opt.sub && <div className="opt-sub">{opt.sub}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="btn-row">
                    <button className="btn-back" onClick={handleBack}>
                      ← Atrás
                    </button>
                    <button
                      className="btn-next"
                      disabled={selected === null}
                      onClick={handleNext}
                    >
                      {qIdx < total - 1 ? "Siguiente →" : "Ver mi perfil →"}
                    </button>
                  </div>
                </div>
              );
            })()}

          {/* ── SCANNING ── */}
          {phase === "scanning" && (
            <div className="q-card scanning">
              <div className="scan-title">⬡ Procesando tu perfil de riesgo</div>
              <div className="scan-bar-wrap">
                <div className="scan-bar-bg">
                  <div className="scan-fill" />
                </div>
              </div>
              <div className="scan-items">
                {[
                  "Analizando perímetro y accesos...",
                  "Evaluando vigilancia y detección...",
                  "Calculando exposición a riesgos...",
                  "Generando recomendaciones personalizadas...",
                ].map((t, i) => (
                  <div key={i} className="scan-item">
                    <div className="scan-dot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {phase === "results" && profile && (
            <div className="results">
              <div className="result-header">
                <div
                  className={`result-badge ${
                    profile.level === "low"
                      ? "badge-green"
                      : profile.level === "medium"
                      ? "badge-amber"
                      : "badge-red"
                  }`}
                >
                  {profile.badge}
                </div>
                <div className="result-headline">{profile.title}</div>
                <div className="result-sub">{profile.desc}</div>
              </div>

              <div className="score-section">
                <ProgressRing pct={profile.pct} level={profile.level} />
                <div>
                  <div className="score-info-label">
                    Puntuación de seguridad
                  </div>
                  <div
                    className="score-info-title"
                    style={{ color: ringColor }}
                  >
                    {profile.pct >= 75
                      ? "Buena protección"
                      : profile.pct >= 50
                      ? "Protección parcial"
                      : profile.pct >= 25
                      ? "Protección insuficiente"
                      : "Sin protección"}
                  </div>
                  <div className="score-info-desc">
                    Basado en {total} dimensiones evaluadas para{" "}
                    {profileType === "home" ? "hogares" : "negocios"}.
                  </div>
                </div>
              </div>

              <div className="sub-grid">
                {profile.cats.map((c) => (
                  <div className="sub-card" key={c.key}>
                    <div className="sub-cat">
                      <span>{c.label}</span>
                      <span
                        className="sub-pct"
                        style={{
                          color:
                            c.pct >= 70
                              ? "#00E599"
                              : c.pct >= 40
                              ? "#FFAA00"
                              : "#FF3B5C",
                        }}
                      >
                        {animPcts[c.key] ?? 0}%
                      </span>
                    </div>
                    <SubBar pct={animPcts[c.key] ?? 0} level={profile.level} />
                  </div>
                ))}
              </div>

              <div className="insights">
                {insights.map((txt, i) => (
                  <div className="insight" key={i}>
                    <div className="insight-icon">{i === 0 ? "💡" : "🎯"}</div>
                    <div
                      className="insight-body"
                      dangerouslySetInnerHTML={{
                        __html: txt.replace(
                          /\*\*(.+?)\*\*/g,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="email-capture">
                <div className="ec-icon">📱</div>
                <div className="ec-title">
                  Recibe tu plan de acción personalizado
                </div>
                <div className="ec-sub">
                  Envíanos tu diagnóstico por WhatsApp para recibir una asesoría
                  gratuita de "Ingeniería de Precisión" y cotizar un sistema a
                  la medida de tu {profileType === "home" ? "hogar" : "negocio"}
                  .
                </div>
                <div className="ec-form">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button className="btn-wa">
                      <svg
                        width="100"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        alignmentBaseline=""
                      >
                        <path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.96.56 3.79 1.54 5.34l-1.54 5.65 5.79-1.52c1.47.88 3.19 1.39 5.01 1.39 5.52 0 10.01-4.48 10.01-10.01 0-5.52-4.49-9.99-10.01-9.99zm5.35 14.51c-.24.67-1.39 1.25-1.93 1.31-.49.06-1.12.13-3.19-.73-2.5-1.04-4.11-3.66-4.24-3.83-.12-.17-1.02-1.35-1.02-2.58s.64-1.84.86-2.07c.22-.22.48-.28.64-.28.17 0 .34.01.49.01.16 0 .38-.06.6.48.23.54.78 1.91.85 2.04.06.13.11.28.02.46-.09.18-.13.29-.27.46-.12.16-.27.34-.37.45-.12.12-.25.26-.11.51.14.25.62 1.04 1.35 1.69.94.84 1.71 1.1 1.96 1.22.25.12.39.1.53-.06.15-.17.65-.75.82-1.01.18-.26.35-.22.58-.13.23.09 1.48.7 1.73.83.25.12.42.19.48.29.06.11.06.63-.18 1.3z" />
                      </svg>
                      Solicitar un levantamiento gratis, ya!
                    </button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
