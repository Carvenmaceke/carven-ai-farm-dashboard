const PRETORIA_LAT = -25.7479;
const PRETORIA_LON = 28.2293;

const WMO_TEXT = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Depositing rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Slight rain',63:'Rain',65:'Heavy rain',71:'Slight snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Rain showers',82:'Violent rain showers',95:'Thunderstorm',96:'Thunderstorm, hail',99:'Thunderstorm, heavy hail'};

// Weather-code → icon category, then rendered as flat SVG glyphs (sun/cloud/rain/etc)
function wmoCategory(code){
  if(code === 0 || code === 1) return 'sun';
  if(code === 2) return 'partly';
  if(code === 3 || code === 45 || code === 48) return 'cloud';
  if([51,53,55,61,63,65,80,81,82].includes(code)) return 'rain';
  if([71,73,75].includes(code)) return 'snow';
  if([95,96,99].includes(code)) return 'storm';
  return 'cloud';
}
const SUN_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="5.2" fill="#e6a13c"/><g stroke="#e6a13c" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>`;
const CLOUD_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 18a4.5 4.5 0 01-.5-8.97A5.5 5.5 0 0117 8.5a4 4 0 01-.3 8H7z" fill="#c7cdb8" stroke="#a9b096" stroke-width="0.6"/></svg>`;
const PARTLY_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="8.5" cy="8.5" r="3.6" fill="#e6a13c"/><path d="M9 17.5a4.3 4.3 0 01-.4-8.58A5.2 5.2 0 0118.2 9.9a3.8 3.8 0 01-.4 7.6H9z" fill="#c7cdb8" stroke="#a9b096" stroke-width="0.6"/></svg>`;
const RAIN_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 14.5a4.2 4.2 0 01-.4-8.38A5.1 5.1 0 0116.8 7a3.7 3.7 0 01-.4 7.4H7z" fill="#a7b3c4" stroke="#8b9aad" stroke-width="0.6"/><g stroke="#5a7ab0" stroke-width="1.6" stroke-linecap="round"><path d="M8 17.5l-1 2.5M12 17.5l-1 2.5M16 17.5l-1 2.5"/></g></svg>`;
const STORM_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 13.5a4.2 4.2 0 01-.4-8.38A5.1 5.1 0 0116.8 6a3.7 3.7 0 01-.4 7.4H7z" fill="#9aa0ad" stroke="#7d8492" stroke-width="0.6"/><path d="M12.5 13l-2.5 4h2.3l-1.3 3.8L15 15.5h-2.3z" fill="#e6a13c"/></svg>`;
const SNOW_SVG = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 13.5a4.2 4.2 0 01-.4-8.38A5.1 5.1 0 0116.8 6a3.7 3.7 0 01-.4 7.4H7z" fill="#c7cdb8" stroke="#a9b096" stroke-width="0.6"/><g stroke="#8fa8c9" stroke-width="1.4" stroke-linecap="round"><path d="M8 17v4M6 18.5l4 1M6 21.5l4-3M16 17v4M14 18.5l4 1M14 21.5l4-3"/></g></svg>`;
const ICONS_BY_CATEGORY = {sun:SUN_SVG, partly:PARTLY_SVG, cloud:CLOUD_SVG, rain:RAIN_SVG, snow:SNOW_SVG, storm:STORM_SVG};
function weatherIconSVG(code){ return ICONS_BY_CATEGORY[wmoCategory(code)] || CLOUD_SVG; }

const CROPS = {
  tomato:  {name:'Tomato Block',  crop:'Tomatoes', moistureMin:35, tempMax:32, humidityFungal:85, daysToMaturity:75,  offset:0},
  spinach: {name:'Spinach Bed',   crop:'Spinach',  moistureMin:45, tempMax:26, humidityFungal:80, daysToMaturity:40,  offset:6},
  pepper:  {name:'Pepper Tunnel', crop:'Peppers',  moistureMin:30, tempMax:33, humidityFungal:85, daysToMaturity:80,  offset:-4},
  cabbage: {name:'Cabbage Rows',  crop:'Cabbage',  moistureMin:40, tempMax:28, humidityFungal:88, daysToMaturity:70,  offset:3},
  carrot:  {name:'Carrot Bed',    crop:'Carrots',  moistureMin:38, tempMax:29, humidityFungal:82, daysToMaturity:75,  offset:-2}
};

let LIVE = { tempC:null, humidity:null, soilMoisturePct:null, soilTempC:null, rain72:null, ready:false };

// =====================================================================
// SETTINGS — persisted to this browser via localStorage. Units and
// alert sensitivity genuinely affect what's rendered; notification
// channels/frequency and dark theme are saved but not wired to a real
// backend or a rendered theme yet (no delivery pipeline / not built).
// =====================================================================
const SETTINGS_DEFAULTS = {
  farmName: 'Highveld Vegetable Plots',
  location: 'Pretoria, Gauteng',
  accent: 'gold',
  alertNotifications: true,
  channels: { email:true, sms:false, whatsapp:false, inapp:true },
  frequency: 'instant',
  units: 'C',
  theme: 'light',
  sensitivity: 'medium',
  quietHours: false,
  quietStart: '22:00',
  quietEnd: '05:00',
  voiceEnabled: false
};
let SETTINGS = loadSettings();

const ACCENT_THEMES = {
  gold:   { gold:'#d68f2c', goldDeep:'#a3651a' },
  teal:   { gold:'#1f8a7a', goldDeep:'#0d6b5f' },
  rust:   { gold:'#c1543a', goldDeep:'#a5402b' },
  indigo: { gold:'#5a6cc4', goldDeep:'#4a5aa8' },
  moss:   { gold:'#6f9450', goldDeep:'#5a7a3f' }
};
function applyAccentTheme(){
  const t = ACCENT_THEMES[SETTINGS.accent] || ACCENT_THEMES.gold;
  document.documentElement.style.setProperty('--gold', t.gold);
  document.documentElement.style.setProperty('--gold-deep', t.goldDeep);
}
function applyFarmLabel(){
  const el = document.getElementById('farm-label');
  if(el) el.textContent = `${SETTINGS.farmName} — ${SETTINGS.location}`;
}
applyAccentTheme();
applyFarmLabel();

// =====================================================================
// VOICE — real browser text-to-speech via the Web Speech API. No backend,
// no API key; works natively wherever SpeechSynthesis is supported.
// =====================================================================
const speechSupported = ('speechSynthesis' in window);
function speakText(text){
  if(!SETTINGS.voiceEnabled || !speechSupported) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  const toggleBtn = document.getElementById('chat-voice-toggle');
  utter.onstart = () => toggleBtn?.classList.add('speaking');
  utter.onend = () => toggleBtn?.classList.remove('speaking');
  utter.onerror = () => toggleBtn?.classList.remove('speaking');
  window.speechSynthesis.speak(utter);
}
function stopSpeaking(){
  if(speechSupported) window.speechSynthesis.cancel();
  document.getElementById('chat-voice-toggle')?.classList.remove('speaking');
}
function updateVoiceToggleUI(){
  const btn = document.getElementById('chat-voice-toggle');
  if(!btn) return;
  btn.classList.toggle('muted', !SETTINGS.voiceEnabled);
  btn.title = SETTINGS.voiceEnabled ? 'Voice replies on — click to mute' : 'Voice replies off — click to unmute';
}

// =====================================================================
// VOICE INPUT — real browser speech-to-text via the Web Speech API
// (SpeechRecognition). No backend, no API key. Chrome/Edge support this
// well; Firefox and some browsers don't — the mic button disables itself
// with an explanatory tooltip where it's unavailable, rather than
// pretending to listen.
// =====================================================================
function initVoiceInput(openPanel){
  const micBtn = document.getElementById('chat-mic');
  const input = document.getElementById('chat-input');
  const RecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!RecognitionAPI){
    micBtn.classList.add('unsupported');
    micBtn.title = 'Voice input not supported in this browser';
    micBtn.disabled = true;
    return;
  }

  const recognition = new RecognitionAPI();
  recognition.lang = 'en-ZA';
  recognition.continuous = false;
  recognition.interimResults = true;
  let listening = false;

  recognition.onstart = () => {
    listening = true;
    micBtn.classList.add('listening');
    input.placeholder = 'Listening…';
    openPanel();
  };
  recognition.onresult = (e) => {
    let transcript = '';
    for(let i=0;i<e.results.length;i++) transcript += e.results[i][0].transcript;
    input.value = transcript;
    if(e.results[e.results.length-1].isFinal){
      recognition.stop();
      if(transcript.trim()) askFarm(transcript);
      input.value = '';
    }
  };
  recognition.onerror = () => {
    listening = false;
    micBtn.classList.remove('listening');
    input.placeholder = 'Ask about your farm…';
  };
  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove('listening');
    input.placeholder = 'Ask about your farm…';
  };

  micBtn.addEventListener('click', () => {
    if(listening){ recognition.stop(); return; }
    try{ recognition.start(); }catch(e){ /* already started */ }
  });
}

function loadSettings(){
  try{
    const raw = localStorage.getItem('farm-settings');
    if(!raw) return {...SETTINGS_DEFAULTS};
    return {...SETTINGS_DEFAULTS, ...JSON.parse(raw)};
  }catch(e){ return {...SETTINGS_DEFAULTS}; }
}
function saveSettings(){
  try{ localStorage.setItem('farm-settings', JSON.stringify(SETTINGS)); }catch(e){}
}

function fmtTemp(c){
  if(c === null || c === undefined) return '—';
  if(SETTINGS.units === 'F') return Math.round(c*9/5+32) + '°F';
  return Math.round(c) + '°C';
}
function fmtTempDelta(deltaC){
  if(SETTINGS.units === 'F') return (deltaC*1.8).toFixed(1) + '°F';
  return deltaC.toFixed(1) + '°C';
}

const SENSITIVITY_MULT = { low:1.5, medium:1, high:0.6 };
function sensMult(){ return SENSITIVITY_MULT[SETTINGS.sensitivity] || 1; }

function fetchSensorData(zoneId){
  const cfg = CROPS[zoneId];
  return {
    moisturePct: LIVE.soilMoisturePct !== null ? Math.max(5, LIVE.soilMoisturePct + cfg.offset) : null,
    tempC: LIVE.tempC,
    humidity: LIVE.humidity
  };
}

async function fetchWeather(){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${PRETORIA_LAT}&longitude=${PRETORIA_LON}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Africa%2FJohannesburg&forecast_days=5`;
  try{
    const res = await fetch(url);
    if(!res.ok){ const body = await res.text().catch(()=>''); throw new Error('HTTP ' + res.status + (body?' — '+body.slice(0,150):'')); }
    const data = await res.json();
    LIVE.tempC = data.current.temperature_2m;
    LIVE.humidity = data.current.relative_humidity_2m;
    let hourIdx = data.hourly.time.indexOf(data.current.time);
    if(hourIdx === -1) hourIdx = 0;
    LIVE.soilTempC = data.hourly.soil_temperature_0cm[hourIdx];
    LIVE.soilMoisturePct = data.hourly.soil_moisture_0_to_1cm[hourIdx] * 100;
    LIVE.ready = true;

    document.getElementById('w-temp').textContent = fmtTemp(LIVE.tempC);
    document.getElementById('w-icon').innerHTML = weatherIconSVG(data.current.weather_code);
    document.getElementById('w-cond').textContent = (WMO_TEXT[data.current.weather_code] || 'Conditions unavailable') + ' · humidity ' + Math.round(LIVE.humidity) + '% · wind ' + Math.round(data.current.wind_speed_10m) + ' km/h';

    const days = data.daily.time.slice(0,5).map((date,i) => ({date, code: data.daily.weather_code[i], max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i], precip: data.daily.precipitation_probability_max[i]}));
    document.getElementById('w-days').innerHTML = days.map((d,i) => {
      const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-ZA',{weekday:'short'});
      return `<div class="wday ${i===0?'today':''}">
        <div class="d">${i===0?'Today':label}</div>
        <div class="wicon">${weatherIconSVG(d.code)}</div>
        <div class="t"><strong>${fmtTemp(d.max)}</strong> ${fmtTemp(d.min)}</div>
        <div class="p">${d.precip}% rain</div>
      </div>`;
    }).join('');
    LIVE.rain72 = Math.max(days[1].precip, days[2].precip, days[3].precip);

    document.getElementById('soil-strip').innerHTML = `
      <div class="soil-chip"><div class="k">Air temperature</div><div class="v">${fmtTemp(LIVE.tempC)}</div></div>
      <div class="soil-chip"><div class="k">Relative humidity</div><div class="v">${Math.round(LIVE.humidity)}%</div></div>
      <div class="soil-chip"><div class="k">Soil temperature</div><div class="v">${fmtTemp(LIVE.soilTempC)}</div></div>
      <div class="soil-chip"><div class="k">Soil moisture (0–1cm)</div><div class="v">${LIVE.soilMoisturePct.toFixed(1)}%</div></div>
      <div class="soil-chip"><div class="k">Rain chance (72h)</div><div class="v">${LIVE.rain72}%</div></div>`;

    document.getElementById('weather-dot').className = 'dot live';
    document.getElementById('weather-status').textContent = 'Weather & soil: live · Open-Meteo';
    buildAll();
  }catch(err){
    document.getElementById('w-cond').textContent = '';
    document.getElementById('weather-widget').insertAdjacentHTML('beforeend', `<div class="weather-error">Couldn't reach live weather right now (${err.message}). Try reloading.</div>`);
    document.getElementById('weather-dot').className = 'dot off';
    document.getElementById('weather-status').textContent = 'Weather & soil: offline';
  }
}

function statusFor(zoneId){
  const cfg = CROPS[zoneId]; const s = fetchSensorData(zoneId); const m = sensMult();
  if(s.moisturePct === null) return 'ok';
  const deficit = cfg.moistureMin - s.moisturePct; const heat = s.tempC - cfg.tempMax;
  if(deficit > 12*m || heat > 4*m) return 'alert';
  if(deficit > 3*m || heat > 0 || s.humidity > cfg.humidityFungal) return 'watch';
  return 'ok';
}
function confidenceFromMagnitude(mag){ if(mag>=12) return 4; if(mag>=6) return 3; if(mag>=2) return 2; return 1; }

function buildRecommendations(){
  const RECS = [];
  const m = sensMult();
  Object.entries(CROPS).forEach(([id, cfg]) => {
    const s = fetchSensorData(id); if(s.moisturePct === null) return;
    const deficit = cfg.moistureMin - s.moisturePct;
    if(deficit > 3*m){
      const urgent = deficit > 12*m;
      RECS.push({id:id+'-moisture', zone:id, kind: urgent?'alert':(deficit>6*m?'priority':'insight'),
        title:`${urgent?'Irrigate':'Consider watering'} ${cfg.name} — soil moisture below target`,
        meta:`${cfg.name} · ${cfg.crop}`, confidence: confidenceFromMagnitude(deficit),
        reasoning:`Live soil moisture is reading ${s.moisturePct.toFixed(1)}%, against a ${cfg.moistureMin}% target for ${cfg.crop.toLowerCase()}. With only a ${LIVE.rain72}% chance of rain in the next 3 days, this deficit ${urgent?'needs attention within the next day':'is worth planning for this week'}.`,
        evidence:[{k:'Soil moisture (live)',v:s.moisturePct.toFixed(1)+'%',trend:'down'},{k:'Target minimum',v:cfg.moistureMin+'%'},{k:'Rain forecast (72h)',v:LIVE.rain72+'%',trend:LIVE.rain72<20?'down':''},{k:'Air temperature',v:fmtTemp(LIVE.tempC)}]});
    }
    if(s.tempC > cfg.tempMax){
      const over = s.tempC - cfg.tempMax;
      RECS.push({id:id+'-heat', zone:id, kind: over>4*m?'alert':'insight', title:`Heat stress risk — ${cfg.name}`, meta:`${cfg.name} · ${cfg.crop}`, confidence: confidenceFromMagnitude(over*2),
        reasoning:`Current air temperature (${fmtTemp(LIVE.tempC)}) is above the ${fmtTemp(cfg.tempMax)} comfort ceiling used for ${cfg.crop.toLowerCase()}. Sustained heat like this can cause wilting or flower drop.`,
        evidence:[{k:'Air temperature',v:fmtTemp(LIVE.tempC),trend:'up'},{k:'Crop heat ceiling',v:fmtTemp(cfg.tempMax)},{k:'Soil temperature',v:fmtTemp(LIVE.soilTempC)}]});
    }
    if(LIVE.humidity > cfg.humidityFungal){
      RECS.push({id:id+'-fungal', zone:id, kind:'insight', title:`Fungal-risk humidity — ${cfg.name}`, meta:`${cfg.name} · ${cfg.crop}`, confidence: confidenceFromMagnitude(LIVE.humidity-cfg.humidityFungal),
        reasoning:`Relative humidity (${Math.round(LIVE.humidity)}%) is above the ${cfg.humidityFungal}% level where fungal pressure typically rises for ${cfg.crop.toLowerCase()}.`,
        evidence:[{k:'Relative humidity',v:Math.round(LIVE.humidity)+'%',trend:'up'},{k:'Risk threshold',v:cfg.humidityFungal+'%'}]});
    }
  });
  if(RECS.length === 0){
    RECS.push({id:'all-clear', zone:'tomato', kind:'insight', title:'All beds within normal range', meta:'Farm-wide', confidence:3,
      reasoning:`Live soil moisture, air temperature and humidity are all within thresholds for every bed right now. No action needed.`,
      evidence:[{k:'Soil moisture',v:LIVE.soilMoisturePct.toFixed(1)+'%'},{k:'Air temperature',v:fmtTemp(LIVE.tempC)},{k:'Humidity',v:Math.round(LIVE.humidity)+'%'}]});
  }
  return RECS;
}

const CAMERA_DEMO = [
  {zone:'tomato', title:'Early blight pattern detected — lower canopy', meta:'Tomato Block · mock detection', confidence:3,
   reasoning:'Preview of a camera detection: leaf-spot pattern matched against a disease-classification model, with a cropped image and confidence score attached.',
   evidence:[{k:'Match confidence',v:'71%'},{k:'Camera',v:'Not yet installed'}]},
  {zone:'cabbage', title:'Cabbage moth larvae — possible sighting', meta:'Cabbage Rows · mock detection', confidence:2,
   reasoning:'Example pest alert card. Once a camera feed exists, this includes a timestamped image crop and a link to the full frame.',
   evidence:[{k:'Match confidence',v:'54%'},{k:'Camera',v:'Not yet installed'}]}
];

const CAM_NODES = [
  {id:'cam1', zone:'tomato', name:'Camera 1 — Tomato Block', health:82, status:'watch', note:'Early blight pattern flagged 1h ago', lastScan:'12 min ago', coverage:'94% of canopy', leafArea:'+3% vs last week'},
  {id:'cam2', zone:'cabbage', name:'Camera 2 — Cabbage Rows', health:64, status:'watch', note:'Possible moth larvae, low confidence', lastScan:'8 min ago', coverage:'88% of canopy', leafArea:'-2% vs last week'},
  {id:'cam3', zone:'pepper', name:'Camera 3 — Pepper Tunnel', health:93, status:'ok', note:'No issues detected', lastScan:'15 min ago', coverage:'97% of canopy', leafArea:'+5% vs last week'},
  {id:'cam4', zone:'spinach', name:'Camera 4 — Spinach Bed', health:88, status:'ok', note:'No issues detected', lastScan:'10 min ago', coverage:'91% of canopy', leafArea:'+1% vs last week'}
];

const DEVICE_STATUS = [
  {name:'Weather / soil station', zone:'Farm-wide', status:'online', battery:'Mains', lastSeen:'live'},
  {name:'Soil probe — Tomato Block', zone:'tomato', status:'offline', battery:'—', lastSeen:'awaiting install'},
  {name:'Soil probe — Spinach Bed', zone:'spinach', status:'offline', battery:'—', lastSeen:'awaiting install'},
  {name:'Soil probe — Pepper Tunnel', zone:'pepper', status:'offline', battery:'—', lastSeen:'awaiting install'},
  {name:'Camera Node 1', zone:'tomato', status:'offline', battery:'—', lastSeen:'awaiting install'},
  {name:'Camera Node 2', zone:'cabbage', status:'offline', battery:'—', lastSeen:'awaiting install'}
];

const NUTRIENT_DEMO = [
  {zone:'Tomato Block', n:'Adequate', p:'Adequate', k:'Slightly low', note:'Consider potassium top-dress before fruit set'},
  {zone:'Cabbage Rows', n:'Trending low', p:'Adequate', k:'Adequate', note:'Nitrogen trending low — top-dress within ~5 days'},
  {zone:'Carrot Bed', n:'Adequate', p:'Adequate', k:'Adequate', note:'No action needed'}
];

let AUTOMATION_DEVICES = [
  {id:'pump1', name:'Irrigation Pump — Tomato Block', zone:'tomato', state:false},
  {id:'pump2', name:'Irrigation Pump — Cabbage & Carrot', zone:'cabbage', state:false},
  {id:'valve1', name:'Valve — Spinach Bed drip line', zone:'spinach', state:true},
  {id:'valve2', name:'Valve — Pepper Tunnel drip line', zone:'pepper', state:false},
  {id:'fan1', name:'Ventilation Fan — Pepper Tunnel', zone:'pepper', state:false}
];

const AUTOMATION_POLICIES = [
  'If soil moisture < 30% for <strong>Tomato Block</strong> → run Pump 1 for 15 minutes',
  'If humidity > 85% in <strong>Pepper Tunnel</strong> → run Fan for 10 minutes',
  'If rain forecast > 60% in next 24h → skip scheduled irrigation farm-wide'
];

let ACTION_LOG = [
  {t:'08:14', who:'Automation', text:'Valve — Spinach Bed drip line turned ON (policy: morning cycle)'},
  {t:'07:02', who:'Automation', text:'Skipped scheduled irrigation — rain forecast 68%'},
  {t:'Yesterday', who:'Farmer', text:'Marked "Irrigate River-adjacent bed" as done'}
];

function confLabel(n){
  const labels = {1:'Low',2:'Moderate',3:'High',4:'Very high'};
  return labels[n] || '';
}
function evidenceHTML(items){ return items.map(e => `<div class="evidence-item"><div class="k">${e.k}</div><div class="v ${e.trend||''}">${e.v}</div></div>`).join(''); }
function cardHTML(rec, variant, idx){
  const cls = 'card ' + (variant==='alert'?'alert':variant==='demo'?'demo':(rec.kind==='priority'?'priority':''));
  const tag = variant==='alert' ? `<div class="stamp">Needs decision</div>` : (variant==='demo' ? `<div class="stamp">Mock preview</div>` : '');
  const num = String((idx!==undefined?idx:0)+1).padStart(2,'0');
  return `<div class="${cls}" data-zone="${rec.zone}">
  <div class="card-index"><span class="idx-num">${num}</span><span class="idx-conf">${confLabel(rec.confidence)}</span></div>
  <div class="card-body">
    <div class="card-top">${tag}<div class="card-title">${rec.title}</div><div class="card-meta">${rec.meta}</div></div>
    <div class="card-actions"><button class="link-action">Mark done</button><span class="sep">·</span><button class="link-action">Remind me later</button></div>
    <details class="why"><summary>Why is this being shown?</summary><div class="why-body"><div class="reasoning">${rec.reasoning}</div><div class="evidence-grid">${evidenceHTML(rec.evidence)}</div></div></details>
  </div></div>`;
}

function sparkline(seed){
  let v = 40, pts = [];
  for(let i=0;i<24;i++){ v += (Math.sin(i/3+seed)*3) + (Math.random()*4-2); v = Math.max(15,Math.min(70,v)); pts.push(v); }
  const w=200,h=44; const step = w/(pts.length-1);
  const d = pts.map((p,i)=>`${i===0?'M':'L'} ${(i*step).toFixed(1)} ${(h - (p/70*h)).toFixed(1)}`).join(' ');
  return {svg:`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="#0d6b5f" stroke-width="2.5"/></svg>`, last: pts[pts.length-1]};
}

let deviceSortOnlineFirst = false;
function renderDeviceTable(){
  const rows = [...DEVICE_STATUS];
  if(deviceSortOnlineFirst) rows.sort((a,b) => (a.status==='online'?0:1) - (b.status==='online'?0:1));
  document.getElementById('device-table').innerHTML =
    `<tr><th>Device</th><th>Zone</th><th class="sortable" id="status-th">Status ${deviceSortOnlineFirst ? '▾' : '▸'}</th><th>Power</th><th>Last seen</th></tr>` +
    rows.map(d => `<tr><td>${d.name}</td><td>${d.zone}</td><td><span class="status-pill ${d.status}"><span class="d"></span>${d.status}</span></td><td>${d.battery}</td><td>${d.lastSeen}</td></tr>`).join('');
  document.getElementById('status-th').addEventListener('click', () => {
    deviceSortOnlineFirst = !deviceSortOnlineFirst;
    renderDeviceTable();
  });
}

function renderInsightsList(recs){
  const sortSel = document.getElementById('insight-sort');
  const filterSel = document.getElementById('insight-filter');
  const sortVal = sortSel ? sortSel.value : 'confidence';
  const filterVal = filterSel ? filterSel.value : 'all';
  let list = filterVal === 'all' ? recs.slice() : recs.filter(r => r.kind === filterVal);
  const urgencyRank = {alert:3, priority:2, insight:1};
  if(sortVal === 'confidence') list.sort((a,b) => b.confidence - a.confidence);
  else if(sortVal === 'urgency') list.sort((a,b) => urgencyRank[b.kind] - urgencyRank[a.kind]);
  else if(sortVal === 'zone') list.sort((a,b) => (CROPS[a.zone]?.name||'').localeCompare(CROPS[b.zone]?.name||''));
  document.getElementById('insights-list').innerHTML = list.length
    ? list.map((r,i) => cardHTML(r, r.kind, i)).join('')
    : '<p class="rail-note">No insights match this filter.</p>';
}
function initInsightToolbar(){
  const rerender = () => { if(LIVE.ready) renderInsightsList(buildRecommendations()); };
  document.getElementById('insight-sort').addEventListener('change', rerender);
  document.getElementById('insight-filter').addEventListener('change', rerender);
}

function buildAll(){
  if(!LIVE.ready) return;
  const RECS = buildRecommendations();

const CROP_ICONS = {
  tomato: '<path d="M10 5c.5-1 1.7-1.8 2-1.8s1.5.8 2 1.8"/><circle cx="12" cy="14" r="7"/><path d="M9 10c1-1 4-1 5 0"/>',
  spinach: '<path d="M12 21c-5-2-7-7-6-13 6-1 11 1 13 6-3 6-7 7-7 7z"/><path d="M8 10c3 2 5 5 4 10"/>',
  pepper: '<path d="M9 4c1 0 1.5 1 1.5 2"/><path d="M10 6c4 0 7 3 6 7-1 5-5 8-8 6-3-2-3-7-1-11 .8-1.5 2-2 3-2z"/>',
  cabbage: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><path d="M12 8v-2M12 20v-2M8 12H6M18 12h-2"/>',
  carrot: '<path d="M12 4v3M9 4.5l1.5 3M15 4.5L13.5 7.5"/><path d="M12 8c3 0 4 3 3 6-1 3.5-2.5 6-3 6s-2-2.5-3-6c-1-3 0-6 3-6z"/>'
};
document.getElementById('zone-tiles').innerHTML = Object.entries(CROPS).map(([id,cfg]) => {
    const s = fetchSensorData(id); const status = statusFor(id);
    return `<div class="zone-tile status-${status} clickable" data-zone="${id}" role="button" tabindex="0">
      <div class="zone-tile-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${CROP_ICONS[id]}</svg></div>
      <div class="zt-name">${cfg.name}</div>
      <div class="zt-reading">${s.moisturePct.toFixed(1)}<span class="unit">%</span></div>
      <div class="zt-target">target ${cfg.moistureMin}%+</div>
    </div>`;
  }).join('');
  document.querySelectorAll('#zone-tiles .zone-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const sideBtn = document.querySelector(`.rail .zone-item[data-zone="${tile.dataset.zone}"]`);
      if(sideBtn) sideBtn.click();
      const aiAreaBtn = document.querySelector('.area-btn[data-area="ai"]');
      if(aiAreaBtn && !aiAreaBtn.classList.contains('active')) aiAreaBtn.click();
      document.querySelector('.tab[data-tab="insights"]')?.click();
    });
    tile.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tile.click(); } });
  });
  Object.keys(CROPS).forEach(id => { const el = document.getElementById('dot-'+id); if(el) el.className = 'zone-status ' + statusFor(id); });

  const priority = SETTINGS.alertNotifications
    ? RECS.filter(r => r.kind==='priority' || r.kind==='alert').slice(0,4)
    : RECS.filter(r => r.kind==='priority').slice(0,4);
  document.getElementById('priority-list').innerHTML = priority.map((r,i) => cardHTML(r, r.kind, i)).join('') || '<p class="rail-note">Nothing urgent right now.</p>';
  renderInsightsList(RECS);
  document.getElementById('insight-count').textContent = RECS.length + ' items';
  const alerts = RECS.filter(r => r.kind==='alert');
  document.getElementById('alerts-list').innerHTML = alerts.length ? alerts.map((r,i) => cardHTML(r,'alert',i)).join('') : '<p class="rail-note">No hard-threshold alerts right now.</p>';
  document.getElementById('alert-count').textContent = (SETTINGS.alertNotifications && alerts.length) ? `(${alerts.length})` : '';
  document.getElementById('irrigation-list').innerHTML = RECS.filter(r=>r.id.includes('moisture')).map((r,i) => cardHTML(r, r.kind, i)).join('') || '<p class="rail-note">No irrigation action needed right now.</p>';

  const today = new Date();
  document.getElementById('harvest-timeline').innerHTML = Object.entries(CROPS).map(([id,cfg]) => {
    const start=10, end=Math.min(95, 10+(cfg.daysToMaturity/90*100));
    const harvestDate = new Date(today.getTime() + cfg.daysToMaturity*86400000);
    const windowStart = new Date(harvestDate.getTime() - 3*86400000);
    const windowEnd = new Date(harvestDate.getTime() + 3*86400000);
    const label = harvestDate.toLocaleDateString('en-ZA',{month:'short',day:'numeric'});
    const rangeLabel = `${windowStart.toLocaleDateString('en-ZA',{month:'short',day:'numeric'})} – ${windowEnd.toLocaleDateString('en-ZA',{month:'short',day:'numeric'})}`;
    return `<div class="timeline-row clickable" data-zone="${id}" tabindex="0">
      <div class="timeline-label"><div class="name">${cfg.name}</div><div class="crop">${cfg.crop}</div></div>
      <div>
        <div class="timeline-track"><div class="timeline-window" style="left:${start}%;width:${end-start}%;" title="Predicted window: ${rangeLabel} (${cfg.daysToMaturity} days out)">~${label}</div></div>
        <div class="timeline-detail">Predicted window: <strong>${rangeLabel}</strong> · ${cfg.daysToMaturity} days from typical planting</div>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll('#harvest-timeline .timeline-row').forEach(row => {
    row.addEventListener('click', () => row.classList.toggle('expanded'));
    row.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); row.classList.toggle('expanded'); } });
  });

  // Sensors tab
  renderDeviceTable();

  document.getElementById('spark-grid').innerHTML = Object.entries(CROPS).map(([id,cfg],i) => {
    const {svg,last} = sparkline(i);
    return `<div class="spark-card"><div class="head"><span class="name">${cfg.name} moisture</span><span class="val">${last.toFixed(0)}%</span></div>${svg}</div>`;
  }).join('');

  // Cameras tab
  document.getElementById('cam-grid').innerHTML = CAM_NODES.map(c => `
    <div class="cam-card clickable" data-zone="${c.zone}" tabindex="0">
      <div class="cam-thumb"><span class="badge">Demo image</span>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#20281c" stroke-width="1.4"><path d="M12 2C8 6 5 10 5 14a7 7 0 0014 0c0-4-3-8-7-12z"/></svg>
      </div>
      <div class="cam-body">
        <div class="title">${c.name}</div>
        <div class="meta">${c.note}</div>
        <div class="health-bar ${c.status}"><div class="fill" style="width:${c.health}%"></div></div>
        <div class="health-label">Plant health index: ${c.health}/100 · click to expand</div>
        <div class="cam-detail">
          <div class="evidence-grid">
            <div class="evidence-item"><div class="k">Last scan</div><div class="v">${c.lastScan}</div></div>
            <div class="evidence-item"><div class="k">Canopy coverage</div><div class="v">${c.coverage}</div></div>
            <div class="evidence-item"><div class="k">Leaf area trend</div><div class="v ${c.leafArea.startsWith('+')?'up':'down'}">${c.leafArea}</div></div>
          </div>
          <button class="link-action cam-jump" data-zone="${c.zone}">View this bed's insights →</button>
        </div>
      </div>
    </div>`).join('');
  document.querySelectorAll('#cam-grid .cam-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('.cam-jump')) return;
      card.classList.toggle('expanded');
    });
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.classList.toggle('expanded'); } });
  });
  document.querySelectorAll('.cam-jump').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sideBtn = document.querySelector(`.rail .zone-item[data-zone="${btn.dataset.zone}"]`);
      if(sideBtn) sideBtn.click();
      const aiAreaBtn = document.querySelector('.area-btn[data-area="ai"]');
      if(aiAreaBtn && !aiAreaBtn.classList.contains('active')) aiAreaBtn.click();
      document.querySelector('.tab[data-tab="insights"]')?.click();
    });
  });
  document.getElementById('analysis-list').innerHTML = CAMERA_DEMO.map((r,i) => cardHTML(r,'demo',i)).join('');

  // Nutrients
  document.getElementById('nutrient-grid').innerHTML = NUTRIENT_DEMO.map(n => `
    <div class="nutrient-card"><div class="name">${n.zone}</div>
      <div class="npk-row">Nitrogen (N) <strong>${n.n}</strong></div>
      <div class="npk-row">Phosphorus (P) <strong>${n.p}</strong></div>
      <div class="npk-row">Potassium (K) <strong>${n.k}</strong></div>
      <div class="health-label" style="margin-top:6px;">${n.note}</div>
    </div>`).join('');

  // Automation
  renderAutomation();

  wireZoneFilter();
}

function renderAutomation(){
  document.getElementById('device-grid').innerHTML = AUTOMATION_DEVICES.map(d => `
    <div class="device-card"><div><div class="name">${d.name}</div><div class="zone">${CROPS[d.zone]?CROPS[d.zone].name:d.zone}</div></div>
      <label class="switch"><input type="checkbox" data-device="${d.id}" ${d.state?'checked':''}><span class="slider"></span></label>
    </div>`).join('');

  document.getElementById('policy-list').innerHTML = AUTOMATION_POLICIES.map(p => `<div class="policy-row"><div class="rule">${p}</div><div class="policy-state">Active</div></div>`).join('');

  document.getElementById('log-list').innerHTML = ACTION_LOG.map(l => `<div class="log-row"><div class="t">${l.t}</div><div class="who">${l.who}</div><div>${l.text}</div></div>`).join('');

  document.querySelectorAll('[data-device]').forEach(input => {
    input.onchange = (e) => {
      const dev = AUTOMATION_DEVICES.find(d => d.id === e.target.dataset.device);
      dev.state = e.target.checked;
      const now = new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});
      ACTION_LOG.unshift({t:now, who:'You', text:`${dev.name} switched ${dev.state?'ON':'OFF'}`});
      renderAutomation();
    };
  });
}

// =====================================================================
// AI ASSISTANT — demo pattern-matching over the same live/demo data.
// Real version will call the AI backend's orchestration + Farm Memory.
// =====================================================================
const FARM_MEMORY = [
  {t:'2 days ago', who:'AI', text:'Recommended irrigation for Tomato Block — moisture 9% below target. Farmer approved; pump ran 20 min.'},
  {t:'4 days ago', who:'AI', text:'Flagged fungal-risk humidity in Cabbage Rows. Farmer reviewed, no action taken — humidity dropped naturally next day.'},
  {t:'6 days ago', who:'AI', text:'Predicted harvest window for East bed shifted 3 days earlier based on growing-degree days.'},
  {t:'1 week ago', who:'AI', text:'Detected possible pest activity in Cabbage Rows (mock camera preview) — flagged for scouting.'}
];

function answerFarmQuestion(q){
  const ql = q.toLowerCase();
  const zoneMatch = Object.entries(CROPS).find(([id,cfg]) => ql.includes(id) || ql.includes(cfg.crop.toLowerCase()));
  const zoneId = zoneMatch ? zoneMatch[0] : null;

  if(!LIVE.ready){
    return {answer:"Still loading live weather and soil data — try again in a moment.", evidence:[], reason:'', recommendation:''};
  }

  const allRecs = buildRecommendations();
  const recsForZone = zoneId ? allRecs.filter(r => r.zone === zoneId) : allRecs;
  const alerts = allRecs.filter(r => r.kind === 'alert');
  const cfg = CROPS[zoneId || 'tomato'];
  const s = fetchSensorData(zoneId || 'tomato');

  // --- automation / hardware state ---
  if(ql.includes('pump') || ql.includes('valve') || ql.includes('fan') || ql.includes('automation') || ql.includes('irrigating right now') || ql.includes('is it running')){
    const matches = zoneId ? AUTOMATION_DEVICES.filter(d => d.zone === zoneId) : AUTOMATION_DEVICES;
    const relevant = matches.length ? matches : AUTOMATION_DEVICES;
    return {
      answer: relevant.length ? `Here's what the Automation Centre shows${zoneId?` for ${cfg.name}`:''}.` : `No automation devices match that.`,
      evidence: relevant.map(d => `${d.name}: ${d.state ? 'ON' : 'OFF'}`),
      reason: 'Automation Centre reflects the last switch state — this demo doesn\'t control real hardware yet.',
      recommendation: 'Open the Automation Centre tab to toggle devices directly.'
    };
  }

  // --- pest / camera / plant health ---
  if(ql.includes('pest') || ql.includes('camera') || ql.includes('disease') || ql.includes('bug') || ql.includes('insect') || (ql.includes('plant health') )){
    const cams = zoneId ? CAM_NODES.filter(c => c.zone === zoneId) : CAM_NODES;
    const flagged = CAMERA_DEMO.filter(c => !zoneId || c.zone === zoneId);
    return {
      answer: cams.length ? `Camera watch${zoneId?` for ${cfg.name}`:' across all beds'}: ${cams.map(c=>`${c.name.split('—')[1]?.trim()||c.name} at ${c.health}/100`).join(', ')}.` : `No camera coverage for that bed yet.`,
      evidence: [...cams.map(c => `${c.name}: health ${c.health}/100 (${c.status})`), ...flagged.map(f => `Flag: ${f.title}`)],
      reason: 'No physical cameras are installed yet — these are mock detections showing the intended format.',
      recommendation: flagged.length ? 'Check the Cameras & Plant Health tab for the full detection card and evidence.' : 'Nothing flagged right now.'
    };
  }

  // --- harvest timing ---
  if(ql.includes('harvest') || ql.includes('ready') || ql.includes('pick')){
    const target = zoneId ? [[zoneId,cfg]] : Object.entries(CROPS);
    const today = new Date();
    const lines = target.map(([id,c]) => {
      const d = new Date(today.getTime() + c.daysToMaturity*86400000);
      return `${c.name}: ~${d.toLocaleDateString('en-ZA',{month:'short',day:'numeric'})} (${c.daysToMaturity} days from typical planting)`;
    });
    return {
      answer: zoneId ? `${cfg.name} is projected for harvest in about ${cfg.daysToMaturity} days.` : `Here's the projected harvest window for each bed.`,
      evidence: lines,
      reason: 'Based on typical days-to-maturity per crop, not a tracked planting date yet.',
      recommendation: 'Link real planting dates in Predicted Harvest for an exact window.'
    };
  }

  // --- alerts / problems / urgent ---
  if(ql.includes('alert') || ql.includes('problem') || ql.includes('urgent') || ql.includes('wrong with')){
    if(alerts.length === 0){
      return {answer:'No active alerts right now.', evidence:[`Checked ${allRecs.length} live recommendation${allRecs.length===1?'':'s'} against alert thresholds`], reason:'Nothing has crossed a hard threshold.', recommendation:'No action needed.'};
    }
    return {
      answer:`${alerts.length} active alert${alerts.length===1?'':'s'} right now.`,
      evidence: alerts.map(a => `${a.title} (${a.meta})`),
      reason: 'These crossed a hard moisture, heat, or humidity threshold.',
      recommendation: 'Open the Alerts tab for full evidence and reasoning on each.'
    };
  }

  // --- watering / irrigation ---
  if(ql.includes('water') || ql.includes('irrigat')){
    const deficit = cfg.moistureMin - s.moisturePct;
    if(deficit > 3){
      return {
        answer:`Yes — ${cfg.name} is ${deficit.toFixed(1)} percentage points below its ${cfg.moistureMin}% moisture target.`,
        evidence:[`Soil moisture: ${s.moisturePct.toFixed(1)}%`, `Target: ${cfg.moistureMin}%`, `Rain forecast (72h): ${LIVE.rain72}%`],
        reason:`Low rain probability means the deficit won't correct itself soon.`,
        recommendation:`Irrigate ${cfg.name} within the next day.`
      };
    }
    return { answer:`Not urgently — ${cfg.name} is at ${s.moisturePct.toFixed(1)}%, above its ${cfg.moistureMin}% target.`, evidence:[`Soil moisture: ${s.moisturePct.toFixed(1)}%`, `Rain forecast (72h): ${LIVE.rain72}%`], reason:'Moisture is within the comfortable range for this crop.', recommendation:'No irrigation action needed today.' };
  }

  // --- stress / general plant condition ---
  if(ql.includes('stress') || ql.includes('slow') || ql.includes('wrong') || ql.includes('health')){
    const deficit = cfg.moistureMin - s.moisturePct; const heat = s.tempC - cfg.tempMax;
    const causes = [];
    if(deficit > 3) causes.push(`soil moisture running ${deficit.toFixed(1)} points below target`);
    if(heat > 0) causes.push(`air temperature ${fmtTempDelta(heat)} above this crop's comfort ceiling`);
    if(LIVE.humidity > cfg.humidityFungal) causes.push(`humidity above the fungal-risk threshold`);
    const cam = CAM_NODES.find(c => c.zone === (zoneId||'tomato'));
    if(cam && cam.health < 80) causes.push(`camera plant-health index reading ${cam.health}/100`);
    return {
      answer: causes.length ? `${cfg.name} shows early stress signals.` : `${cfg.name} looks within normal range right now.`,
      evidence:[`Soil moisture: ${s.moisturePct.toFixed(1)}% (target ${cfg.moistureMin}%)`, `Air temperature: ${fmtTemp(LIVE.tempC)} (ceiling ${fmtTemp(cfg.tempMax)})`, `Humidity: ${Math.round(LIVE.humidity)}% (fungal risk above ${cfg.humidityFungal}%)`, ...(cam?[`Camera plant-health index: ${cam.health}/100`]:[])],
      reason: causes.length ? causes.join('; ') + '.' : 'All tracked conditions are within threshold.',
      recommendation: causes.length ? 'Review the Insights tab for the matching recommendation card and evidence.' : 'No action needed.'
    };
  }

  // --- history / memory ---
  if(ql.includes('history') || ql.includes('before') || ql.includes('past') || ql.includes('last time') || ql.includes('memory')){
    const relevant = zoneId ? FARM_MEMORY.filter(m => m.text.toLowerCase().includes(cfg.name.toLowerCase()) || m.text.toLowerCase().includes(zoneId)) : FARM_MEMORY;
    const shown = relevant.length ? relevant : FARM_MEMORY;
    return {
      answer: `${shown.length} relevant record${shown.length===1?'':'s'} in Farm Memory.`,
      evidence: shown.map(m => `${m.t}: ${m.text}`),
      reason: 'Pulled from Farm Memory — the running log of past AI decisions and outcomes.',
      recommendation: 'Open the Farm Memory tab for the full history.'
    };
  }

  // --- general status / summary fallback ---
  if(!zoneMatch && (ql.includes('status') || ql.includes('going on') || ql.includes('summary') || ql.includes('overview') || ql.trim().length < 3)){
    const top = allRecs.slice(0,3);
    return {
      answer: `Farm-wide: ${allRecs.length} live insight${allRecs.length===1?'':'s'}, ${alerts.length} alert${alerts.length===1?'':'s'}.`,
      evidence: top.map(r => `${r.title} (${r.meta})`),
      reason: 'Generated from current weather, soil and camera-demo data across every bed.',
      recommendation: alerts.length ? 'Check the Alerts tab first.' : 'Check the Overview tab for full detail.'
    };
  }

  return {
    answer:`Here's the current status for ${cfg.name}.`,
    evidence:[`Soil moisture: ${s.moisturePct.toFixed(1)}%`, `Air temperature: ${fmtTemp(LIVE.tempC)}`, `Humidity: ${Math.round(LIVE.humidity)}%`, ...(recsForZone.length?[`${recsForZone.length} live insight(s) for this bed`]:[])],
    reason:'General status check — no specific concern matched in your question.',
    recommendation:'Ask about watering, stress, pests, pumps, harvest timing, alerts, or past decisions for a more specific answer.'
  };
}

function pushChatMsg(role, content){
  const log = document.getElementById('chat-log');
  if(role === 'user'){
    log.insertAdjacentHTML('beforeend', `<div class="chat-msg user"><div class="bubble">${content}</div></div>`);
  }else{
    const c = content;
    log.insertAdjacentHTML('beforeend', `<div class="chat-msg ai"><div class="bubble">
      <div class="answer">${c.answer}</div>
      ${c.evidence.length ? `<div class="block"><div class="label">Evidence</div><ul>${c.evidence.map(e=>`<li>${e}</li>`).join('')}</ul></div>` : ''}
      ${c.reason ? `<div class="block"><div class="label">Reason</div>${c.reason}</div>` : ''}
      ${c.recommendation ? `<div class="block"><div class="label">Recommendation</div><div class="rec">${c.recommendation}</div></div>` : ''}
    </div></div>`);
    const spoken = [c.answer, c.reason, c.recommendation].filter(Boolean).join('. ');
    if(spoken) speakText(spoken);
  }
  log.scrollTop = log.scrollHeight;
}

function askFarm(q){
  if(!q.trim()) return;
  pushChatMsg('user', q);
  setTimeout(() => pushChatMsg('ai', answerFarmQuestion(q)), 250);
}

// =====================================================================
// IMAGE UPLOAD — reads a photo locally in the browser (FileReader, no
// upload to any server) and returns a mock plant-health analysis in the
// same Answer/Evidence/Reason/Recommendation shape. There is no real
// vision model behind this — it's a placeholder for what a real
// image-analysis backend would return, and every response says so.
// =====================================================================
const IMAGE_FINDINGS = [
  {
    answer: "This looks like early-stage leaf discoloration, possibly nutrient stress.",
    evidence: ['Yellowing concentrated on older, lower leaves', 'Leaf margins intact, no clear lesion pattern'],
    reason: "Interveinal yellowing on lower leaves is a common visual pattern for nitrogen or magnesium deficiency, though it can also follow overwatering.",
    recommendation: "Cross-check with a soil nutrient reading before treating — this is a visual guess, not a lab result."
  },
  {
    answer: "Leaf spotting consistent with early blight.",
    evidence: ['Concentric dark spots on lower leaves', 'Surrounding tissue slightly yellowed'],
    reason: "This ringed lesion pattern is typical of fungal leaf-spot disease, which often starts on older, lower leaves in humid conditions.",
    recommendation: "Remove affected leaves, improve airflow, and confirm with a closer inspection if it spreads."
  },
  {
    answer: "No clear signs of disease or pest damage — this looks healthy.",
    evidence: ['Even leaf color across the frame', 'No visible lesions, holes, or webbing'],
    reason: "Leaf color and structure look within normal range for this growth stage.",
    recommendation: "No action needed — keep monitoring as usual."
  },
  {
    answer: "Possible pest damage — irregular holes visible on the leaves.",
    evidence: ['Irregular chewed-edge holes', 'No insect visible in this frame'],
    reason: "Chewed leaf margins without a visible pest often points to a nighttime feeder like caterpillars or slugs.",
    recommendation: "Check the underside of leaves at dusk, or compare against the Cameras tab's plant-health index."
  }
];

function generatePlantImageAnalysis(){
  const pick = IMAGE_FINDINGS[Math.floor(Math.random()*IMAGE_FINDINGS.length)];
  const confidence = Math.floor(50 + Math.random()*40);
  return {
    answer: pick.answer,
    evidence: [`Visual match confidence: ${confidence}% (demo estimate)`, ...pick.evidence, 'No real vision model connected — this is a placeholder response'],
    reason: pick.reason,
    recommendation: pick.recommendation
  };
}

function askFarmWithImage(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const log = document.getElementById('chat-log');
    log.insertAdjacentHTML('beforeend', `<div class="chat-msg user"><div class="bubble">Uploaded a photo for analysis<img class="chat-img" src="${dataUrl}" alt="Uploaded plant photo"></div></div>`);
    log.scrollTop = log.scrollHeight;
    const analyzingId = 'analyzing-' + Date.now();
    log.insertAdjacentHTML('beforeend', `<div class="chat-msg ai" id="${analyzingId}"><div class="bubble"><div class="chat-analyzing">Analyzing image…</div></div></div>`);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      document.getElementById(analyzingId)?.remove();
      pushChatMsg('ai', generatePlantImageAnalysis());
    }, 900);
  };
  reader.readAsDataURL(file);
}

function initAssistant(){
  const floatPanel = document.getElementById('chat-float');
  const openPanel = () => floatPanel.classList.add('open');

  document.getElementById('chat-send').onclick = () => {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) { openPanel(); return; }
    openPanel();
    askFarm(input.value); input.value = '';
  };
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){ const input = e.target; if(input.value.trim()){ openPanel(); askFarm(input.value); input.value=''; } }
  });
  document.getElementById('chat-input').addEventListener('focus', openPanel);
  document.querySelectorAll('.chip').forEach(chip => { chip.onclick = () => { openPanel(); askFarm(chip.dataset.q); }; });

  document.getElementById('chat-fab').addEventListener('click', () => {
    floatPanel.classList.toggle('open');
  });
  document.getElementById('chat-close').addEventListener('click', () => {
    floatPanel.classList.remove('open');
    stopSpeaking();
  });

  const voiceBtn = document.getElementById('chat-voice-toggle');
  if(!speechSupported){
    voiceBtn.classList.add('muted');
    voiceBtn.title = 'Voice replies not supported in this browser';
    voiceBtn.disabled = true;
  } else {
    updateVoiceToggleUI();
    voiceBtn.addEventListener('click', () => {
      SETTINGS.voiceEnabled = !SETTINGS.voiceEnabled;
      saveSettings();
      updateVoiceToggleUI();
      if(!SETTINGS.voiceEnabled) stopSpeaking();
    });
  }

  initVoiceInput(openPanel);

  document.getElementById('chat-image-btn').addEventListener('click', () => {
    openPanel();
    document.getElementById('chat-image-input').click();
  });
  document.getElementById('chat-image-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) askFarmWithImage(file);
    e.target.value = '';
  });

  document.getElementById('memory-list').innerHTML = FARM_MEMORY.map(m => `<div class="log-row"><div class="t">${m.t}</div><div class="who">${m.who}</div><div>${m.text}</div></div>`).join('');

  document.getElementById('report-tiles').innerHTML = `
    <div class="zone-tile status-ok"><div class="zt-name">Recommendations (7d)</div><div class="zt-reading" style="font-size:20px">12</div><div class="zt-target">generated</div></div>
    <div class="zone-tile status-ok"><div class="zt-name">Approved by farmer</div><div class="zt-reading" style="font-size:20px">9<span class="unit">/12</span></div><div class="zt-target">approved</div></div>
    <div class="zone-tile status-watch"><div class="zt-name">Alerts raised</div><div class="zt-reading" style="font-size:20px">3</div><div class="zt-target">this week</div></div>
    <div class="zone-tile status-ok"><div class="zt-name">Avg. confidence</div><div class="zt-reading" style="font-size:20px">High</div><div class="zt-target">across 7d</div></div>`;
  document.getElementById('report-history').innerHTML = FARM_MEMORY.map(m => `<div class="log-row"><div class="t">${m.t}</div><div class="who">${m.who}</div><div>${m.text}</div></div>`).join('');
}

function wireZoneFilter(){
  document.querySelectorAll('.zone-item').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.zone-item').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const zone = btn.dataset.zone;
      document.querySelectorAll('.card').forEach(card => { card.style.display = (zone==='all' || card.dataset.zone===zone) ? '' : 'none'; });
    };
  });
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.area-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const area = btn.dataset.area;
    document.querySelectorAll('.area-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-groups .tab-group').forEach(g=>g.classList.remove('active-area'));
    const group = document.querySelector('.tab-groups .tab-group[data-area="'+area+'"]');
    if(group){
      group.classList.add('active-area');
      const firstTab = group.querySelector('.tab');
      if(firstTab) firstTab.click();
    }
  });
});

function initSettings(){
  const drawer = document.getElementById('settings-drawer');
  const backdrop = document.getElementById('settings-backdrop');
  const openDrawer = () => { drawer.classList.add('open'); backdrop.classList.add('open'); };
  const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); };

  document.getElementById('settings-btn').addEventListener('click', openDrawer);
  document.getElementById('settings-close').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  function applyToControls(){
    document.getElementById('set-farmname').value = SETTINGS.farmName;
    document.getElementById('set-location').value = SETTINGS.location;
    document.querySelectorAll('#set-accent .swatch').forEach(b => b.classList.toggle('active', b.dataset.val === SETTINGS.accent));
    document.getElementById('set-alerts').checked = SETTINGS.alertNotifications;
    document.getElementById('ch-email').checked = SETTINGS.channels.email;
    document.getElementById('ch-sms').checked = SETTINGS.channels.sms;
    document.getElementById('ch-whatsapp').checked = SETTINGS.channels.whatsapp;
    document.getElementById('ch-inapp').checked = SETTINGS.channels.inapp;
    document.getElementById('set-frequency').value = SETTINGS.frequency;
    document.getElementById('set-quiet').checked = SETTINGS.quietHours;
    document.getElementById('quiet-hours-row').style.display = SETTINGS.quietHours ? '' : 'none';
    document.getElementById('quiet-start').value = SETTINGS.quietStart;
    document.getElementById('quiet-end').value = SETTINGS.quietEnd;
    document.querySelectorAll('#set-units .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === SETTINGS.units));
    document.querySelectorAll('#set-theme .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === SETTINGS.theme));
    document.querySelectorAll('#set-sensitivity .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === SETTINGS.sensitivity));
  }
  applyToControls();

  document.getElementById('set-farmname').addEventListener('input', (e) => { SETTINGS.farmName = e.target.value; applyFarmLabel(); saveSettings(); });
  document.getElementById('set-location').addEventListener('input', (e) => { SETTINGS.location = e.target.value; applyFarmLabel(); saveSettings(); });
  document.querySelectorAll('#set-accent .swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#set-accent .swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SETTINGS.accent = btn.dataset.val;
      applyAccentTheme();
      saveSettings();
    });
  });

  function persistAndRerender(){
    saveSettings();
    if(LIVE.ready) buildAll();
  }

  document.getElementById('set-alerts').addEventListener('change', (e) => { SETTINGS.alertNotifications = e.target.checked; persistAndRerender(); });
  document.getElementById('ch-email').addEventListener('change', (e) => { SETTINGS.channels.email = e.target.checked; saveSettings(); });
  document.getElementById('ch-sms').addEventListener('change', (e) => { SETTINGS.channels.sms = e.target.checked; saveSettings(); });
  document.getElementById('ch-whatsapp').addEventListener('change', (e) => { SETTINGS.channels.whatsapp = e.target.checked; saveSettings(); });
  document.getElementById('ch-inapp').addEventListener('change', (e) => { SETTINGS.channels.inapp = e.target.checked; saveSettings(); });
  document.getElementById('set-frequency').addEventListener('change', (e) => { SETTINGS.frequency = e.target.value; saveSettings(); });
  document.getElementById('set-quiet').addEventListener('change', (e) => {
    SETTINGS.quietHours = e.target.checked;
    document.getElementById('quiet-hours-row').style.display = SETTINGS.quietHours ? '' : 'none';
    saveSettings();
  });
  document.getElementById('quiet-start').addEventListener('change', (e) => { SETTINGS.quietStart = e.target.value; saveSettings(); });
  document.getElementById('quiet-end').addEventListener('change', (e) => { SETTINGS.quietEnd = e.target.value; saveSettings(); });

  function wireSeg(containerId, key, onChange){
    document.querySelectorAll('#'+containerId+' .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#'+containerId+' .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SETTINGS[key] = btn.dataset.val;
        if(onChange) onChange();
        saveSettings();
      });
    });
  }
  wireSeg('set-units', 'units', persistAndRerender);
  wireSeg('set-theme', 'theme');
  wireSeg('set-sensitivity', 'sensitivity', persistAndRerender);

  document.getElementById('settings-reset').addEventListener('click', () => {
    SETTINGS = {...SETTINGS_DEFAULTS};
    saveSettings();
    applyToControls();
    applyAccentTheme();
    applyFarmLabel();
    if(LIVE.ready) buildAll();
  });
}

fetchWeather();
initAssistant();
initSettings();
initInsightToolbar();
setInterval(fetchWeather, 10*60*1000);