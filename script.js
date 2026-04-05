// ═══════════════════════════════════════════════════════════════
// RECONKIT — script.js
// Sections: Fingerprint | Panel System | Tools | Utilities | Learn
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// THEME SYSTEM — detects system preference, supports manual toggle
// ═══════════════════════════════════════════════════════════════
(function initTheme() {
  const saved = localStorage.getItem('rk_theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (sysDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rk_theme', next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '🌙' : '☀️';
}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    btn.addEventListener('click', toggleTheme);
  }
  // Also listen for system theme changes when no manual override
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('rk_theme')) {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      const toggleBtn = document.getElementById('themeToggle');
      if (toggleBtn) toggleBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  });
});

// ─── API KEY MANAGEMENT ───────────────────────────────────────
const KEYS = {
  get abuseipdb()  { return localStorage.getItem('rk_abuseipdb')  || ''; },
  get virustotal() { return localStorage.getItem('rk_virustotal') || ''; },
  get hibp()       { return localStorage.getItem('rk_hibp')       || ''; },
};

function saveAPIKeys() {
  const ab = document.getElementById('key-abuseipdb').value.trim();
  const vt = document.getElementById('key-virustotal').value.trim();
  const hb = document.getElementById('key-hibp').value.trim();
  if (ab) localStorage.setItem('rk_abuseipdb', ab);
  if (vt) localStorage.setItem('rk_virustotal', vt);
  if (hb) localStorage.setItem('rk_hibp', hb);
  closeSettings();
  showToast('API keys saved');
}

function openSettings() {
  document.getElementById('key-abuseipdb').value  = KEYS.abuseipdb;
  document.getElementById('key-virustotal').value = KEYS.virustotal;
  document.getElementById('key-hibp').value       = KEYS.hibp;
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

document.getElementById('settingsBtn').addEventListener('click', openSettings);

// ─── TOAST ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:#0a1828; border:1px solid #00e5ff; color:#00e5ff;
    font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:1px;
    padding:10px 20px; border-radius:4px; z-index:9999;
    animation: fadeInUp 0.3s ease forwards;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ─── PANEL SYSTEM ─────────────────────────────────────────────
const PANEL_TITLES = {
  ip:       ['IP INTELLIGENCE',     'IP Lookup'],
  domain:   ['DOMAIN INTELLIGENCE', 'WHOIS Lookup'],
  dns:      ['DNS RECORDS',         'DNS Lookup'],
  ssl:      ['TLS/SSL INSPECTION',  'SSL Checker'],
  headers:  ['HTTP INSPECTION',     'HTTP Headers'],
  breach:   ['BREACH INTELLIGENCE', 'Data Breach Check'],
  username: ['OSINT',               'Username Search'],
  utils:    ['TOOLKIT',             'Utilities'],
  learn:    ['KNOWLEDGE BASE',      'Learn & Protect'],
};

function openPanel(tool) {
  const panel   = document.getElementById('toolPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const [eyebrow, title] = PANEL_TITLES[tool] || ['TOOL', tool];

  document.getElementById('panelEyebrow').textContent = eyebrow;
  document.getElementById('panelTitle').textContent   = title;

  const body = document.getElementById('panelBody');
  body.innerHTML = '';
  TOOL_RENDERERS[tool]?.(body);

  panel.classList.add('open');
  backdrop.classList.add('open');

  // Update nav active state
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });
}

function closePanel() {
  document.getElementById('toolPanel').classList.remove('open');
  document.getElementById('panelBackdrop').classList.remove('open');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === 'exposure');
  });
}

// Nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    if (tool === 'exposure') { closePanel(); return; }
    openPanel(tool);
  });
});

// Hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navTools').classList.toggle('mobile-open');
});

// ─── COPY UTILITY ─────────────────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { btn.textContent = '✓ COPIED'; btn.classList.add('copied'); }
    setTimeout(() => {
      if (btn) { btn.textContent = 'COPY'; btn.classList.remove('copied'); }
    }, 1800);
  });
}

// ─── SCAN BAR ─────────────────────────────────────────────────
let scanDone = false;

function runScan(onComplete) {
  const fill  = document.getElementById('scanFill');
  const pct   = document.getElementById('scanPct');
  const label = document.getElementById('scanLabel');
  let p = 0;

  label.textContent = 'CAPTURING DATA';
  const t = setInterval(() => {
    p = Math.min(p + Math.random() * 3, 100);
    fill.style.width = p + '%';
    pct.textContent  = p >= 100 ? '100% — COMPLETE' : Math.floor(p) + '%';
    if (p >= 100) {
      clearInterval(t);
      label.textContent = 'CAPTURE COMPLETE';
      document.getElementById('scanStatus').textContent = 'All data points resolved.';
      // Flash the fill bar green on completion
      fill.style.animation = 'scanComplete 0.6s ease-out';
      setTimeout(() => { fill.style.animation = ''; }, 700);
      if (!scanDone) {
        scanDone = true;
        onComplete?.();
      }
    }
  }, 55);
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms))
  ]);
}

// ─── FINGERPRINT DETECTION ────────────────────────────────────
function set(id, value, className) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.classList.remove('loading');
  if (className) el.classList.add(className);
}

async function hashStr(str) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  } catch { return str.slice(0, 24); }
}

function getCanvasHash() {
  try {
    const c = document.createElement('canvas');
    c.width = 220; c.height = 40;
    const ctx = c.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0a1828'; ctx.fillRect(0, 0, 220, 40);
    ctx.fillStyle = '#00e5ff'; ctx.font = '14px JetBrains Mono';
    ctx.fillText('ReconKit ❋ 7α9c', 4, 26);
    ctx.fillStyle = 'rgba(0,255,136,0.6)'; ctx.font = 'italic 11px Georgia';
    ctx.fillText('fingerprint:active', 6, 36);
    return c.toDataURL().slice(-60);
  } catch { return 'canvas blocked'; }
}

function detectWebRTC() {
  return new Promise(resolve => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      const ips = new Set();
      pc.createDataChannel('');
      pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => resolve('Blocked'));
      pc.onicecandidate = e => {
        if (!e.candidate) { pc.close(); resolve(ips.size ? [...ips].join(', ') : 'Not detected'); return; }
        const m = e.candidate.candidate.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g);
        m?.filter(ip => !ip.startsWith('0.') && ip !== '0.0.0.0').forEach(ip => ips.add(ip));
      };
      setTimeout(() => { pc.close(); resolve(ips.size ? [...ips].join(', ') : 'Not detected'); }, 3500);
    } catch { resolve('Blocked by browser'); }
  });
}

function detectAdBlocker() {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'adsbox pub_300x250 pub_300x250m';
    el.style.cssText = 'position:absolute; top:-9999px; left:-9999px; width:1px; height:1px;';
    document.body.appendChild(el);
    setTimeout(() => {
      const blocked = !el.offsetParent || el.offsetHeight === 0;
      el.remove();
      resolve(blocked);
    }, 100);
  });
}

// ─── INSTALLED FONTS FINGERPRINT ──────────────────────────────
// Detects common fonts by measuring text width using canvas
async function detectInstalledFonts() {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) return { count: 0, hash: 'blocked', detected: [] };
    
    const testStrings = ['mmmmmmmmmmlli', 'iiiiiiiiiii', 'WWWWWWW'];
    const baseFont = 'monospace';
    const baseFontSize = '72px';
    
    // Measure base width with multiple test strings
    const baseWidths = testStrings.map(str => {
      ctx.font = `${baseFontSize} ${baseFont}`;
      return ctx.measureText(str).width;
    });
    
    // Common fonts across platforms
    const commonFonts = [
      'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana',
      'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Palatino', 'Garamond',
      'Bookman', 'Helvetica', 'Menlo', 'Monaco', 'Consolas',
      'Liberation Mono', 'DejaVu Sans Mono', 'Lucida Console',
      'Charcoal', 'Copperplate', 'Courier', 'Hoefler Text', 'Optima',
      'Segoe UI', 'Calibri', 'Tahoma', 'Lucida Grande', 'Gill Sans',
      'Cambria', 'Constantia', 'Candara', 'Corbel', 'Consolas',
      'Lucida Sans Unicode', 'Lucida Sans', 'URW Gothic', 'Century Gothic',
      'Avant Garde', 'Wingdings', 'Wingdings 2', 'Wingdings 3',
      'Apple Chancery', 'Chalkboard', 'Copperplate Gothic', 'Didot',
      'Mistral', 'Papyrus', 'Perpetua', 'Rockwell', 'Rockwell Extra',
      'Baskerville', 'Georgia Pro', 'Geneva', 'Gill Sans MT',
      'Helvetica Neue', 'Palatino Linotype', 'Segoe Print', 'Tw Cen MT',
    ];
    
    const detected = [];
    
    for (const font of commonFonts) {
      try {
        let isDetected = false;
        
        // Test with multiple strings for accuracy
        for (let i = 0; i < testStrings.length; i++) {
          ctx.font = `${baseFontSize} "${font}", ${baseFont}`;
          const width = ctx.measureText(testStrings[i]).width;
          
          // If width differs significantly from base, font is detected
          if (Math.abs(width - baseWidths[i]) > 2) {
            isDetected = true;
            break;
          }
        }
        
        if (isDetected) {
          detected.push(font);
        }
      } catch (e) {
        // Skip this font if error occurs, continue to next
        continue;
      }
    }
    
    // Create hash from sorted detected fonts
    const sortedFonts = detected.sort().join('|');
    const fontHash = await hashStr(sortedFonts);
    
    return {
      count: detected.length,
      hash: fontHash,
      detected: detected
    };
  } catch (e) {
    return { count: 0, hash: 'unavailable', detected: [] };
  }
}

// ─── WEBGL FINGERPRINT ────────────────────────────────────────
// Enhanced GPU detection with vendor, renderer, extensions
async function getWebGLFingerprint() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return { vendor: 'Unavailable', renderer: 'Unavailable', hash: 'no-webgl', extensions: 0 };
    
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) {
      return { vendor: 'Masked', renderer: 'Masked', hash: 'masked', extensions: 0 };
    }
    
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    
    // Get all supported extensions
    const allExtensions = gl.getSupportedExtensions() || [];
    const extensionCount = allExtensions.length;
    
    // Create fingerprint from WebGL properties
    const webglData = `${vendor}|${renderer}|${extensionCount}|${allExtensions.slice(0, 10).join(',')}`;
    const hash = await hashStr(webglData);
    
    return {
      vendor: vendor,
      renderer: renderer,
      extensions: extensionCount,
      hash: hash
    };
  } catch (e) {
    return { vendor: 'Blocked', renderer: 'Blocked', hash: 'blocked', extensions: 0 };
  }
}

// ─── AUDIOCONTEXT FINGERPRINT ─────────────────────────────────
// Uses OfflineAudioContext for unique fingerprint (private browsing safe)
async function getAudioFingerprint() {
  try {
    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineAudioContext) return { hash: 'unavailable' };
    
    // Use only OfflineAudioContext - safer than creating active context
    const offlineCtx = new OfflineAudioContext(1, 44100, 44100);
    const osc = offlineCtx.createOscillator();
    const comp = offlineCtx.createDynamicsCompressor();
    
    osc.type = 'triangle';
    osc.frequency.value = 10000;
    osc.connect(comp);
    comp.connect(offlineCtx.destination);
    osc.start();
    osc.stop(0.05);
    
    const buffer = await offlineCtx.startRendering();
    const channelData = buffer.getChannelData(0);
    
    // Create hash from audio buffer samples
    let sum = 0;
    let variance = 0;
    for (let i = 0; i < Math.min(100, channelData.length); i++) {
      const val = Math.abs(channelData[i]);
      sum += val;
      variance += val * val;
    }
    
    const audioSignature = `${offlineCtx.sampleRate}|${buffer.length}|${sum.toFixed(8)}|${variance.toFixed(8)}`;
    const hash = await hashStr(audioSignature);
    
    return { hash: hash };
  } catch (e) {
    return { hash: 'unavailable' };
  }
}

// ─── ENHANCED WEBRTC WITH LOCAL IPS ───────────────────────────
// Detects both public and local/private IPs with better parsing
async function detectWebRTCDetailed() {
  return new Promise(resolve => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      const publicIPs = new Set();
      const localIPs = new Set();
      
      // Better IPv4 regex - validates octets 0-255
      const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
      
      pc.createDataChannel('');
      pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {
        resolve({ publicIP: 'Blocked', localIPs: [], leakDetected: false });
      });
      
      pc.onicecandidate = e => {
        if (!e.candidate) {
          pc.close();
          resolve({
            publicIP: publicIPs.size > 0 ? [...publicIPs][0] : 'Not detected',
            localIPs: [...localIPs],
            leakDetected: publicIPs.size > 0
          });
          return;
        }
        
        try {
          const m = e.candidate.candidate.match(ipv4Regex);
          if (m) {
            m.forEach(ip => {
              if (!ip.startsWith('0.') && ip !== '0.0.0.0') {
                // Detect local/private IPs per RFC 1918
                if (ip.startsWith('192.168.') || ip.startsWith('10.') || 
                    (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) {
                  localIPs.add(ip);
                } else {
                  publicIPs.add(ip);
                }
              }
            });
          }
        } catch (err) {
          // Silently skip malformed candidates
        }
      };
      
      setTimeout(() => {
        pc.close();
        resolve({
          publicIP: publicIPs.size > 0 ? [...publicIPs][0] : 'Not detected',
          localIPs: [...localIPs],
          leakDetected: publicIPs.size > 0
        });
      }, 3500);
    } catch (e) {
      resolve({ publicIP: 'Blocked by browser', localIPs: [], leakDetected: false });
    }
  });
}

// ─── FINGERPRINT STORAGE & COMPARISON ───────────────────────────
// Store current fingerprint for comparison on next run
let currentFingerprint = null;

function saveFingerprintSnapshot(data) {
  currentFingerprint = data;
  try {
    localStorage.setItem('rk_fingerprint_current', JSON.stringify(data));
    localStorage.setItem('rk_fingerprint_timestamp', new Date().toISOString());
  } catch {}
}

function getPreviousFingerprint() {
  try {
    return JSON.parse(localStorage.getItem('rk_fingerprint_previous'));
  } catch {
    return null;
  }
}

function compareFingerprints(current, previous) {
  if (!previous) return {};
  const changed = {};
  for (const key in current) {
    if (current[key] !== previous[key]) {
      changed[key] = { was: previous[key], now: current[key] };
    }
  }
  return changed;
}

// ─── EXPORT FINGERPRINT ──────────────────────────────────────────
function exportFingerprintJSON() {
  if (!currentFingerprint) {
    showToast('Capture data first');
    return;
  }
  
  const exportData = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    fingerprint: currentFingerprint
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reconkit-fingerprint-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Fingerprint exported');
}

// ─── TOOLTIP HELPER ──────────────────────────────────────────────
// ─── PHASE 1: SIGNAL RISK BREAKDOWN ──────────────────────────
const SIGNAL_RISKS = {
  canvas:   { level: 'HIGH', color: 'var(--red)', desc: 'Device-specific rendering creates unique identifier' },
  webgl:    { level: 'HIGH', color: 'var(--red)', desc: 'GPU vendor & extensions uniquely identify you' },
  webrtc:   { level: 'HIGH', color: 'var(--red)', desc: 'Leaks real IP even behind VPN' },
  audio:    { level: 'MEDIUM', color: 'var(--amber)', desc: 'Audio hardware fingerprint cross-site tracking' },
  fonts:    { level: 'MEDIUM', color: 'var(--amber)', desc: 'Installed fonts reveal OS & region' },
  plugins:  { level: 'MEDIUM', color: 'var(--amber)', desc: 'Browser plugins/extensions are identifiable' },
  gpu:      { level: 'MEDIUM', color: 'var(--amber)', desc: 'GPU model often unique per device' },
  cookies:  { level: 'HIGH', color: 'var(--red)', desc: 'Primary tracking mechanism if enabled' },
  screen:   { level: 'LOW', color: 'var(--green)', desc: 'Screen resolution shared by many users' },
  cpu:      { level: 'LOW', color: 'var(--green)', desc: 'Limited discrete values' },
  battery:  { level: 'LOW', color: 'var(--green)', desc: 'Temporary value, changes frequently' },
  timezone: { level: 'LOW', color: 'var(--green)', desc: 'Narrows location but broadly shared' },
  touch:    { level: 'LOW', color: 'var(--green)', desc: 'Binary value, limited uniqueness' },
  dnt:      { level: 'LOW', color: 'var(--green)', desc: 'Privacy preference indicator' },
};

function getRiskLevel(signal) {
  return SIGNAL_RISKS[signal] || { level: 'UNKNOWN', color: '#b8d4e8', desc: 'No risk data' };
}

const TOOLTIP_TEXTS = {
  'canvas': 'Visible to every website. Renders text with device-specific quirks for unique identification.',
  'webgl': 'GPU vendor & extensions visible to websites. Used for graphics fingerprinting across visits.',
  'audio': 'Audio rendering is device-specific. Websites capture this for cross-site tracking.',
  'fonts': 'Installed fonts reveal OS, region, and profiling information to tracked analyses.',
  'webrtc': 'Even behind VPN, WebRTC can leak your real IP adr and local network information.',
  'local-ip': 'Local network IPs can unmask your real network setup and internal connectivity.',
  'plugins': 'Browser plugins/extensions are visible and often uniquely identifying.',
  'langs': 'Language preferences reveal location, education level, and regional information.',
  'a11y': 'Accessibility preferences reveal disabilities or physical considerations to trackers.',
  'orientation': 'Screen orientation combined with resolution creates a fingerprinting vector.',
  'ip': 'Your public IP reveals your location and ISP to every website. A VPN replaces it with the VPN server IP.',
  'isp': 'Your Internet provider is visible to all websites and narrows your location significantly.',
  'loc': 'Location is derived from your IP. Usually accurate to city level. A VPN changes this.',
  'vpn': 'ReconKit checks if your IP belongs to a known VPN or hosting provider.',
  'screen': 'Screen resolution and pixel density contribute to your fingerprint profile.',
  'dnt': 'Do Not Track is ignored by most websites. Having it enabled can itself be a fingerprinting signal.',
  'adblock': 'Ad blockers are detectable. Ironically this is a fingerprinting signal — though the privacy benefit outweighs the cost.',
  'touch': 'Touch point count helps narrow down your device type.',
  'cpu': 'CPU core count is visible and contributes a small but real fingerprint signal.',
  'ram': 'RAM is exposed via deviceMemory API, rounded to nearest power of 2.',
};

function attachTooltip(elementId, key) {
  const el = document.getElementById(elementId);
  if (!el || !TOOLTIP_TEXTS[key]) return;
  
  el.style.cursor = 'help';
  el.dataset.tooltip = key;
  el.title = TOOLTIP_TEXTS[key];
  
  // Add info icon marker
  const label = el.closest('.fp-card')?.querySelector('.fp-label');
  if (label && !label.querySelector('.info-icon')) {
    const icon = document.createElement('span');
    icon.className = 'info-icon';
    icon.textContent = ' ⓘ';
    icon.style.opacity = '0.6';
    icon.style.fontSize = '11px';
    icon.style.cursor = 'help';
    icon.dataset.tooltip = key;
    label.appendChild(icon);
  }
}

function initTooltipEngine() {
  const tooltip = document.createElement('div');
  tooltip.id = 'rk-tooltip';
  tooltip.style.cssText = 'position:fixed;left:-9999px;top:-9999px;pointer-events:none;z-index:100000;padding:10px 12px;border-radius:8px;background:rgba(10,24,40,0.98);color:#f8f9fb;font-size:12px;line-height:1.4;max-width:280px;opacity:0;transition:opacity 0.15s ease;border:1px solid rgba(0,229,255,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.5);';
  document.body.appendChild(tooltip);

  let activeEl = null;

  window.addEventListener('mouseover', e => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || target === activeEl) return;
    const key = target.dataset.tooltip;
    if (!key || !TOOLTIP_TEXTS[key]) return;
    activeEl = target;
    tooltip.textContent = TOOLTIP_TEXTS[key];
    const rect = target.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const left = Math.min(window.innerWidth - 320, Math.max(10, rect.left + scrollX));
    const top = rect.bottom + scrollY + 8;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
  });

  window.addEventListener('mouseout', e => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || target !== activeEl) return;
    activeEl = null;
    tooltip.style.opacity = '0';
    setTimeout(() => {
      if (!activeEl) {
        tooltip.style.left = '-9999px';
        tooltip.style.top = '-9999px';
      }
    }, 150);
  });
}

// ─── PHASE 1: DISPLAY RISK BREAKDOWN ────────────────────────
function displayRiskBreakdown() {
  const container = document.getElementById('risk-breakdown-container');
  if (!container) return;

  const risks = Object.entries(SIGNAL_RISKS).map(([signal, data]) => ({
    signal,
    ...data
  }));

  const html = risks.map(r => `
    <div class="risk-card" data-level="${r.level}" style="padding:8px;border:1px solid ${r.color};border-radius:4px;background:rgba(0,0,0,0.2)">
      <div style="font-size:11px;font-weight:700;color:${r.color};letter-spacing:0.5px;margin-bottom:4px">${r.level}</div>
      <div class="risk-card-name" style="font-size:12px;font-weight:600;margin-bottom:2px">${r.signal.charAt(0).toUpperCase() + r.signal.slice(1)}</div>
      <div style="font-size:10px;color:var(--text-muted);line-height:1.4">${r.desc}</div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// ─── PHASE 1: RE-SCAN FUNCTIONALITY ─────────────────────────
let scanHistory = [];

function loadScanHistory() {
  try {
    scanHistory = JSON.parse(localStorage.getItem('rk_scan_history')) || [];
  } catch { scanHistory = []; }
}

function saveScanSnapshot(snapshot) {
  scanHistory.push(snapshot);
  try {
    localStorage.setItem('rk_scan_history', JSON.stringify(scanHistory.slice(-10)));
  } catch {}
}

function detectChangedSignals() {
  if (scanHistory.length < 2) return [];
  const prev = scanHistory[scanHistory.length - 2];
  const curr = scanHistory[scanHistory.length - 1];
  if (!prev || !curr) return [];

  const changed = [];
  for (const key in curr) {
    if (key !== 'timestamp' && prev[key] !== curr[key]) {
      changed.push(key);
    }
  }
  return changed;
}
// Improved entropy-based estimation with better correlation handling
function estimateUniquenessScore(signals) {
  // Weighted signal importance (bits of entropy contribution)
  const signalWeights = {
    canvas:   { weight: 2.8, bits: 32 },   // Canvas is highly unique
    webgl:    { weight: 2.5, bits: 28 },   // WebGL vendor/renderer specific
    audio:    { weight: 2.2, bits: 26 },   // Audio hardware variance
    fonts:    { weight: 1.8, bits: 20 },   // Font combinations vary
    gpu:      { weight: 1.6, bits: 16 },   // GPU identification
    screen:   { weight: 1.4, bits: 18 },   // Screen res + DPI combo
    cpu:      { weight: 0.9, bits: 8 },    // Limited discrete values
    plugins:  { weight: 1.2, bits: 14 },   // Plugin combinations
    langs:    { weight: 0.8, bits: 10 },   // Language settings
    tz:       { weight: 0.6, bits: 8 },    // Timezone (sparse)
    touch:    { weight: 0.5, bits: 4 },    // Binary value
  };
  
  let totalBits = 0;
  let presentBits = 0;
  
  for (const [key, { bits }] of Object.entries(signalWeights)) {
    totalBits += bits;
    if (signals[key] && signals[key] !== 'Unavailable' && signals[key] !== 'unavailable' && signals[key] !== 0) {
      presentBits += bits;
    }
  }
  
  // Calculate score as percentage of maximum entropy collected
  const entropyScore = (presentBits / totalBits) * 100;
  
  // Platform multiplier - mobile has fewer variation points than desktop
  const isMobile = /mobile|tablet|iphone|ipad|android/i.test(navigator.userAgent);
  const platformMultiplier = isMobile ? 0.7 : 1.0;
  
  const adjustedScore = Math.min(entropyScore * platformMultiplier, 100);
  
  // Estimate device uniqueness from entropy score
  // Using realistic distribution model
  let estimatedUnique = 1000;
  if (adjustedScore > 90) {
    estimatedUnique = 35000;  // ~1 in 35k (very unique)
  } else if (adjustedScore > 80) {
    estimatedUnique = 18000;  // ~1 in 18k
  } else if (adjustedScore > 70) {
    estimatedUnique = 8000;   // ~1 in 8k
  } else if (adjustedScore > 60) {
    estimatedUnique = 3500;   // ~1 in 3.5k
  } else if (adjustedScore > 50) {
    estimatedUnique = 1500;   // ~1 in 1.5k
  } else if (adjustedScore > 40) {
    estimatedUnique = 600;    // ~1 in 600
  } else if (adjustedScore > 30) {
    estimatedUnique = 250;    // ~1 in 250
  }
  
  // Add platform caveat to estimate
  const platNote = isMobile ? ' (mobile)' : ' (desktop)';
  
  return {
    score: Math.round(adjustedScore),
    entropyBits: Math.round(presentBits),
    maxBits: totalBits,
    estimatedUnique: estimatedUnique,
    percentile: Math.min(Math.round((adjustedScore / 100) * 100), 99),
    riskLevel: adjustedScore > 80 ? 'high' : adjustedScore > 60 ? 'medium' : 'low',
    platformNote: platNote
  };
}

function getGPU() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return 'WebGL unavailable';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Renderer masked';
  } catch { return 'Unavailable'; }
}

// PHASE 3: Advanced Chromium variant detection
function detectChromiumVariant(ua) {
  // Returns: { variant, confidence, signals }
  const signals = [];
  let variant = 'Chrome', confidence = 0.5;
  
  // Check for explicit variant markers
  if (ua.match(/Brave\/(\d+)/)) {
    variant = 'Brave Browser';
    confidence = 0.99;
    signals.push('Brave/ token in UA');
  } else if (ua.match(/Vivaldi\/(\d+)/)) {
    variant = 'Vivaldi';
    confidence = 0.99;
    signals.push('Vivaldi/ token in UA');
  } else if (ua.match(/Chromium\/(\d+)/)) {
    variant = 'Chromium (open-source)';
    confidence = 0.95;
    signals.push('Chromium/ token in UA');
  } else if (ua.match(/EdgA?\//)) {
    variant = 'Microsoft Edge';
    confidence = 0.99;
    signals.push('Edg/ token in UA');
  } else if (ua.match(/YaBrowser|YaSearchBrowser/)) {
    variant = 'Yandex Browser';
    confidence = 0.98;
    signals.push('YaBrowser token in UA');
  } else if (ua.match(/Whale\/(\d+)/)) {
    variant = 'Naver Whale';
    confidence = 0.98;
    signals.push('Whale/ token in UA');
  } else if (ua.match(/UCWEB|UCBrowser/)) {
    variant = 'UC Browser';
    confidence = 0.95;
    signals.push('UCWEB token in UA');
  } else if (ua.match(/Opera|OPR\//)) {
    variant = 'Opera';
    confidence = 0.98;
    signals.push('OPR/ token in UA');
  } else if (ua.match(/Firefox\//)) {
    variant = 'Mozilla Firefox';
    confidence = 0.99;
    signals.push('Firefox/ token in UA');
  } else if (ua.match(/Safari\//) && !ua.match(/Chrome\//)) {
    variant = 'Safari';
    confidence = 0.99;
    signals.push('Safari/ without Chrome token');
  } else {
    // Additional Chromium detection via APIs & features
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      if (chrome.runtime.id && chrome.runtime.id.match(/nmaocjpgpchaneajhpnhkbdgnpajdbja/)) {
        variant = 'Brave Browser (confirmed via API)';
        confidence = 1.0;
        signals.push('Brave runtime ID via chrome.runtime');
      } else {
        variant = 'Chromium-based (generic)';
        confidence = 0.7;
        signals.push('chrome.runtime API available');
      }
    }
    
    // Check for WebKit version patterns
    if (ua.match(/Chrome\/(\d+)/)) {
      confidence = 0.6;
      signals.push('Chrome/ token (shared by all Chromium browsers)');
      
      // Heuristic: check Chrome version patterns
      const chromeMatch = ua.match(/Chrome\/(\d+)/);
      const chromeVer = chromeMatch ? parseInt(chromeMatch[1]) : 0;
      if (chromeVer >= 100 && !ua.match(/Brave|Vivaldi|YaBrowser|Whale/)) {
        // Recent Chrome versions without other markers = likely Chrome
        variant = 'Google Chrome';
        confidence = 0.75;
      }
    }
  }
  
  return { variant, confidence, signals };
}

function parseUA(ua) {
  let os = 'Unknown OS', browser = 'Unknown Browser';
  if (/iPhone/.test(ua)) os = 'iPhone (iOS)';
  else if (/iPad/.test(ua)) os = 'iPad (iPadOS)';
  else if (/Android/.test(ua)) { const m = ua.match(/Android ([\d.]+)/); os = m ? `Android ${m[1]}` : 'Android'; }
  else if (/Macintosh/.test(ua)) { const m = ua.match(/Mac OS X ([\d_]+)/); os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS'; }
  else if (/Windows NT/.test(ua)) { const m = ua.match(/Windows NT ([\d.]+)/); const v = {'10.0':'10/11','6.3':'8.1','6.2':'8','6.1':'7'}; os = `Windows ${v[m?.[1]] || (m?.[1] || '')}`; }
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  
  // Browser detection — check specific browsers BEFORE generic Chrome
  if (/Edg\//.test(ua)) { const m = ua.match(/Edg\/([\d.]+)/); browser = `Microsoft Edge ${m?.[1] || ''}`; }
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/Firefox\/([\d.]+)/.test(ua)) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] || ''}`;
  // Chromium-based browsers — check BEFORE generic Chrome
  else if (/Brave\//.test(ua)) { const m = ua.match(/Brave\/([\d.]+)/); browser = `Brave ${m?.[1] || ''}`; }
  else if (/Vivaldi\//.test(ua)) { const m = ua.match(/Vivaldi\/([\d.]+)/); browser = `Vivaldi ${m?.[1] || ''}`; }
  else if (/YaBrowser|YaSearchBrowser/.test(ua)) browser = 'Yandex Browser';
  else if (/Whale\//.test(ua)) { const m = ua.match(/Whale\/([\d.]+)/); browser = `Naver Whale ${m?.[1] || ''}`; }
  else if (/UCWEB|UCBrowser/.test(ua)) browser = 'UC Browser';
  // Generic Chromium (before Chrome to catch headless/custom builds)
  else if (/Chromium\//.test(ua)) { const m = ua.match(/Chromium\/([\d.]+)/); browser = `Chromium ${m?.[1] || ''}`; }
  // Finally, fall back to Chrome for remaining Chromium-based browsers
  else if (/Chrome\/([\d.]+)/.test(ua)) { 
    const m = ua.match(/Chrome\/([\d.]+)/);
    const chromeVer = m?.[1] || '';
    browser = `Chrome ${chromeVer}`;
  }
  else if (/Safari\/([\d.]+)/.test(ua) && /Version\//.test(ua)) { const m = ua.match(/Version\/([\d.]+)/); browser = `Safari ${m?.[1] || ''}`; }
  return { os, browser };
}

async function runFingerprint() {
  const ua = navigator.userAgent;
  const { os, browser } = parseUA(ua);
  const variantInfo = detectChromiumVariant(ua);
  
  // Track all signals for uniqueness calculation
  const signals = {};

  // ─── IMMEDIATE / SYNCHRONOUS ────────────────────────────────────
  set('v-os', os);
  
  // Browser display: show exact name if confident, tentative language otherwise
  let browserDisplay = browser;
  if (ua.includes('Chrome') || ua.includes('Chromium')) {
    if (variantInfo.confidence >= 0.95) {
      // High confidence: show exact browser
      browserDisplay = variantInfo.variant;
    } else if (variantInfo.confidence >= 0.70) {
      // Medium confidence: use tentative language
      browserDisplay = `(likely ${variantInfo.variant})`;
    } else {
      // Low confidence: generic
      browserDisplay = '(Chromium variant — exact browser unclear)';
    }
  }
  set('v-browser', browserDisplay);
  
  set('v-screen',  `${screen.width} × ${screen.height} px  ·  ${window.devicePixelRatio}x DPI`);
  attachTooltip('v-screen', 'screen');
  
  // Enhanced language detection
  const lang = navigator.language + (navigator.languages?.length > 1 ? ` (${navigator.languages.join(', ')})` : '');
  set('v-lang', lang);
  set('v-langs', navigator.languages?.join(', ') || navigator.language);
  attachTooltip('v-langs', 'langs');
  signals.langs = navigator.languages?.length || 0;
  
  set('v-tz',      Intl.DateTimeFormat().resolvedOptions().timeZone);
  signals.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  set('v-cpu',     navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical cores` : 'Unavailable');
  attachTooltip('v-cpu', 'cpu');
  signals.cpu = navigator.hardwareConcurrency || 0;
  
  set('v-ram',     navigator.deviceMemory ? `≥ ${navigator.deviceMemory} GB` : 'Unavailable');
  attachTooltip('v-ram', 'ram');
  set('v-gpu',     getGPU());
  signals.gpu = getGPU();
  
  set('v-cookies', navigator.cookieEnabled ? 'Enabled' : 'Disabled', navigator.cookieEnabled ? 'val--warn' : 'val--good');
  set('v-storage', (() => { try { localStorage.setItem('_rk','1'); localStorage.removeItem('_rk'); return 'Available'; } catch { return 'Blocked'; } })());
  set('v-dnt',     navigator.doNotTrack === '1' ? 'Enabled ✓' : 'Disabled', navigator.doNotTrack === '1' ? 'val--good' : 'val--warn');
  attachTooltip('v-dnt', 'dnt');
  
  // Enhanced accessibility/media queries
  const a11yInfo = [];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) a11yInfo.push('reduced-motion');
  if (window.matchMedia('(prefers-contrast: more)').matches) a11yInfo.push('high-contrast');
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) a11yInfo.push('dark-mode');
  set('v-a11y', a11yInfo.length > 0 ? a11yInfo.join(', ') : 'Standard');
  attachTooltip('v-a11y', 'a11y');
  
  // Screen orientation
  const orientation = screen.orientation?.type || 'standard';
  set('v-orientation', `${orientation} · ${screen.orientation?.angle || '0'}°`);
  attachTooltip('v-orientation', 'orientation');
  
  set('v-touch',   navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : 'No');
  attachTooltip('v-touch', 'touch');
  signals.touch = navigator.maxTouchPoints > 0 ? 1 : 0;
  
  set('v-session', new Date().toLocaleString());

  // ─── CONNECTION INFO (ASYNC) ────────────────────────────────────
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    const type  = conn.effectiveType?.toUpperCase() || conn.type || 'Unknown';
    const speed = conn.downlink ? ` · ${conn.downlink} Mbps` : '';
    const rtt   = conn.rtt ? ` · ${conn.rtt}ms` : '';
    const save  = conn.saveData ? ' (data-saver)' : '';
    set('v-conn', `${type}${speed}${rtt}${save}`);
  } else {
    set('v-conn', 'Online (type unknown)');
  }

  // ─── BATTERY ────────────────────────────────────────────────────
  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      const pct   = Math.round(b.level * 100);
      const state = b.charging ? '⚡ Charging' : '🔋 Discharging';
      const cls   = b.level < 0.2 ? 'val--bad' : b.level < 0.5 ? 'val--warn' : 'val--good';
      set('v-battery', `${pct}% · ${state}`, cls);
    }).catch(() => set('v-battery', 'Unavailable'));
  } else {
    set('v-battery', 'API not available');
  }

  // ─── PLUGINS ────────────────────────────────────────────────────
  const plugins = Array.from(navigator.plugins || []).map(p => p.name).filter(Boolean);
  set('v-plugins', plugins.length ? plugins.slice(0, 4).join(', ') + (plugins.length > 4 ? ` +${plugins.length - 4} more` : '') : 'None detected');
  attachTooltip('v-plugins', 'plugins');
  signals.plugins = plugins.length;

  // ─── CANVAS FINGERPRINT ─────────────────────────────────────────
  const raw = getCanvasHash();
  hashStr(raw).then(hash => {
    if (raw === 'canvas blocked') {
      set('v-canvas', 'Protected by browser ✓', 'val--good');
    } else {
      set('v-canvas', hash, 'val--info');
    }
    attachTooltip('v-canvas', 'canvas');
    signals.canvas = true;
  });

  // ─── SCREEN INFO ────────────────────────────────────────────────
  signals.screen = `${screen.width}x${screen.height}`;

  // ─── FONT DETECTION ─────────────────────────────────────────────
  withTimeout(detectInstalledFonts(), 5000, { count: 0, hash: 'blocked', detected: [] }).then(fontResult => {
    if (fontResult.count === 0 && fontResult.hash === 'blocked') {
      set('v-fonts', 'Protected by browser ✓', 'val--good');
      set('v-fonts-hash', fontResult.hash, 'val--info');
    } else {
      set('v-fonts', `${fontResult.count} fonts detected`);
      set('v-fonts-hash', fontResult.hash, 'val--info');
    }
    attachTooltip('v-fonts', 'fonts');
    signals.fonts = fontResult.count;
  });

  // ─── WEBGL FINGERPRINT ──────────────────────────────────────────
  withTimeout(getWebGLFingerprint(), 4000, { vendor: 'Blocked', renderer: 'Blocked', hash: 'blocked', extensions: 0 }).then(webglResult => {
    const extDisplay = webglResult.extensions > 0 
      ? `${webglResult.hash} (${webglResult.extensions} ext.)`
      : webglResult.hash;
    if (webglResult.hash === 'blocked' && webglResult.vendor === 'Blocked') {
      set('v-webgl-hash', 'Protected by browser ✓', 'val--good');
    } else {
      set('v-webgl-hash', extDisplay, 'val--info');
    }
    attachTooltip('v-webgl-hash', 'webgl');
    signals.webgl = true;
  });

  // ─── AUDIO FINGERPRINT ──────────────────────────────────────────
  withTimeout(getAudioFingerprint(), 4000, { hash: 'blocked' }).then(audioResult => {
    if (!audioResult.hash || audioResult.hash === 'blocked') {
      set('v-audio', 'Protected by browser ✓', 'val--good');
    } else {
      set('v-audio', audioResult.hash, 'val--info');
    }
    attachTooltip('v-audio', 'audio');
    signals.audio = true;
  });

  // ─── WEBRTC (ENHANCED WITH LOCAL IPS) ──────────────────────────
  detectWebRTCDetailed().then(webrtcResult => {
    let displayText = '';
    let className = 'val--good';
    
    if (webrtcResult.leakDetected) {
      displayText = `🚨 Public IP leaked: ${webrtcResult.publicIP}`;
      className = 'val--bad';
      
      if (webrtcResult.localIPs.length > 0) {
        displayText += ` + local: ${webrtcResult.localIPs.join(', ')}`;
      }
    } else if (webrtcResult.localIPs.length > 0) {
      displayText = `Local: ${webrtcResult.localIPs.join(', ')}`;
      className = 'val--info';
      attachTooltip('v-webrtc-local', 'local-ip');
    } else {
      displayText = 'No leak detected ✓';
      className = 'val--good';
    }
    
    set('v-webrtc-local', displayText, className);
  });
  
  // Keep original WebRTC detection for backward compatibility
  detectWebRTC().then(ip => {
    if (ip && ip !== 'Not detected' && ip !== 'Blocked' && ip !== 'Blocked by browser') {
      set('v-webrtc', ip, 'val--bad');
      attachTooltip('v-webrtc', 'webrtc');
    } else {
      set('v-webrtc', ip || 'Not leaked', 'val--good');
    }
  });

  // ─── AD BLOCKER ──────────────────────────────────────────────────
  detectAdBlocker().then(blocked => {
    set('v-adblock', blocked ? 'Detected ✓' : 'Not detected', blocked ? 'val--good' : 'val--warn');
    attachTooltip('v-adblock', 'adblock');
  });

  // ─── IP GEOLOCATION ──────────────────────────────────────────────
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => {
      set('v-ip',  d.ip || '—', 'val--info');
      set('v-loc', `${d.city || '—'}, ${d.country_name || '—'}`);
      set('v-reg', `${d.region || '—'} · ${d.org?.split(' AS')[0] || ''}`);
      set('v-isp', d.org || '—');
      attachTooltip('v-ip', 'ip');
      attachTooltip('v-isp', 'isp');
      attachTooltip('v-loc', 'loc');
      
      // VPN detection heuristic
      const vpnWords = ['vpn','proxy','hosting','cloud','datacenter','digitalocean','linode','vultr','ovh','aws','azure','google'];
      const orgLower = (d.org || '').toLowerCase();
      const mightVpn = vpnWords.some(w => orgLower.includes(w));
      set('v-vpn', mightVpn ? 'Likely VPN / hosting IP' : 'No (looks residential)', mightVpn ? 'val--warn' : 'val--good');
      attachTooltip('v-vpn', 'vpn');
    })
    .catch(() => {
      fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => set('v-ip', d.ip || '—', 'val--info'))
        .catch(() => set('v-ip', 'Could not resolve'));
      ['v-loc','v-reg','v-isp','v-vpn'].forEach(id => set(id, 'Unavailable'));
    });

  // ─── CALCULATE & DISPLAY UNIQUENESS SCORE (AFTER SHORT DELAY) ────
  setTimeout(() => {
    const uniqueness = estimateUniquenessScore(signals);
    const scoreDisplay = document.getElementById('v-uniqueness-score');
    
    // Color code by risk level
    let riskClass = 'val--good';
    if (uniqueness.riskLevel === 'high') riskClass = 'val--bad';
    else if (uniqueness.riskLevel === 'medium') riskClass = 'val--warn';
    
    set('v-uniqueness-score', `${uniqueness.score}%`, riskClass);
    set('v-uniqueness-estimate', 
      `~1 in ${uniqueness.estimatedUnique.toLocaleString()} devices (${uniqueness.percentile}th percentile)${uniqueness.platformNote}`
    );
    
    // Save fingerprint snapshot for comparison
    currentFingerprint = {
      timestamp: new Date().toISOString(),
      score: uniqueness.score,
      entropybits: uniqueness.entropyBits,
      risk: uniqueness.riskLevel,
      signals: signals
    };
    saveFingerprintSnapshot(currentFingerprint);
    
    // Display risk breakdown
    displayRiskBreakdown();
  }, 2000);

  // ─── UPDATE CTA & COUNTER & ADD EXPORT BUTTON ────────────────────
  setTimeout(() => {
    const cta = document.getElementById('ctaBlock');
    const count = document.getElementById('ctaCaptured');
    count.textContent = '45+ DATA POINTS CAPTURED IN THIS SESSION';
    
    // Save to scan history
    const snapshot = {
      timestamp: new Date().toISOString(),
      signals: signals
    };
    saveScanSnapshot(snapshot);
    
    // Check for previous capture and offer re-scan
    const changed = detectChangedSignals();
    if (changed.length > 0) {
      count.textContent += ` · ${changed.length} values changed since last capture`;
    }
    
    // Show re-scan button if we have history
    if (scanHistory.length > 1) {
      const rescanBtn = document.getElementById('rescanBtn');
      if (rescanBtn) rescanBtn.style.display = 'flex';
    }
    
    // Add export button if not already present
    const ctaBtn = document.getElementById('ctaBtn');
    if (ctaBtn && !cta.querySelector('.cta-export')) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'cta-btn cta-export';
      exportBtn.innerHTML = '<span>⬇ Export</span><span class="cta-arrow">→</span>';
      exportBtn.onclick = exportFingerprintJSON;
      exportBtn.title = 'Download fingerprint as JSON';
      
      btnContainer.appendChild(exportBtn);
      
      // Add comparison button if previous exists
      if (previous) {
        const compareBtn = document.createElement('button');
        compareBtn.className = 'cta-btn cta-export';
        compareBtn.style.borderColor = 'var(--amber)';
        compareBtn.style.color = 'var(--amber)';
        compareBtn.innerHTML = '<span>🔄 Compare</span><span class="cta-arrow">→</span>';
        compareBtn.onclick = () => showToast('Reload page to capture fresh fingerprint and compare');
        compareBtn.title = 'Refresh to capture and compare new fingerprint';
        btnContainer.appendChild(compareBtn);
      }
      
      cta.insertBefore(btnContainer, cta.querySelector('.cta-sub'));
    }
    
    // Store current as previous for next run
    if (currentFingerprint) {
      try {
        localStorage.setItem('rk_fingerprint_previous', JSON.stringify(currentFingerprint));
      } catch {}
    }
    
    cta.classList.add('visible');
  }, 5000);
}

// Run scan + fingerprint on load
window.addEventListener('DOMContentLoaded', () => {
  loadScanHistory();
  runScan();
  runFingerprint();
  
  // Initialize tooltip engine after DOM is ready
  initTooltipEngine();
});

// ═══════════════════════════════════════════════════════════════
// TOOL RENDERERS
// ═══════════════════════════════════════════════════════════════
const TOOL_RENDERERS = {

  // ── IP LOOKUP ──────────────────────────────────────────────
  ip(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">IP Address</label>
          <input class="tool-input" id="t-ip" placeholder="e.g. 8.8.8.8" type="text">
        </div>
        <button class="btn-primary" onclick="runIPLookup()">Run Lookup</button>
      </div>
      <button class="btn-secondary" style="width:100%;margin-bottom:16px" onclick="
        document.getElementById('t-ip').value=document.getElementById('v-ip').textContent;
        runIPLookup();">
        ◉ Use my current IP
      </button>
      <div id="ip-result"></div>`;
  },

  // ── DOMAIN / WHOIS ─────────────────────────────────────────
  domain(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">Domain Name</label>
          <input class="tool-input" id="t-domain" placeholder="e.g. google.com" type="text">
        </div>
        <button class="btn-primary" onclick="runWhois()">Run WHOIS</button>
      </div>
      <div id="domain-result"></div>`;
  },

  // ── DNS RECORDS ────────────────────────────────────────────
  dns(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">Domain Name</label>
          <input class="tool-input" id="t-dns" placeholder="e.g. example.com" type="text">
        </div>
        <div>
          <label class="tool-label">Record Type</label>
          <select class="tool-select" id="t-dns-type">
            <option value="dns">All (A, MX, NS, TXT)</option>
            <option value="hostsearch">Subdomain Discovery</option>
            <option value="reverseiplookup">Reverse IP</option>
          </select>
        </div>
        <button class="btn-primary" onclick="runDNS()">Lookup</button>
      </div>
      <div id="dns-result"></div>`;
  },

  // ── SSL CHECKER ────────────────────────────────────────────
  ssl(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">Domain Name</label>
          <input class="tool-input" id="t-ssl" placeholder="e.g. github.com" type="text">
        </div>
        <button class="btn-primary" onclick="runSSL()">Check Certificate</button>
      </div>
      <div id="ssl-result"></div>`;
  },

  // ── HTTP HEADERS ───────────────────────────────────────────
  headers(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">URL or Domain</label>
          <input class="tool-input" id="t-headers" placeholder="e.g. https://example.com" type="text">
        </div>
        <button class="btn-primary" onclick="runHeaders()">Fetch Headers</button>
      </div>
      <div id="headers-result"></div>`;
  },

  // ── BREACH CHECK ───────────────────────────────────────────
  breach(body) {
    const hasKey = !!KEYS.hibp;
    body.innerHTML = `
      ${!hasKey ? `<div class="tool-note">
        HIBP API requires a key (~$3.50/month). 
        <a href="#" onclick="openSettings(); return false;">Add your key in Settings ↗</a><br><br>
        <strong>Free alternative:</strong> Check manually at 
        <a href="https://haveibeenpwned.com" target="_blank" rel="noopener">haveibeenpwned.com ↗</a>
      </div>` : ''}
      <div class="tool-form">
        <div>
          <label class="tool-label">Email Address</label>
          <input class="tool-input" id="t-breach" placeholder="you@example.com" type="email">
        </div>
        <button class="btn-primary" ${!hasKey ? 'disabled' : ''} onclick="runBreach()">${hasKey ? 'Check Breaches' : 'API Key Required'}</button>
      </div>
      <div style="margin-top:8px">
        <a class="btn-secondary" href="https://haveibeenpwned.com" target="_blank" rel="noopener" style="display:block;text-align:center;padding:10px;text-decoration:none;">
          Open HaveIBeenPwned.com ↗
        </a>
      </div>
      <div id="breach-result"></div>`;
  },

  // ── USERNAME SEARCH ─────────────────────────────────────────
  username(body) {
    body.innerHTML = `
      <div class="tool-form">
        <div>
          <label class="tool-label">Username</label>
          <input class="tool-input" id="t-username" placeholder="e.g. johndoe" type="text">
        </div>
        <button class="btn-primary" onclick="runUsername()">Search Platforms</button>
      </div>
      <div id="username-result"></div>`;
  },

  // ── UTILITIES ───────────────────────────────────────────────
  utils(body) {
    body.innerHTML = `
      <div class="utils-tabs">
        <button class="util-tab active" onclick="switchUtil('password', this)">Password Gen</button>
        <button class="util-tab" onclick="switchUtil('hash', this)">Hash Generator</button>
        <button class="util-tab" onclick="switchUtil('base64', this)">Base64</button>
        <button class="util-tab" onclick="switchUtil('url', this)">URL Encode</button>
        <button class="util-tab" onclick="switchUtil('cidr', this)">CIDR Calc</button>
        <button class="util-tab" onclick="switchUtil('jwt', this)">JWT Decoder</button>
        <button class="util-tab" onclick="switchUtil('ipconv', this)">IP Convert</button>
        <button class="util-tab" onclick="switchUtil('regex', this)">Regex Test</button>
      </div>

      <!-- PASSWORD GENERATOR -->
      <div class="util-section active" id="util-password">
        <div class="pw-output" id="pw-output">Click Generate</div>
        <div class="strength-bar"><div class="strength-fill" id="pw-strength"></div></div>
        <p style="font-size:10px;color:var(--text-muted);margin:6px 0 14px;text-align:right" id="pw-strength-label">—</p>
        <div class="pw-options">
          <div class="pw-option">
            <label>Length: <strong id="pw-len-val">16</strong></label>
            <input type="range" id="pw-len" min="8" max="64" value="16" style="width:140px">
          </div>
          <div class="pw-option">
            <label>Uppercase (A-Z)</label>
            <input type="checkbox" id="pw-upper" checked>
          </div>
          <div class="pw-option">
            <label>Numbers (0-9)</label>
            <input type="checkbox" id="pw-num" checked>
          </div>
          <div class="pw-option">
            <label>Symbols (!@#$...)</label>
            <input type="checkbox" id="pw-sym" checked>
          </div>
          <div class="pw-option">
            <label>Exclude ambiguous (0,O,l,1)</label>
            <input type="checkbox" id="pw-amb">
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-primary" style="flex:1" onclick="generatePassword()">Generate</button>
          <button class="btn-secondary" onclick="copyText(document.getElementById('pw-output').textContent, this)">COPY</button>
        </div>
      </div>

      <!-- HASH GENERATOR -->
      <div class="util-section" id="util-hash">
        <div class="hash-tabs">
          <button class="hash-tab active" onclick="setHashAlgo('SHA-256', this)">SHA-256</button>
          <button class="hash-tab" onclick="setHashAlgo('SHA-1', this)">SHA-1</button>
          <button class="hash-tab" onclick="setHashAlgo('SHA-512', this)">SHA-512</button>
          <button class="hash-tab" onclick="setHashAlgo('MD5', this)">MD5*</button>
        </div>
        <label class="tool-label">Input Text</label>
        <textarea class="tool-input" id="hash-input" rows="4" placeholder="Enter text to hash..." style="resize:vertical"
          oninput="autoHash()"></textarea>
        <div class="hash-output" id="hash-output">—</div>
        <button class="copy-btn" onclick="copyText(document.getElementById('hash-output').textContent, this)">COPY</button>
        <p style="font-size:10px;color:var(--text-dim);margin-top:8px">* MD5 is not cryptographically secure — for reference only.</p>
      </div>

      <!-- BASE64 -->
      <div class="util-section" id="util-base64">
        <label class="tool-label">Input</label>
        <textarea class="tool-input" id="b64-input" rows="5" placeholder="Text or Base64 to encode/decode..." style="resize:vertical"></textarea>
        <div style="display:flex;gap:8px;margin:10px 0">
          <button class="btn-primary" style="flex:1" onclick="doBase64('encode')">Encode →</button>
          <button class="btn-primary" style="flex:1" onclick="doBase64('decode')">← Decode</button>
        </div>
        <label class="tool-label">Output</label>
        <div class="hash-output" id="b64-output">—</div>
        <button class="copy-btn" onclick="copyText(document.getElementById('b64-output').textContent, this)">COPY</button>
      </div>

      <!-- URL ENCODE -->
      <div class="util-section" id="util-url">
        <label class="tool-label">Input</label>
        <textarea class="tool-input" id="url-input" rows="5" placeholder="URL or encoded string..." style="resize:vertical"></textarea>
        <div style="display:flex;gap:8px;margin:10px 0">
          <button class="btn-primary" style="flex:1" onclick="doURL('encode')">Encode →</button>
          <button class="btn-primary" style="flex:1" onclick="doURL('decode')">← Decode</button>
        </div>
        <label class="tool-label">Output</label>
        <div class="hash-output" id="url-output">—</div>
        <button class="copy-btn" onclick="copyText(document.getElementById('url-output').textContent, this)">COPY</button>
      </div>

      <!-- CIDR CALCULATOR -->
      <div class="util-section" id="util-cidr">
        <label class="tool-label">CIDR Notation</label>
        <input class="tool-input" id="cidr-input" placeholder="e.g. 192.168.1.0/24" type="text">
        <button class="btn-primary" style="margin-top:10px" onclick="calcCIDR()">Calculate</button>
        <div id="cidr-result" style="margin-top:16px"></div>
      </div>

      <!-- IP CONVERTER -->
      <div class="util-section" id="util-ipconv">
        <label class="tool-label">IPv4 Address</label>
        <input class="tool-input" id="ip-conv-input" placeholder="e.g. 192.168.1.1" type="text" oninput="convertIPTool()">
        <div id="ip-conv-result" style="margin-top:12px"></div>
      </div>

      <!-- REGEX TESTER -->
      <div class="util-section" id="util-regex">
        <label class="tool-label">Pattern</label>
        <input class="tool-input" id="regex-pattern" placeholder="e.g. ^[a-zA-Z0-9]+$" type="text" oninput="testRegexTool()">
        <label class="tool-label" style="margin-top:10px">Flags</label>
        <input class="tool-input" id="regex-flags" placeholder="e.g. 'g' (global), 'i' (case-insensitive)" type="text" value="g" oninput="testRegexTool()">
        <label class="tool-label" style="margin-top:10px">Test String</label>
        <textarea class="tool-input" id="regex-text" rows="4" placeholder="Text to test..." style="resize:vertical" oninput="testRegexTool()"></textarea>
        <div id="regex-result" style="margin-top:12px"></div>
      </div>

      <!-- JWT DECODER -->
      <div class="util-section" id="util-jwt">
        <label class="tool-label">Paste JWT Token</label>
        <textarea class="tool-input" id="jwt-input" rows="5" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="resize:vertical;font-size:11px" oninput="decodeJWT()"></textarea>
        <div id="jwt-result" style="margin-top:12px"></div>
        <p style="font-size:10px;color:var(--text-dim);margin-top:8px">⚠ Never paste production tokens into online tools. This decoder runs entirely in your browser — nothing is sent anywhere.</p>
      </div>
    `;

    // Initialize password slider
    document.getElementById('pw-len').addEventListener('input', function() {
      document.getElementById('pw-len-val').textContent = this.value;
    });
    generatePassword();
  },

  // ── LEARN & PROTECT ─────────────────────────────────────────
  learn(body) {
    body.innerHTML = `
      <div class="learn-nav">
        <button class="learn-nav-item active" onclick="showLearn('protect', this)">🛡 How to Protect Yourself</button>
        <button class="learn-nav-item" onclick="showLearn('tracking', this)">👁 How Websites Track You</button>
        <button class="learn-nav-item" onclick="showLearn('vpn', this)">🔒 VPNs Explained</button>
        <button class="learn-nav-item" onclick="showLearn('attacks', this)">⚠ Common Attack Types</button>
        <button class="learn-nav-item" onclick="showLearn('passwords', this)">🔑 Password Security</button>
        <button class="learn-nav-item" onclick="showLearn('glossary', this)">📖 Security Glossary</button>
      </div>
      <div id="learn-container">${LEARN_CONTENT.protect}</div>
    `;
  },
};

// ─── TOOL FUNCTIONS ───────────────────────────────────────────

// ─── PHASE 2: IP LOOKUP ENHANCEMENTS ────────────────────────────
// Reverse DNS lookup helper
async function reverseIPLookup(ip) {
  try {
    const data = await fetch(`https://api.hackertarget.com/reversedns/?q=${ip}`).then(r => r.text());
    if (data.includes('error') || data.includes('API count exceeded')) return null;
    const lines = data.split('\n').filter(l => l.trim());
    return lines.slice(0, 3); // Return top 3 reverse DNS entries
  } catch { return null; }
}

// Threat assessment based on abuse score + other signals
function assessThreat(abuseScore, vpnLikely, isDatacenter) {
  if (abuseScore >= 75) return { level: 'CRITICAL', color: 'var(--red)', msg: 'Highly malicious — confirmed attack source' };
  if (abuseScore >= 50) return { level: 'HIGH', color: 'var(--red)', msg: 'Likely malicious — frequent abuse reports' };
  if (abuseScore >= 25) return { level: 'MEDIUM', color: 'var(--amber)', msg: 'Suspicious — some abuse history' };
  if (vpnLikely && abuseScore >= 10) return { level: 'CAUTION', color: 'var(--amber)', msg: 'VPN/Proxy detected with minor abuse' };
  if (vpnLikely) return { level: 'PRIVACY', color: 'var(--cyan)', msg: 'VPN/Proxy service — privacy tool' };
  if (isDatacenter) return { level: 'CLOUD', color: 'var(--cyan)', msg: 'Cloud infrastructure — likely legitimate' };
  return { level: 'CLEAN', color: 'var(--green)', msg: 'No abuse reports — appears legitimate' };
}

async function runIPLookup() {
  const ip = document.getElementById('t-ip').value.trim();
  const res = document.getElementById('ip-result');
  if (!ip) { res.innerHTML = '<div class="tool-error">Enter an IP address</div>'; return; }
  res.innerHTML = '<div class="tool-loading">QUERYING IP INTELLIGENCE</div>';

  try {
    const d = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
    if (d.error) throw new Error(d.reason);

    const vpnWords = ['vpn','proxy','hosting','cloud','datacenter','digitalocenter','digitalocean','linode','vultr','aws','azure','gcp','ovh','hetzner'];
    const mightVpn = vpnWords.some(w => (d.org||'').toLowerCase().includes(w));
    const isDatacenter = ['aws','azure','gcp','digitalocean','linode','ovh','hetzner'].some(w => (d.org||'').toLowerCase().includes(w));

    // Get abuse score
    let abuseScore = 0;
    let abuseHTML = '';
    if (KEYS.abuseipdb) {
      try {
        const abuse = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
          headers: { 'Key': KEYS.abuseipdb, 'Accept': 'application/json' }
        }).then(r => r.json());
        abuseScore = abuse.data?.abuseConfidenceScore || 0;
        abuseHTML = `<div class="result-row"><span class="result-key">Abuse Score</span><span class="result-val ${abuseScore > 50 ? 'bad' : abuseScore > 10 ? 'warn' : 'good'}">${abuseScore}% confidence</span></div>`;
      } catch {}
    }

    // Assess threat level
    const threat = assessThreat(abuseScore, mightVpn, isDatacenter);

    // Get reverse DNS
    const rdnsEntries = await reverseIPLookup(ip);
    const rdnsHTML = rdnsEntries && rdnsEntries.length > 0 
      ? `<div class="result-row"><span class="result-key">Reverse DNS</span><span class="result-val" style="font-size:11px">${rdnsEntries.join('<br>')}</span></div>`
      : '';

    // Build OpenStreetMap embed
    const mapEmbed = `<div style="margin-top:12px;border-radius:4px;overflow:hidden;height:200px"><iframe width="100%" height="100%" style="border:none" src="https://maps.openstreetmap.org/export/embed.html?bbox=${d.longitude-0.2},${d.latitude-0.2},${d.longitude+0.2},${d.latitude+0.2}&layer=mapnik&marker=${d.latitude},${d.longitude}" loading="lazy"></iframe></div>`;

    res.innerHTML = `
      <div class="result-section" style="padding:12px;background:${threat.color}22;border-left:4px solid ${threat.color};border-radius:4px;margin-bottom:12px">
        <div style="font-weight:700;color:${threat.color};margin-bottom:4px">Threat Assessment: ${threat.level}</div>
        <div style="font-size:12px;color:var(--text)">${threat.msg}</div>
      </div>

      <div class="result-section">
        <div class="result-label">Network</div>
        <div class="result-row"><span class="result-key">IP Address</span><span class="result-val good">${d.ip}</span></div>
        <div class="result-row"><span class="result-key">ISP / Org</span><span class="result-val">${d.org || '—'}</span></div>
        <div class="result-row"><span class="result-key">ASN</span><span class="result-val">${d.asn || '—'}</span></div>
        <div class="result-row"><span class="result-key">Type</span><span class="result-val ${isDatacenter ? 'warn' : mightVpn ? 'warn' : 'good'}">${isDatacenter ? 'Datacenter' : mightVpn ? 'VPN/Proxy' : 'Residential'}</span></div>
        ${abuseHTML}
        ${rdnsHTML}
      </div>

      <div class="result-section">
        <div class="result-label">Location</div>
        <div class="result-row"><span class="result-key">Country</span><span class="result-val">${d.country_name} (${d.country_code})</span></div>
        <div class="result-row"><span class="result-key">Region</span><span class="result-val">${d.region || '—'}</span></div>
        <div class="result-row"><span class="result-key">City</span><span class="result-val">${d.city || '—'}</span></div>
        <div class="result-row"><span class="result-key">Postal Code</span><span class="result-val">${d.postal || '—'}</span></div>
        <div class="result-row"><span class="result-key">Coordinates</span><span class="result-val" style="font-family:var(--font-mono);font-size:11px">${d.latitude}, ${d.longitude}</span></div>
        <div class="result-row"><span class="result-key">Timezone</span><span class="result-val">${d.timezone || '—'}</span></div>
        <div class="result-row"><span class="result-key">Currency</span><span class="result-val">${d.currency_name || '—'} (${d.currency || '—'})</span></div>
      </div>

      <div class="result-section">
        <div class="result-label">Map (OpenStreetMap)</div>
        ${mapEmbed}
      </div>

      ${!KEYS.abuseipdb ? '<div class="tool-note">Add your AbuseIPDB key in Settings for detailed threat intelligence.</div>' : ''}
    `;
  } catch(e) {
    res.innerHTML = `<div class="tool-error">Error: ${e.message}</div>`;
  }
}

// PHASE 2: Parse WHOIS data for key fields
function parseWhoisData(whoisText) {
  const data = {
    registrar: null, registrant: null, admin: null, tech: null,
    created: null, updated: null, expires: null, status: null,
    nameservers: [], mx: [], registryOperator: null
  };
  
  const lines = whoisText.split('\n');
  for (const line of lines) {
    const [key, ...valArr] = line.split(':');
    const val = valArr.join(':').trim();
    if (!val) continue;
    
    const k = key.trim().toLowerCase();
    if (k.includes('registrar') && !k.includes('admin')) data.registrar = val;
    if (k.includes('registrant') && !k.includes('organization')) data.registrant = val;
    if (k.includes('admin') && k.includes('name')) data.admin = val;
    if (k.includes('tech') && k.includes('name')) data.tech = val;
    if (k.includes('created') || k.includes('creation')) data.created = val;
    if (k.includes('updated') || k.includes('modified')) data.updated = val;
    if (k.includes('expires') || k.includes('expir')) data.expires = val;
    if (k.includes('status')) data.status = val;
    if (k.includes('nameserver') || k.includes('ns')) data.nameservers.push(val);
    if (k.includes('registry operator')) data.registryOperator = val;
  }
  
  return data;
}

async function fetchNameserversAndMX(domain) {
  try {
    const ns = await fetch(`https://api.hackertarget.com/mxsearch/?q=${domain}`).then(r => r.text());
    return { ns: ns.split('\n').filter(l => l.trim()), error: false };
  } catch { return { ns: [], error: true }; }
}

async function runWhois() {
  const domain = document.getElementById('t-domain').value.trim().replace(/^https?:\/\//,'').split('/')[0];
  const res = document.getElementById('domain-result');
  if (!domain) { res.innerHTML = '<div class="tool-error">Enter a domain</div>'; return; }
  res.innerHTML = '<div class="tool-loading">QUERYING DOMAIN INTELLIGENCE</div>';
  
  try {
    const whoisData = await fetch(`https://api.hackertarget.com/whois/?q=${domain}`).then(r => r.text());
    if (whoisData.includes('API count exceeded')) throw new Error('HackerTarget daily limit reached. Try again tomorrow.');

    // Parse WHOIS
    const parsed = parseWhoisData(whoisData);
    
    // Get nameservers & MX  
    const nsData = await fetchNameserversAndMX(domain);

    // Build enhanced output
    let html = `<div class="result-section">
      <div class="result-label">Domain Registry — ${domain}</div>`;

    if (parsed.registrar) html += `<div class="result-row"><span class="result-key">Registrar</span><span class="result-val">${parsed.registrar}</span></div>`;
    if (parsed.created) html += `<div class="result-row"><span class="result-key">Created</span><span class="result-val">${parsed.created}</span></div>`;
    if (parsed.updated) html += `<div class="result-row"><span class="result-key">Last Updated</span><span class="result-val">${parsed.updated}</span></div>`;
    if (parsed.expires) html += `<div class="result-row"><span class="result-key">Expires</span><span class="result-val">${parsed.expires}</span></div>`;
    if (parsed.status) html += `<div class="result-row"><span class="result-key">Status</span><span class="result-val">${parsed.status}</span></div>`;
    
    html += '</div>';

    // Registrant info
    if (parsed.registrant || parsed.admin || parsed.tech) {
      html += `<div class="result-section">
        <div class="result-label">Registrant & Contacts</div>
        ${parsed.registrant ? `<div class="result-row"><span class="result-key">Registrant Org</span><span class="result-val">${parsed.registrant}</span></div>` : ''}
        ${parsed.admin ? `<div class="result-row"><span class="result-key">Admin Contact</span><span class="result-val">${parsed.admin}</span></div>` : ''}
        ${parsed.tech ? `<div class="result-row"><span class="result-key">Tech Contact</span><span class="result-val">${parsed.tech}</span></div>` : ''}
      </div>`;
    }

    // Nameservers
    if (parsed.nameservers.length > 0 || nsData.ns.length > 0) {
      const ns = parsed.nameservers.length > 0 ? parsed.nameservers : nsData.ns;
      html += `<div class="result-section">
        <div class="result-label">Nameservers (${ns.length})</div>
        <div style="font-size:11px">`;
      ns.forEach(n => html += `<div style="padding:4px;font-family:var(--font-mono);word-break:break-all">${escapeHTML(n)}</div>`);
      html += `</div></div>`;
    }

    // Mail Servers
    if (nsData.ns.length > 0 && parsed.nameservers.length > 0) {
      html += `<div class="result-section">
        <div class="result-label">Mail Servers (MX Records)</div>
        <div style="font-size:11px">`;
      nsData.ns.forEach(n => html += `<div style="padding:4px;font-family:var(--font-mono);word-break:break-all">${escapeHTML(n)}</div>`);
      html += `</div></div>`;
    }

    // Full WHOIS
    html += `<div class="result-section">
      <div class="result-label">Full WHOIS Record</div>
      <pre class="tool-result" style="max-height:300px;overflow-y:auto">${escapeHTML(whoisData)}</pre>
    </div>`;

    res.innerHTML = html;
  } catch(e) {
    res.innerHTML = `<div class="tool-error">${e.message}</div>`;
  }
}

// ─── PHASE 1: DNS EMAIL SECURITY PARSING ───────────────────
function parseEmailSecurityRecords(dnsText) {
  const records = {
    spf: null,
    dkim: [],
    dmarc: null,
  };

  const lines = dnsText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('v=spf1')) {
      records.spf = trimmed;
    }
    if (trimmed.includes('v=DKIM1')) {
      records.dkim.push(trimmed);
    }
    if (trimmed.includes('v=DMARC1')) {
      records.dmarc = trimmed;
    }
  }

  return records;
}

function assessSPF(spfRecord) {
  if (!spfRecord) return { status: 'MISSING', color: 'red', desc: 'No SPF record found' };

  const hasHardFail = spfRecord.includes('-all');
  const hasSoftFail = spfRecord.includes('~all');
  const hasAllows = spfRecord.includes('+');
  const numMechanisms = (spfRecord.match(/\s(ip4|ip6|a|mx|ptr|include)/g) || []).length;

  if (hasHardFail && numMechanisms >= 1) {
    return { status: 'STRONG', color: 'green', desc: 'Hard fail enabled with authenticated senders' };
  } else if (hasSoftFail || hasHardFail) {
    return { status: 'GOOD', color: 'green', desc: 'Fail policy set — prevents some spoofing' };
  } else if (spfRecord.includes('~all')) {
    return { status: 'WEAK', color: 'amber', desc: 'Soft fail only — allows suspicious mail through' };
  } else {
    return { status: 'MISSING', color: 'red', desc: 'No fail policy — allows anyone to send mail' };
  }
}

function assessDKIM(dkimRecords) {
  const count = dkimRecords.length;
  if (count === 0) return { status: 'MISSING', color: 'red', desc: 'No DKIM records found', count: 0 };
  if (count === 1) return { status: 'PRESENT', color: 'amber', desc: 'Single selector detected', count: 1 };
  return { status: 'STRONG', color: 'green', desc: `${count} DKIM selectors for key rotation`, count };
}

function assessDMARC(dmarcRecord) {
  if (!dmarcRecord) return { status: 'MISSING', color: 'red', desc: 'No DMARC policy found', policy: 'none' };

  const policyMatch = dmarcRecord.match(/p=([a-z]+)/);
  const policy = policyMatch ? policyMatch[1] : 'none';
  const hasRua = dmarcRecord.includes('rua=');
  const hasRuf = dmarcRecord.includes('ruf=');
  const pct = dmarcRecord.match(/pct=(\d+)/);
  const pctVal = pct ? parseInt(pct[1]) : 100;

  if (policy === 'reject') {
    return { status: 'PROTECT', color: 'green', desc: 'Strict policy — rejects unauthenticated mail', policy };
  } else if (policy === 'quarantine') {
    return { status: 'GUARD', color: 'amber', desc: 'Quarantine policy — warns on unauthenticated mail', policy };
  } else {
    return { status: 'REPORT', color: 'red', desc: 'Monitor-only policy — allows unauthenticated mail', policy };
  }
}

async function runDNS() {
  const domain = document.getElementById('t-dns').value.trim().replace(/^https?:\/\//,'').split('/')[0];
  const type   = document.getElementById('t-dns-type').value;
  const res    = document.getElementById('dns-result');
  if (!domain) { res.innerHTML = '<div class="tool-error">Enter a domain</div>'; return; }

  const labels = { dns: 'DNS Records', hostsearch: 'Subdomains Found', reverseiplookup: 'Reverse IP Lookup' };
  res.innerHTML = `<div class="tool-loading">QUERYING ${labels[type].toUpperCase()}</div>`;
  try {
    const data = await fetch(`https://api.hackertarget.com/${type}/?q=${domain}`).then(r => r.text());
    if (data.includes('API count exceeded')) throw new Error('HackerTarget daily limit reached.');
    if (data.includes('error') && data.length < 100) throw new Error(data);

    // Parse email security records if this is a DNS query
    if (type === 'dns') {
      const emailRecords = parseEmailSecurityRecords(data);
      const spfAssess = assessSPF(emailRecords.spf);
      const dkimAssess = assessDKIM(emailRecords.dkim);
      const dmarcAssess = assessDMARC(emailRecords.dmarc);

      let emailSecurityHTML = '<div class="result-label" style="margin-bottom:12px">Email Security Records</div>';

      // SPF Card
      emailSecurityHTML += `
        <div style="padding:12px;border-left:4px solid ${spfAssess.color};background:rgba(0,0,0,0.2);margin-bottom:10px;border-radius:4px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-weight:700;color:var(--text-bright)">SPF (Sender Policy Framework)</div>
            <div style="color:${spfAssess.color};font-weight:700;font-size:11px;letter-spacing:1px">${spfAssess.status}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">${spfAssess.desc}</div>
          ${emailRecords.spf ? `<div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);word-break:break-all;padding:6px;background:rgba(0,0,0,0.3);border-radius:2px">${escapeHTML(emailRecords.spf)}</div>` : ''}
        </div>
      `;

      // DKIM Card
      emailSecurityHTML += `
        <div style="padding:12px;border-left:4px solid ${dkimAssess.color};background:rgba(0,0,0,0.2);margin-bottom:10px;border-radius:4px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-weight:700;color:var(--text-bright)">DKIM (DomainKeys Identified Mail)</div>
            <div style="color:${dkimAssess.color};font-weight:700;font-size:11px;letter-spacing:1px">${dkimAssess.status}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">${dkimAssess.desc}</div>
          ${dkimAssess.count > 0 ? `<div style="font-size:10px;color:var(--text-dim)">${dkimAssess.count} ${dkimAssess.count === 1 ? 'selector' : 'selectors'} found</div>` : ''}
        </div>
      `;

      // DMARC Card
      emailSecurityHTML += `
        <div style="padding:12px;border-left:4px solid ${dmarcAssess.color};background:rgba(0,0,0,0.2);margin-bottom:10px;border-radius:4px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-weight:700;color:var(--text-bright)">DMARC (Domain-based Message Authentication)</div>
            <div style="color:${dmarcAssess.color};font-weight:700;font-size:11px;letter-spacing:1px">${dmarcAssess.status}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">${dmarcAssess.desc}</div>
          <div style="font-size:10px;color:var(--text-dim)">Policy: <strong>${dmarcAssess.policy.toUpperCase()}</strong></div>
          ${emailRecords.dmarc ? `<div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);word-break:break-all;padding:6px;background:rgba(0,0,0,0.3);border-radius:2px;margin-top:6px">${escapeHTML(emailRecords.dmarc)}</div>` : ''}
        </div>
      `;

      // Assessment Summary
      const strongCount = [spfAssess, dkimAssess, dmarcAssess].filter(a => a.color === 'green').length;
      const weakCount = [spfAssess, dkimAssess, dmarcAssess].filter(a => a.color !== 'green').length;

      emailSecurityHTML += `
        <div style="padding:12px;background:var(--surface);border-radius:4px;margin-bottom:12px">
          <div style="font-weight:700;margin-bottom:6px">Email Infrastructure Grade</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
            <div>✓ Strong protections: <strong style="color:var(--green)">${strongCount}/3</strong></div>
            <div>⚠ Gaps in protection: <strong style="color:var(--amber)">${weakCount}/3</strong></div>
          </div>
        </div>
      `;

      // Raw DNS Output
      emailSecurityHTML += `<div class="result-label" style="margin-top:16px">Full DNS Output</div><pre class="tool-result">${escapeHTML(data)}</pre>`;
      res.innerHTML = `<div class="result-label">${labels[type]} — ${domain}</div>` + emailSecurityHTML;
    } else {
      res.innerHTML = `<div class="result-label">${labels[type]} — ${domain}</div><pre class="tool-result">${escapeHTML(data)}</pre>`;
    }
  } catch(e) {
    res.innerHTML = `<div class="tool-error">${e.message}</div>`;
  }

}

// PHASE 2: Enhanced SSL with certificate chain and TLS analysis
async function runSSL() {
  const domain = document.getElementById('t-ssl').value.trim().replace(/^https?:\/\//,'').split('/')[0];
  const res    = document.getElementById('ssl-result');
  if (!domain) { res.innerHTML = '<div class="tool-error">Enter a domain</div>'; return; }
  res.innerHTML = '<div class="tool-loading">QUERYING CERTIFICATE & TLS INFO</div>';
  
  try {
    // Get certificate transparency logs
    const certs = await fetch(`https://crt.sh/?q=${domain}&output=json`).then(r => r.json());
    
    // Analyze for certificate issues
    let criticalIssues = 0, warnings = 0;
    const seen = new Set();
    const unique = certs.filter(c => {
      const key = c.common_name + c.issuer_name;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).slice(0, 15);

    // Identify certificate issues
    let issueHTML = '';
    for (const cert of unique) {
      const expiry = new Date(cert.not_after);
      const expired = expiry < new Date();
      const daysLeft = Math.round((expiry - new Date()) / 86400000);
      
      if (expired) {
        criticalIssues++;
        issueHTML += `<div style="background:var(--red-dim);border-left:4px solid var(--red);padding:8px;margin:6px 0;border-radius:2px;font-size:11px">🚨 CRITICAL: Certificate expired (${expiry.toLocaleDateString()})</div>`;
      } else if (daysLeft < 30) {
        warnings++;
        issueHTML += `<div style="background:var(--amber-dim);border-left:4px solid var(--amber);padding:8px;margin:6px 0;border-radius:2px;font-size:11px">⚠ WARNING: Certificate expires in ${daysLeft} days</div>`;
      }
    }

    // SSL/TLS Grade
    let grade = 'A', gradeClass = 'var(--green)';
    if (criticalIssues > 0) { grade = 'F'; gradeClass = 'var(--red)'; }
    else if (warnings > 0) { grade = 'C'; gradeClass = 'var(--amber)'; }

    let html = `
      <div class="result-section" style="background:${gradeClass}22;border-left:4px solid ${gradeClass};padding:12px;border-radius:4px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:${gradeClass};margin-bottom:4px">TLS/SSL GRADE: ${grade}</div>
            <div style="font-size:11px;color:var(--text-muted)">${certs.length} certificates found | ${criticalIssues} critical issue${criticalIssues !== 1 ? 's' : ''} | ${warnings} warning${warnings !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
      
      ${issueHTML ? `<div class="result-section"><div class="result-label">Issues Detected</div>${issueHTML}</div>` : ''}
      
      <div class="result-section">
        <div class="result-label">Certificate Chain (${unique.length} showed)</div>
        ${unique.map((c, i) => {
          const expiry = new Date(c.not_after);
          const expired = expiry < new Date();
          const daysLeft = Math.round((expiry - new Date()) / 86400000);
          const isRoot = c.issuer_name === c.common_name;
          return `
            <div style="padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:3px;margin-bottom:8px">
              <div style="font-weight:600;margin-bottom:6px;display:flex;justify-content:space-between">
                <span>Certificate #${i+1}</span>
                <span style="font-size:10px;font-weight:400;color:var(--text-muted)">${isRoot ? 'ROOT CA' : 'INTERMEDIATE CA'}</span>
              </div>
              <div class="result-row"><span class="result-key">CN</span><span class="result-val" style="font-size:10px;font-family:var(--font-mono);word-break:break-all">${c.common_name}</span></div>
              <div class="result-row"><span class="result-key">Issuer</span><span class="result-val">${c.issuer_name?.split(',')[0] || '—'}</span></div>
              <div class="result-row"><span class="result-key">Expires</span><span class="result-val ${expired ? 'bad' : daysLeft < 30 ? 'warn' : 'good'}">${expiry.toLocaleDateString()} ${expired ? '🚨 EXPIRED' : `✓ ${daysLeft}d left`}</span></div>
              <div class="result-row"><span class="result-key">Logged</span><span class="result-val">${new Date(c.entry_timestamp).toLocaleDateString()}</span></div>
            </div>`;
        }).join('')}
      </div>
    `;

    res.innerHTML = html;
  } catch(e) {
    res.innerHTML = `<div class="tool-error">Error: ${e.message}</div>`;
  }
}

// PHASE 2: Enhanced CSP analysis
function analyzeCSP(cspHeader) {
  if (!cspHeader) return { issues: [], safe: false };
  
  const issues = [];
  const directives = cspHeader.split(';').map(d => d.trim()).filter(Boolean);
  
  // Check for unsafe directives
  if (cspHeader.includes("'unsafe-inline'")) issues.push("🚨 unsafe-inline allows inline scripts — high XSS risk");
  if (cspHeader.includes("'unsafe-eval'")) issues.push("🚨 unsafe-eval allows eval() — enables code injection");
  if (cspHeader.includes("*")) issues.push("⚠ Wildcard (*) without restrictions — allows any source");
  if (!cspHeader.includes("default-src") && !cspHeader.includes("script-src")) 
    issues.push("⚠ No script-src or default-src — may allow any script");
  
  const isSafe = issues.length === 0 && cspHeader.includes("default-src") && !cspHeader.includes("*");
  return { issues, safe: isSafe, directives };
}

async function runHeaders() {
  let url = document.getElementById('t-headers').value.trim();
  if (!url.startsWith('http')) url = 'https://' + url;
  const res = document.getElementById('headers-result');
  res.innerHTML = '<div class="tool-loading">FETCHING & ANALYSING SECURITY HEADERS</div>';

  const SECURITY_HEADERS = [
    {
      key: 'content-security-policy',
      name: 'Content-Security-Policy',
      risk: 'XSS attacks — malicious scripts injected into the page',
      rec: 'Restricts sources of scripts, styles, images. One of the most important security headers.',
      required: true,
      analyses: true
    },
    {
      key: 'strict-transport-security',
      name: 'Strict-Transport-Security',
      risk: 'HTTPS downgrade attacks and MITM',
      rec: 'Forces browsers to use HTTPS. Should include max-age=31536000 and includeSubDomains.',
      required: true
    },
    {
      key: 'x-frame-options',
      name: 'X-Frame-Options',
      risk: 'Clickjacking — site loaded in a hidden iframe to trick users',
      rec: 'Set to DENY or SAMEORIGIN to prevent your page being embedded in iframes.',
      required: true
    },
    {
      key: 'x-content-type-options',
      name: 'X-Content-Type-Options',
      risk: 'MIME sniffing attacks',
      rec: 'Set to nosniff to prevent browsers guessing content type.',
      required: true
    },
    {
      key: 'referrer-policy',
      name: 'Referrer-Policy',
      risk: 'Leaking sensitive URL data in Referer headers',
      rec: 'Use strict-origin-when-cross-origin or no-referrer for privacy.',
      required: false
    },
    {
      key: 'permissions-policy',
      name: 'Permissions-Policy',
      risk: 'Unrestricted access to camera, mic, geolocation, sensors',
      rec: 'Restricts which browser features scripts can use.',
      required: false
    },
    {
      key: 'x-xss-protection',
      name: 'X-XSS-Protection',
      risk: 'Legacy XSS in older browsers (deprecated in modern browsers)',
      rec: 'Set to 1; mode=block for older browser compatibility.',
      required: false
    },
    {
      key: 'cross-origin-opener-policy',
      name: 'Cross-Origin-Opener-Policy',
      risk: 'Cross-origin attacks and data leaks',
      rec: 'Use same-origin to isolate the browsing context.',
      required: false
    },
  ];

  try {
    const rawText = await fetch(`https://api.hackertarget.com/httpheaders/?q=${url}`).then(r => r.text());
    if (rawText.includes('API count exceeded')) throw new Error('HackerTarget daily limit reached. Try again tomorrow.');
    if (rawText.toLowerCase().includes('error')) throw new Error(rawText.slice(0, 100));

    // Parse raw headers into a map
    const headerMap = {};
    rawText.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const k = line.slice(0, idx).trim().toLowerCase();
        const v = line.slice(idx + 1).trim();
        headerMap[k] = v;
      }
    });

    // Analyze CSP if present
    const cspAnalysis = analyzeCSP(headerMap['content-security-policy']);
    let cspHTML = '';
    if (cspAnalysis.issues.length > 0) {
      cspHTML = `
        <div style="background:var(--red-dim);border-left:4px solid var(--red);padding:12px;border-radius:4px;margin:10px 0;font-size:11px">
          <div style="font-weight:700;color:var(--red);margin-bottom:6px">CSP Issues Detected</div>
          ${cspAnalysis.issues.map(i => `<div style="padding:4px;color:var(--text)">${i}</div>`).join('')}
        </div>
      `;
    }

    // Score
    const required = SECURITY_HEADERS.filter(h => h.required);
    const present = required.filter(h => headerMap[h.key]);
    const score = Math.round((present.length / required.length) * 100);
    let grade, gradeClass;
    if (score >= 90 && cspAnalysis.safe) { grade = 'A'; gradeClass = 'A'; }
    else if (score >= 75) { grade = 'B'; gradeClass = 'B'; }
    else if (score >= 50) { grade = 'C'; gradeClass = 'C'; }
    else if (score >= 25) { grade = 'D'; gradeClass = 'D'; }
    else { grade = 'F'; gradeClass = 'F'; }

    const gradeDesc = {
      A: 'Excellent security posture',
      B: 'Good — minor improvements recommended',
      C: 'Fair — several headers missing',
      D: 'Poor — significant security gaps',
      F: 'Critical — most security headers absent'
    };

    const headerRows = SECURITY_HEADERS.map(h => {
      const val = headerMap[h.key];
      const status = val ? 'present' : (h.required ? 'missing' : 'partial');
      const statusLabel = val ? 'PRESENT' : (h.required ? 'MISSING' : 'ABSENT');
      return `<div class="sec-header-row">
        <div class="sec-header-status ${status}">${statusLabel}</div>
        <div class="sec-header-info">
          <div class="sec-header-name">${h.name}</div>
          <div class="sec-header-desc">${val ? h.rec : `⚠ Risk: ${h.risk}`}</div>
          ${val ? `<div class="sec-header-value">${escapeHTML(val.slice(0, 120))}${val.length > 120 ? '…' : ''}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    res.innerHTML = `
      <div class="sec-grade-row">
        <div class="sec-grade ${gradeClass}">${grade}</div>
        <div class="sec-grade-text">
          <div class="sec-grade-title">${gradeDesc[grade]}</div>
          <div class="sec-grade-sub">${present.length}/${required.length} critical headers present · ${url}</div>
        </div>
      </div>
      ${cspHTML}
      <div class="result-label">Security Header Analysis</div>
      ${headerRows}
      <div class="result-label" style="margin-top:20px">Raw Response Headers</div>
      <pre class="tool-result" style="max-height:200px">${escapeHTML(rawText)}</pre>
    `;
  } catch(e) {
    res.innerHTML = `<div class="tool-error">Error: ${e.message}</div>`;
  }
}

// PHASE 2: Enhanced Breach Check with exposure severity
function assessBreachSeverity(dataClasses, pwnCount, breachDate) {
  let severity = 'LOW', color = 'var(--green)';
  let riskFactors = 0;
  
  // Risk factor 1: Financial/Auth data exposed
  const sensitiveClasses = dataClasses?.filter(d => 
    /password|credit|financial|payment|ssn|passport|auth/i.test(d)
  ) || [];
  
  if (sensitiveClasses.length > 0) riskFactors += 2;
  if (dataClasses?.some(d => /password/i.test(d))) riskFactors += 1; // Password is critical
  
  // Risk factor 2: Large breach
  if (pwnCount > 1000000) riskFactors += 1;
  else if (pwnCount > 100000) riskFactors += 0.5;
  
  // Risk factor 3: Recent breach
  const daysOld = (new Date() - new Date(breachDate)) / 86400000;
  if (daysOld < 365) riskFactors += 1;
  else if (daysOld < 730) riskFactors += 0.5;
  
  if (riskFactors >= 3) { severity = 'CRITICAL'; color = 'var(--red)'; }
  else if (riskFactors >= 2) { severity = 'HIGH'; color = 'var(--red)'; }
  else if (riskFactors >= 1) { severity = 'MEDIUM'; color = 'var(--amber)'; }
  
  return { severity, color, riskFactors };
}

async function runBreach() {
  const email = document.getElementById('t-breach').value.trim();
  const res   = document.getElementById('breach-result');
  if (!email || !KEYS.hibp) return;
  res.innerHTML = '<div class="tool-loading">CHECKING BREACHED ACCOUNTS LIBRARY</div>';
  try {
    const resp = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: { 'hibp-api-key': KEYS.hibp, 'user-agent': 'ReconKit' }
    });
    if (resp.status === 404) {
      res.innerHTML = '<div class="tool-result" style="color:var(--green);padding:16px;background:var(--green-dim);border-radius:4px">✓ GOOD NEWS: This email was not found in known breaches.</div>';
      return;
    }
    const breaches = await resp.json();
    
    // Overall summary
    const passwordExposed = breaches.some(b => b.DataClasses?.some(d => /password/i.test(d)));
    const totalAccounts = breaches.reduce((sum, b) => sum + b.PwnCount, 0);
    
    let html = `
      <div class="result-section" style="background:var(--red-dim);border-left:4px solid var(--red);padding:12px;border-radius:4px;margin-bottom:12px">
        <div style="font-weight:700;color:var(--red);margin-bottom:4px">⚠ BREACH EXPOSURE ALERT</div>
        <div style="font-size:12px;line-height:1.5">
          This email appears in <strong style="color:var(--red)">${breaches.length}</strong> known breach${breaches.length > 1 ? 'es' : ''}.
          ${passwordExposed ? '<div style="margin-top:6px;color:var(--red)">🚨 Password likely exposed in at least one breach</div>' : ''}
        </div>
      </div>

      <div class="result-section">
        <div class="result-label">Action Items</div>
        <div style="font-size:11px;line-height:1.6;color:var(--text-muted)">
          <div style="padding:8px;margin:4px 0;background:var(--surface);border-radius:2px">
            1. <strong>Change your password immediately</strong> — especially if it was exposed in a breach
          </div>
          <div style="padding:8px;margin:4px 0;background:var(--surface);border-radius:2px">
            2. <strong>Enable two-factor authentication (2FA)</strong> on the compromised account(s) and all sensitive accounts
          </div>
          <div style="padding:8px;margin:4px 0;background:var(--surface);border-radius:2px">
            3. <strong>Check for connected accounts</strong> — if you used this password elsewhere, update it on those accounts too
          </div>
          <div style="padding:8px;margin:4px 0;background:var(--surface);border-radius:2px">
            4. <strong>Monitor your accounts</strong> for suspicious activity and consider a credit freeze if financial data was exposed
          </div>
        </div>
      </div>
      
      <div class="result-section">
        <div class="result-label">Breach Details (${breaches.length} total)</div>
        ${breaches.map((b, idx) => {
          const sev = assessBreachSeverity(b.DataClasses, b.PwnCount, b.BreachDate);
          const daysOld = Math.round((new Date() - new Date(b.BreachDate)) / 86400000);
          return `
            <div style="padding:12px;background:${sev.color}15;border-left:4px solid ${sev.color};border-radius:3px;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
                <div style="font-weight:700;color:var(--text-bright)">${b.Name}</div>
                <div style="color:${sev.color};font-weight:600;font-size:11px;letter-spacing:0.5px">${sev.severity}</div>
              </div>
              <div class="result-row"><span class="result-key">Date</span><span class="result-val">${b.BreachDate} (${daysOld} days ago)</span></div>
              <div class="result-row"><span class="result-key">Accounts Affected</span><span class="result-val">${b.PwnCount?.toLocaleString()}</span></div>
              <div class="result-row"><span class="result-key">Data Exposed</span><span class="result-val" style="font-size:10px">${b.DataClasses?.join(' • ') || 'Unknown'}</span></div>
              ${b.IsVerified ? '<div style="font-size:10px;color:var(--green);margin-top:6px">✓ Verified breach</div>' : '<div style="font-size:10px;color:var(--amber);margin-top:6px">⚠ Unverified report</div>'}
            </div>`;
        }).join('')}
      </div>
    `;

    res.innerHTML = html;
  } catch(e) {
    res.innerHTML = `<div class="tool-error">Error: ${e.message}</div>`;
  }
}

function runUsername() {
  const username = document.getElementById('t-username').value.trim();
  const res      = document.getElementById('username-result');
  if (!username) { res.innerHTML = '<div class="tool-error">Enter a username</div>'; return; }

  const platforms = [
    { name: 'GitHub',    icon: '🐙', url: `https://github.com/${username}` },
    { name: 'Twitter/X', icon: '🐦', url: `https://x.com/${username}` },
    { name: 'Instagram', icon: '📸', url: `https://instagram.com/${username}` },
    { name: 'Reddit',    icon: '🔴', url: `https://reddit.com/u/${username}` },
    { name: 'LinkedIn',  icon: '💼', url: `https://linkedin.com/in/${username}` },
    { name: 'TikTok',   icon: '🎵', url: `https://tiktok.com/@${username}` },
    { name: 'YouTube',  icon: '▶️', url: `https://youtube.com/@${username}` },
    { name: 'Twitch',   icon: '💜', url: `https://twitch.tv/${username}` },
    { name: 'Pinterest', icon: '📌', url: `https://pinterest.com/${username}` },
    { name: 'Snapchat', icon: '👻', url: `https://snapchat.com/add/${username}` },
    { name: 'Mastodon', icon: '🐘', url: `https://mastodon.social/@${username}` },
    { name: 'GitLab',   icon: '🦊', url: `https://gitlab.com/${username}` },
    { name: 'Dev.to',   icon: '👩‍💻', url: `https://dev.to/${username}` },
    { name: 'Medium',   icon: '✍️', url: `https://medium.com/@${username}` },
    { name: 'HackerNews', icon: '🟠', url: `https://news.ycombinator.com/user?id=${username}` },
    { name: 'Steam',    icon: '🎮', url: `https://steamcommunity.com/id/${username}` },
    { name: 'Keybase',  icon: '🔑', url: `https://keybase.io/${username}` },
    { name: 'Patreon',  icon: '🎨', url: `https://patreon.com/${username}` },
    { name: 'Spotify',  icon: '🎧', url: `https://open.spotify.com/user/${username}` },
    { name: 'Behance',  icon: '🖼', url: `https://behance.net/${username}` },
    { name: 'Dribbble', icon: '🏀', url: `https://dribbble.com/${username}` },
    { name: 'Replit',   icon: '💻', url: `https://replit.com/@${username}` },
  ];

  res.innerHTML = `
    <div class="result-label">Checking "${username}" across ${platforms.length} platforms — click to verify</div>
    <div class="tool-note">Links open in new tab. Presence must be verified manually — we can't check for you due to browser security (CORS).</div>
    <div class="platform-grid">
      ${platforms.map(p => `
        <a class="platform-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
          <span class="platform-icon">${p.icon}</span>
          <span>${p.name}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--text-dim)">→</span>
        </a>`).join('')}
    </div>
  `;
}

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────

function switchUtil(id, btn) {
  document.querySelectorAll('.util-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.util-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`util-${id}`).classList.add('active');
  btn.classList.add('active');
}

function generatePassword() {
  const len   = +document.getElementById('pw-len').value;
  const upper = document.getElementById('pw-upper').checked;
  const num   = document.getElementById('pw-num').checked;
  const sym   = document.getElementById('pw-sym').checked;
  const noAmb = document.getElementById('pw-amb').checked;

  let chars = 'abcdefghijkmnopqrstuvwxyz';
  if (noAmb) chars = 'abcdefghjkmnpqrstuvwxyz';
  if (upper) chars += noAmb ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (num)   chars += noAmb ? '23456789' : '0123456789';
  if (sym)   chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pw = Array.from(arr).map(v => chars[v % chars.length]).join('');
  document.getElementById('pw-output').textContent = pw;
  updateStrength(pw);
}

function updateStrength(pw) {
  const bar   = document.getElementById('pw-strength');
  const label = document.getElementById('pw-strength-label');
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { pct: '20%', bg: 'var(--red)',   text: 'VERY WEAK' },
    { pct: '40%', bg: 'var(--red)',   text: 'WEAK' },
    { pct: '60%', bg: 'var(--amber)', text: 'FAIR' },
    { pct: '80%', bg: 'var(--cyan)',  text: 'STRONG' },
    { pct: '100%',bg: 'var(--green)', text: 'VERY STRONG' },
  ];
  const l = levels[Math.min(score, 4)];
  bar.style.width = l.pct;
  bar.style.background = l.bg;
  label.textContent = l.text;
  label.style.color = l.bg;
}

let currentHashAlgo = 'SHA-256';
function setHashAlgo(algo, btn) {
  currentHashAlgo = algo;
  document.querySelectorAll('.hash-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  autoHash();
}

async function autoHash() {
  const input = document.getElementById('hash-input').value;
  const out   = document.getElementById('hash-output');
  if (!input) { out.textContent = '—'; return; }
  if (currentHashAlgo === 'MD5') {
    out.textContent = simpleMD5(input);
    return;
  }
  try {
    const buf  = await crypto.subtle.digest(currentHashAlgo, new TextEncoder().encode(input));
    out.textContent = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  } catch { out.textContent = 'Error computing hash'; }
}

// Simple MD5 (reference only)
function simpleMD5(str) {
  function safeAdd(x,y){var lsw=(x&0xffff)+(y&0xffff);return(((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xffff)}
  function bitRotateLeft(num,cnt){return(num<<cnt)|(num>>>(32-cnt))}
  function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b)}
  function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t)}
  function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t)}
  function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t)}
  function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t)}
  var i,m=[];str=unescape(encodeURIComponent(str));for(i=0;i<str.length;i++)m[i>>2]|=str.charCodeAt(i)<<((i%4)*8);m[i>>2]|=0x80<<((i%4)*8);m[14+(((i+8)>>6)<<4)]=i*8;
  var a=1732584193,b=-271733879,c=-1732584194,d=271733878,tmp;
  for(i=0;i<m.length;i+=16){var A=a,B=b,C=c,D=d;
  a=md5ff(a,b,c,d,m[i+0],7,-680876936);d=md5ff(d,a,b,c,m[i+1],12,-389564586);c=md5ff(c,d,a,b,m[i+2],17,606105819);b=md5ff(b,c,d,a,m[i+3],22,-1044525330);
  a=md5ff(a,b,c,d,m[i+4],7,-176418897);d=md5ff(d,a,b,c,m[i+5],12,1200080426);c=md5ff(c,d,a,b,m[i+6],17,-1473231341);b=md5ff(b,c,d,a,m[i+7],22,-45705983);
  a=md5ff(a,b,c,d,m[i+8],7,1770035416);d=md5ff(d,a,b,c,m[i+9],12,-1958414417);c=md5ff(c,d,a,b,m[i+10],17,-42063);b=md5ff(b,c,d,a,m[i+11],22,-1990404162);
  a=md5ff(a,b,c,d,m[i+12],7,1804603682);d=md5ff(d,a,b,c,m[i+13],12,-40341101);c=md5ff(c,d,a,b,m[i+14],17,-1502002290);b=md5ff(b,c,d,a,m[i+15],22,1236535329);
  a=md5gg(a,b,c,d,m[i+1],5,-165796510);d=md5gg(d,a,b,c,m[i+6],9,-1069501632);c=md5gg(c,d,a,b,m[i+11],14,643717713);b=md5gg(b,c,d,a,m[i+0],20,-373897302);
  a=md5gg(a,b,c,d,m[i+5],5,-701558691);d=md5gg(d,a,b,c,m[i+10],9,38016083);c=md5gg(c,d,a,b,m[i+15],14,-660478335);b=md5gg(b,c,d,a,m[i+4],20,-405537848);
  a=md5gg(a,b,c,d,m[i+9],5,568446438);d=md5gg(d,a,b,c,m[i+14],9,-1019803690);c=md5gg(c,d,a,b,m[i+3],14,-187363961);b=md5gg(b,c,d,a,m[i+8],20,1163531501);
  a=md5gg(a,b,c,d,m[i+13],5,-1444681467);d=md5gg(d,a,b,c,m[i+2],9,-51403784);c=md5gg(c,d,a,b,m[i+7],14,1735328473);b=md5gg(b,c,d,a,m[i+12],20,-1926607734);
  a=md5hh(a,b,c,d,m[i+5],4,-378558);d=md5hh(d,a,b,c,m[i+8],11,-2022574463);c=md5hh(c,d,a,b,m[i+11],16,1839030562);b=md5hh(b,c,d,a,m[i+14],23,-35309556);
  a=md5hh(a,b,c,d,m[i+1],4,-1530992060);d=md5hh(d,a,b,c,m[i+4],11,1272893353);c=md5hh(c,d,a,b,m[i+7],16,-155497632);b=md5hh(b,c,d,a,m[i+10],23,-1094730640);
  a=md5hh(a,b,c,d,m[i+13],4,681279174);d=md5hh(d,a,b,c,m[i+0],11,-358537222);c=md5hh(c,d,a,b,m[i+3],16,-722521979);b=md5hh(b,c,d,a,m[i+6],23,76029189);
  a=md5hh(a,b,c,d,m[i+9],4,-640364487);d=md5hh(d,a,b,c,m[i+12],11,-421815835);c=md5hh(c,d,a,b,m[i+15],16,530742520);b=md5hh(b,c,d,a,m[i+2],23,-995338651);
  a=md5ii(a,b,c,d,m[i+0],6,-198630844);d=md5ii(d,a,b,c,m[i+7],10,1126891415);c=md5ii(c,d,a,b,m[i+14],15,-1416354905);b=md5ii(b,c,d,a,m[i+5],21,-57434055);
  a=md5ii(a,b,c,d,m[i+12],6,1700485571);d=md5ii(d,a,b,c,m[i+3],10,-1894986606);c=md5ii(c,d,a,b,m[i+10],15,-1051523);b=md5ii(b,c,d,a,m[i+1],21,-2054922799);
  a=md5ii(a,b,c,d,m[i+8],6,1873313359);d=md5ii(d,a,b,c,m[i+15],10,-30611744);c=md5ii(c,d,a,b,m[i+6],15,-1560198380);b=md5ii(b,c,d,a,m[i+13],21,1309151649);
  a=md5ii(a,b,c,d,m[i+4],6,-145523070);d=md5ii(d,a,b,c,m[i+11],10,-1120210379);c=md5ii(c,d,a,b,m[i+2],15,718787259);b=md5ii(b,c,d,a,m[i+9],21,-343485551);
  a=safeAdd(a,A);b=safeAdd(b,B);c=safeAdd(c,C);d=safeAdd(d,D)}
  return [a,b,c,d].map(n=>(n<0?n+0x100000000:n).toString(16).padStart(8,'0').match(/../g).reverse().join('')).join('');
}

function doBase64(mode) {
  const input = document.getElementById('b64-input').value;
  const out   = document.getElementById('b64-output');
  try {
    out.textContent = mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
  } catch { out.textContent = 'Error: Invalid input'; }
}

function doURL(mode) {
  const input = document.getElementById('url-input').value;
  const out   = document.getElementById('url-output');
  try {
    out.textContent = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
  } catch { out.textContent = 'Error: Invalid input'; }
}

function calcCIDR() {
  const val = document.getElementById('cidr-input').value.trim();
  const res = document.getElementById('cidr-result');
  const [ip, prefix] = val.split('/');
  if (!ip || !prefix) { res.innerHTML = '<div class="tool-error">Enter valid CIDR (e.g. 192.168.1.0/24)</div>'; return; }

  const pfx   = parseInt(prefix);
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN) || pfx < 0 || pfx > 32) {
    res.innerHTML = '<div class="tool-error">Invalid CIDR notation</div>'; return;
  }

  const ipInt = parts.reduce((acc, v) => (acc << 8) | v, 0) >>> 0;
  const mask  = pfx === 0 ? 0 : (~0 << (32 - pfx)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const bcast   = (network | (~mask >>> 0)) >>> 0;
  const hosts   = pfx >= 31 ? Math.pow(2, 32 - pfx) : Math.pow(2, 32 - pfx) - 2;

  const n2d = n => [(n>>>24),(n>>>16&255),(n>>>8&255),(n&255)].join('.');
  const n2b = n => n.toString(2).padStart(32,'0').replace(/(.{8})/g,'$1.').slice(0,-1);

  res.innerHTML = `
    <div class="result-section">
      <div class="result-label">CIDR Analysis</div>
      <div class="result-row"><span class="result-key">Network</span><span class="result-val good">${n2d(network)}/${pfx}</span></div>
      <div class="result-row"><span class="result-key">Subnet Mask</span><span class="result-val">${n2d(mask)}</span></div>
      <div class="result-row"><span class="result-key">Broadcast</span><span class="result-val warn">${n2d(bcast)}</span></div>
      <div class="result-row"><span class="result-key">First Host</span><span class="result-val">${pfx < 31 ? n2d(network+1) : n2d(network)}</span></div>
      <div class="result-row"><span class="result-key">Last Host</span><span class="result-val">${pfx < 31 ? n2d(bcast-1) : n2d(bcast)}</span></div>
      <div class="result-row"><span class="result-key">Usable Hosts</span><span class="result-val">${hosts.toLocaleString()}</span></div>
      <div class="result-row"><span class="result-key">Binary Mask</span><span class="result-val" style="font-size:10px">${n2b(mask)}</span></div>
    </div>`;
}

// ─── LEARN CONTENT ─────────────────────────────────────────────
const LEARN_CONTENT = {
  protect: `
    <h2 class="learn-h2">🛡 How to Protect Yourself</h2>
    <p class="learn-p">The data on your exposure page is what every website you visit silently collects about you — with no warning, no login, and no permission required. Here's how to significantly reduce what you expose.</p>
    <div class="learn-tip"><strong>Use a VPN.</strong> A VPN masks your real IP address by routing your traffic through a server in another location. It won't stop all tracking, but it hides your ISP, approximate location, and real IP from every site you visit.</div>
    <div class="learn-tip"><strong>Use a privacy-focused browser.</strong> Firefox with uBlock Origin, or Brave Browser, block most trackers and fingerprinting attempts by default. Chrome is the worst offender for sharing data with Google.</div>
    <div class="learn-tip"><strong>Install uBlock Origin.</strong> This free browser extension blocks ads, trackers, and many fingerprinting scripts. It's the single most impactful thing you can do immediately.</div>
    <div class="learn-tip"><strong>Use a privacy-focused DNS.</strong> Change your DNS to 1.1.1.1 (Cloudflare) or 9.9.9.9 (Quad9) to prevent your ISP from logging every domain you look up.</div>
    <div class="learn-warn"><strong>Canvas fingerprinting cannot be blocked by a VPN.</strong> Even with a VPN, your browser's canvas fingerprint uniquely identifies you across sites. Use Brave Browser or Firefox with the Privacy Badger extension to mitigate this.</div>
    <ul class="learn-list">
      <li>Enable two-factor authentication (2FA) on every account</li>
      <li>Use a password manager — never reuse passwords</li>
      <li>Keep your browser and OS updated (patches fix exploits)</li>
      <li>Be careful what browser extensions you install — they can read all your data</li>
      <li>Use private/incognito mode for sensitive browsing (it hides from your device, not from websites)</li>
    </ul>
  `,
  tracking: `
    <h2 class="learn-h2">👁 How Websites Track You</h2>
    <p class="learn-p">Websites use multiple layered techniques to identify and follow you across the internet — many of which are invisible to the average user and cannot be blocked by simply clearing cookies.</p>
    <div class="learn-tip"><strong>IP Tracking.</strong> Your IP address is sent with every request you make. Websites log it automatically. It reveals your approximate location and ISP, and can be tied to your identity by law enforcement with a warrant.</div>
    <div class="learn-tip"><strong>Browser Fingerprinting.</strong> Your combination of screen resolution, installed fonts, GPU, browser version, timezone, and dozens of other signals creates a unique "fingerprint" that identifies you even if you clear all cookies. This is what ReconKit demonstrates.</div>
    <div class="learn-tip"><strong>Third-party cookies.</strong> When a site embeds a Facebook Like button or Google Analytics script, those third parties set cookies that follow you everywhere those scripts appear — which is most of the web.</div>
    <div class="learn-tip"><strong>Canvas & WebGL fingerprinting.</strong> Your graphics card renders text and images in microscopically unique ways. Sites capture this rendering to create a unique identifier — completely invisible to you.</div>
    <div class="learn-tip"><strong>WebRTC leaks.</strong> Even behind a VPN, your browser can reveal your real local IP address through WebRTC — a protocol used for video calls and real-time communication. ReconKit checks this for you.</div>
    <ul class="learn-list">
      <li>Your browser sends a "User Agent" string — it tells every site your OS, browser version, and device type</li>
      <li>Keyboard and mouse movement patterns can uniquely identify you (behavioural biometrics)</li>
      <li>Battery level API can be used as a weak identifier across sites</li>
      <li>The fonts installed on your system reveal information about your device and region</li>
    </ul>
  `,
  vpn: `
    <h2 class="learn-h2">🔒 VPNs Explained</h2>
    <p class="learn-p">A VPN (Virtual Private Network) encrypts your internet traffic and routes it through a server in another location, masking your real IP address from the websites you visit.</p>
    <div class="learn-tip"><strong>What a VPN DOES protect.</strong> Your IP address from websites. Your traffic from your ISP. Your location (approximately). Your browsing from people on the same WiFi (e.g. coffee shop). Useful for bypassing geographic restrictions.</div>
    <div class="learn-warn"><strong>What a VPN does NOT protect.</strong> Browser fingerprinting (canvas, WebGL, fonts). Cookies already set on your device. Malware you've already installed. Your Google/Facebook account tracking (they know who you are when you're logged in). DNS leaks if configured incorrectly.</div>
    <p class="learn-p">A VPN shifts trust from your ISP to your VPN provider. If your VPN logs your activity, you haven't gained much. Choose providers with verified no-log policies.</p>
    <ul class="learn-list">
      <li><strong>Mullvad</strong> — Accepts cash payment, no email required, excellent privacy</li>
      <li><strong>ProtonVPN</strong> — Open source, Swiss jurisdiction, strong privacy record</li>
      <li><strong>IVPN</strong> — No-logs audited, privacy-first design</li>
      <li>Avoid free VPNs — they almost always monetise your data</li>
      <li>Avoid VPNs owned by ad companies or with unclear ownership</li>
    </ul>
  `,
  attacks: `
    <h2 class="learn-h2">⚠ Common Attack Types</h2>
    <p class="learn-p">Understanding attack vectors is the first step in defending against them. These are the most common methods attackers use against individuals and organisations.</p>
    <div class="learn-tip"><strong>Phishing.</strong> Fake emails, messages, or websites that impersonate trusted entities to steal credentials or install malware. The most common attack vector globally. Always verify the sender's actual email domain, not just the display name.</div>
    <div class="learn-tip"><strong>Man-in-the-Middle (MITM).</strong> Attacker positions themselves between you and the server you're communicating with, intercepting and potentially modifying data. Most dangerous on public WiFi. HTTPS and VPNs mitigate this.</div>
    <div class="learn-tip"><strong>SQL Injection.</strong> Attacker inserts malicious SQL code into a web form input, manipulating the database behind the site. Can expose entire databases of user data. Prevented by proper input sanitisation and parameterised queries.</div>
    <div class="learn-tip"><strong>Cross-Site Scripting (XSS).</strong> Malicious JavaScript injected into a legitimate website that runs in victims' browsers — can steal session cookies and redirect users. Prevented by output encoding and Content Security Policy headers.</div>
    <div class="learn-tip"><strong>Social Engineering.</strong> Manipulating people rather than systems — pretexting, impersonation, urgency tactics. Technical controls can't stop a convincing human. Training and scepticism are the defence.</div>
    <div class="learn-tip"><strong>Credential Stuffing.</strong> Using lists of leaked username/password pairs from old breaches to try to log into other services. Works because people reuse passwords. Use a password manager and unique passwords everywhere.</div>
  `,
  passwords: `
    <h2 class="learn-h2">🔑 Password Security</h2>
    <p class="learn-p">Passwords remain the primary authentication mechanism for most systems. Understanding how they're attacked helps you understand why good password hygiene matters.</p>
    <div class="learn-tip"><strong>Length beats complexity.</strong> A 20-character passphrase of random words is stronger than a 10-character "Tr0ub@dor!" password. Length exponentially increases the time required to crack by brute force.</div>
    <div class="learn-warn"><strong>Never reuse passwords.</strong> When a service is breached (and they all get breached eventually), attackers try those credentials on every other major service. One reused password can compromise your entire digital life.</div>
    <div class="learn-tip"><strong>Use a password manager.</strong> Bitwarden (free, open source), 1Password, or KeePass let you use unique, random passwords for every account without memorising them. The master password is the only one you need to remember — make it long and memorable.</div>
    <div class="learn-tip"><strong>Enable 2FA everywhere.</strong> Two-factor authentication means even if your password is stolen, attackers still can't access your account without the second factor. Use an authenticator app (not SMS where possible).</div>
    <ul class="learn-list">
      <li>Use the password generator in this toolkit's Utilities tab</li>
      <li>Check if your email has been in a breach using the Breach Check tool</li>
      <li>Never store passwords in plain text files or note apps</li>
      <li>Don't use personal information in passwords (name, birthday, pet name)</li>
      <li>Change passwords immediately after a known breach</li>
    </ul>
  `,
  glossary: `
    <h2 class="learn-h2">📖 Security Glossary</h2>
    ${[
      ['OSINT', 'Open Source Intelligence — gathering information from publicly available sources. Everything ReconKit does is OSINT.'],
      ['IP Address', 'A numerical label assigned to every device on a network. Can reveal your approximate location and ISP.'],
      ['ASN', 'Autonomous System Number — identifies a network operator (e.g. your ISP or a cloud provider).'],
      ['DNS', 'Domain Name System — translates human-readable domain names (google.com) into IP addresses computers use.'],
      ['WHOIS', 'A public database containing registration information about domain names — who owns it, when it expires, registrar details.'],
      ['TLS/SSL', 'Encryption protocols that secure data in transit between your browser and a web server. The "S" in HTTPS.'],
      ['VPN', 'Virtual Private Network — encrypts your traffic and masks your IP address by routing through a server elsewhere.'],
      ['Firewall', 'A security system that monitors and controls incoming and outgoing network traffic based on rules.'],
      ['Phishing', 'A social engineering attack using fraudulent emails or websites to steal credentials or install malware.'],
      ['Malware', 'Malicious software — includes viruses, ransomware, spyware, trojans, and adware.'],
      ['2FA / MFA', 'Two/Multi-Factor Authentication — requires a second proof of identity beyond just a password.'],
      ['Zero-day', 'A software vulnerability unknown to the vendor, being actively exploited before a patch exists.'],
      ['MITM', 'Man-in-the-Middle attack — intercepting communications between two parties without their knowledge.'],
      ['SQL Injection', 'Inserting malicious SQL into input fields to manipulate a database.'],
      ['XSS', 'Cross-Site Scripting — injecting malicious JavaScript into a legitimate website.'],
      ['CVE', 'Common Vulnerabilities and Exposures — a public dictionary of known security vulnerabilities.'],
      ['Penetration Testing', 'Authorised simulated cyberattack on a system to identify and fix vulnerabilities before attackers do.'],
      ['Social Engineering', 'Manipulating people rather than exploiting technical vulnerabilities to gain unauthorised access.'],
      ['Ransomware', 'Malware that encrypts victims\' data and demands payment for the decryption key.'],
      ['Tor', 'The Onion Router — anonymity network that routes traffic through multiple encrypted relays.'],
    ].map(([term, def]) => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:4px">${term}</div>
        <div style="font-size:12px;color:var(--text);line-height:1.7">${def}</div>
      </div>`).join('')}
  `,
};

function showLearn(id, btn) {
  document.querySelectorAll('.learn-nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('learn-container').innerHTML = LEARN_CONTENT[id] || '';
}

// ─── PHASE 1: IP CONVERTER UTILITY ────────────────────────────
function convertIPTool() {
  const ip = (document.getElementById('ip-conv-input')?.value || '').trim();
  const res = document.getElementById('ip-conv-result');
  if (!res) return;
  if (!ip) { res.innerHTML = ''; return; }

  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    res.innerHTML = '<div class="tool-note" style="color:var(--red)">Invalid IPv4 address</div>';
    return;
  }

  const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('.');
  const hex = parts.map(p => p.toString(16).toUpperCase().padStart(2, '0')).join(':');
  const decimal = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const isPrivate = (parts[0] === 10) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);

  res.innerHTML = `
    <div class="result-row"><span class="result-key">Binary</span><span class="result-val" style="font-size:10px;font-family:var(--font-mono);word-break:break-all">${binary}</span></div>
    <div class="result-row"><span class="result-key">Hexadecimal</span><span class="result-val" style="font-family:var(--font-mono)">${hex}</span></div>
    <div class="result-row"><span class="result-key">Decimal</span><span class="result-val" style="font-family:var(--font-mono)">${decimal.toLocaleString()}</span></div>
    <div class="result-row"><span class="result-key">Private (RFC 1918)</span><span class="result-val ${isPrivate ? 'warn' : 'good'}">${isPrivate ? 'Yes' : 'No'}</span></div>
  `;
}

// ─── PHASE 1: REGEX TESTER UTILITY ────────────────────────────
function testRegexTool() {
  const pattern = (document.getElementById('regex-pattern')?.value || '').trim();
  const flags = (document.getElementById('regex-flags')?.value || 'g').trim();
  const text = document.getElementById('regex-text')?.value || '';
  const res = document.getElementById('regex-result');
  if (!res) return;

  if (!pattern || !text) { res.innerHTML = ''; return; }

  try {
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex) || [];
    const highlighted = text.replace(regex, match => `<span style="background:var(--amber-dim);color:var(--amber);padding:2px 4px;border-radius:2px;font-weight:600">${escapeHTML(match)}</span>`);

    let matchList = '';
    if (matches.length > 0) {
      matchList = `<div class="result-row" style="flex-wrap:wrap;gap:4px"><span class="result-key">Matches</span><span>${matches.map(m => `<code style="background:var(--surface);padding:2px 6px;border-radius:2px">${escapeHTML(m)}</code>`).join('')}</span></div>`;
    }

    res.innerHTML = `
      <div class="result-row"><span class="result-key">Found</span><span class="result-val good">${matches.length}</span></div>
      ${matchList}
      <div class="result-row" style="margin-top:8px"><span class="result-key">Highlighted</span></div>
      <div style="background:var(--surface);padding:8px;border-radius:4px;font-size:11px;line-height:1.8">${highlighted}</div>
    `;
  } catch (e) {
    res.innerHTML = `<div class="tool-note" style="color:var(--red)">Invalid regex: ${escapeHTML(e.message)}</div>`;
  }
}

function decodeJWT() {
  const raw = (document.getElementById('jwt-input')?.value || '').trim();
  const res = document.getElementById('jwt-result');
  if (!res) return;
  if (!raw) { res.innerHTML = ''; return; }

  const parts = raw.split('.');
  if (parts.length !== 3) {
    res.innerHTML = '<div class="tool-error">Invalid JWT — must have 3 parts separated by dots</div>';
    return;
  }

  function b64Decode(str) {
    try {
      const pad = str.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(pad.padEnd(pad.length + (4 - pad.length % 4) % 4, '='));
      return JSON.parse(decoded);
    } catch { return null; }
  }

  const header  = b64Decode(parts[0]);
  const payload = b64Decode(parts[1]);

  const now = Math.floor(Date.now() / 1000);
  let expiryNote = '';
  if (payload?.exp) {
    const expired = payload.exp < now;
    const dt = new Date(payload.exp * 1000).toLocaleString();
    expiryNote = `<div class="tool-${expired ? 'error' : 'note'}" style="margin-bottom:10px">
      ${expired ? '⚠ Token EXPIRED' : '✓ Token valid'} — exp: ${dt}
    </div>`;
  }

  const fmt = obj => obj ? JSON.stringify(obj, null, 2) : 'Could not decode';

  res.innerHTML = `
    ${expiryNote}
    <div class="jwt-part jwt-part-header">
      <div class="jwt-part-label">Header <span style="color:var(--cyan)">(algorithm & type)</span></div>
      <pre style="font-size:12px;color:var(--text);line-height:1.6;margin:0">${escapeHTML(fmt(header))}</pre>
    </div>
    <div class="jwt-part jwt-part-payload">
      <div class="jwt-part-label">Payload <span style="color:var(--amber)">(claims)</span></div>
      <pre style="font-size:12px;color:var(--text);line-height:1.6;margin:0">${escapeHTML(fmt(payload))}</pre>
    </div>
    <div class="jwt-part jwt-part-signature">
      <div class="jwt-part-label">Signature <span style="color:var(--red)">(cannot be verified without secret)</span></div>
      <div style="font-size:11px;color:var(--text-muted);word-break:break-all;font-family:var(--font-mono)">${parts[2]}</div>
    </div>
  `;
}

// ─── HELPERS ──────────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}