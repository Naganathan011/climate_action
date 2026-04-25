/* =============================================
   CLIMATE CHANGE WEBSITE — script.js
   Features: Smooth scroll, mobile menu,
   scroll reveal, navbar, 5 calculators
   ============================================= */

/* ---- 1. NAVBAR SCROLL EFFECT ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ---- 2. HAMBURGER MENU ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ---- 3. SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- 4. SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay || '0', 10));
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- 5. ACTIVE NAV HIGHLIGHT ---- */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => { a.style.color = ''; a.style.fontWeight = ''; });
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) { active.style.color = 'var(--green-mid)'; active.style.fontWeight = '700'; }
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObserver.observe(s));

/* ---- 6. HERO TYPING EFFECT ---- */
const eyebrow = document.querySelector('.hero-eyebrow');
if (eyebrow) {
  const txt = eyebrow.textContent;
  eyebrow.textContent = '';
  let i = 0;
  const type = () => { if (i < txt.length) { eyebrow.textContent += txt[i++]; setTimeout(type, 65); } };
  setTimeout(type, 800);
}

/* ---- 7. HERO PARALLAX ---- */
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
  if (hero && window.scrollY < window.innerHeight)
    hero.style.backgroundPositionY = `${50 + window.scrollY * 0.03}%`;
});

/* ---- 8. CALCULATOR TABS ---- */
document.querySelectorAll('.calc-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
  });
});

/* ---- HELPER: show result ---- */
function showResult(id, html, type) {
  const el = document.getElementById(id);
  el.innerHTML = '<div class="result-box ' + (type||'') + '">' + html + '</div>';
  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   CALCULATOR 1 — AIR POLLUTION / AQI
   US EPA linear interpolation breakpoints
   ============================================================ */
function calcPollution() {
  const pm25 = parseFloat(document.getElementById('pm25').value) || 0;
  const pm10 = parseFloat(document.getElementById('pm10').value) || 0;
  const co2  = parseFloat(document.getElementById('co2ppm').value) || 420;
  const no2  = parseFloat(document.getElementById('no2').value) || 0;
  const so2  = parseFloat(document.getElementById('so2').value) || 0;

  function pm25toAQI(c) {
    const bp = [
      [0,12,0,50],[12.1,35.4,51,100],[35.5,55.4,101,150],
      [55.5,150.4,151,200],[150.5,250.4,201,300],[250.5,350.4,301,400],[350.5,500.4,401,500]
    ];
    for (const [cLo,cHi,iLo,iHi] of bp)
      if (c >= cLo && c <= cHi) return Math.round(((iHi-iLo)/(cHi-cLo))*(c-cLo)+iLo);
    return 500;
  }
  function pm10toAQI(c) {
    const bp = [
      [0,54,0,50],[55,154,51,100],[155,254,101,150],
      [255,354,151,200],[355,424,201,300],[425,504,301,400],[505,604,401,500]
    ];
    for (const [cLo,cHi,iLo,iHi] of bp)
      if (c >= cLo && c <= cHi) return Math.round(((iHi-iLo)/(cHi-cLo))*(c-cLo)+iLo);
    return 500;
  }

  const aqiPM25 = pm25toAQI(pm25);
  const aqiPM10 = pm10toAQI(pm10);
  const overallAQI = Math.max(aqiPM25, aqiPM10);

  const categories = [
    { max:50,  label:'Good',             cls:'good',    color:'#27ae60' , advice:'Air quality is excellent. Enjoy outdoor activities freely.' },
    { max:100, label:'Moderate',         cls:'',        color:'#c8a000', advice:'Acceptable quality. Unusually sensitive individuals should limit prolonged exertion.' },
    { max:150, label:'Unhealthy for Sensitive Groups', cls:'warning', color:'#e67e22', advice:'Children, elderly & respiratory patients should reduce outdoor activity.' },
    { max:200, label:'Unhealthy',        cls:'warning', color:'#e74c3c', advice:'Everyone may experience health effects. Limit outdoor exertion.' },
    { max:300, label:'Very Unhealthy',   cls:'danger',  color:'#8e44ad', advice:'Health alert: everyone should avoid prolonged outdoor exertion.' },
    { max:500, label:'Hazardous',        cls:'danger',  color:'#7f0000', advice:'Emergency conditions. Stay indoors and seal windows.' }
  ];
  const cat = categories.find(c => overallAQI <= c.max) || categories[5];
  const needlePct = Math.min((overallAQI / 500) * 100, 100);

  const co2Status = co2 < 450 ? 'Near baseline — healthy' : co2 < 800 ? 'Elevated — ventilate space' : 'High — poor air quality';
  const no2Status = no2 < 40 ? 'WHO safe (<40 µg/m³)' : no2 < 200 ? 'Moderate' : 'Exceeds WHO limit';
  const so2Status = so2 < 20 ? 'Low — safe' : so2 < 100 ? 'Moderate' : 'High — respiratory risk';

  showResult('pollution-result', `
    <h4>📊 Air Quality Index Result</h4>
    <div class="result-main" style="color:${cat.color}">${overallAQI} — ${cat.label}</div>
    <div class="aqi-bar-wrap">
      <label>AQI Scale: 0 (Good) → 500 (Hazardous)</label>
      <div class="aqi-bar"><div class="aqi-needle" id="aqi-needle"></div></div>
    </div>
    <p><strong>Health Advice:</strong> ${cat.advice}</p>
    <ul>
      <li>PM2.5 AQI: ${aqiPM25} (input: ${pm25} µg/m³)</li>
      <li>PM10 AQI: ${aqiPM10} (input: ${pm10} µg/m³)</li>
      <li>CO₂ (${co2} ppm): ${co2Status}</li>
      <li>NO₂ (${no2} µg/m³): ${no2Status}</li>
      <li>SO₂ (${so2} µg/m³): ${so2Status}</li>
    </ul>
    <p style="margin-top:12px;font-size:0.82rem;opacity:0.65">Based on US EPA AQI formula (40 CFR Part 58). Always cross-check with local monitoring data.</p>
  `, cat.cls);

  setTimeout(() => {
    const needle = document.getElementById('aqi-needle');
    if (needle) needle.style.left = needlePct + '%';
  }, 120);
}

/* ============================================================
   CALCULATOR 2 — AFFORESTATION
   ============================================================ */
function calcAfforestation() {
  const co2Need  = parseFloat(document.getElementById('co2offset').value);
  const treeType = document.getElementById('treeType').value;
  const landAcres = parseFloat(document.getElementById('landArea').value) || 0;
  const years    = parseInt(document.getElementById('growthYears').value) || 20;

  if (!co2Need || co2Need <= 0) {
    showResult('afforestation-result', '<h4>Please enter a valid CO₂ offset amount.</h4>', 'warning');
    return;
  }

  const ratesKg      = { tropical:22, temperate:16, pine:10, bamboo:35 };
  const densityAcre  = { tropical:435, temperate:350, pine:500, bamboo:800 };

  const rateKg     = ratesKg[treeType];
  const kgNeeded   = co2Need * 1000;
  const treesNeeded = Math.ceil(kgNeeded / rateKg);
  const landNeeded  = (treesNeeded / densityAcre[treeType]).toFixed(2);
  const totalCO2    = (treesNeeded * rateKg * years / 1000).toFixed(0);
  const oxygenKg    = treesNeeded * rateKg * 0.727;
  const oxygenTonnes = (oxygenKg / 1000).toFixed(1);
  const people      = Math.floor(oxygenKg / 730);
  const fromLand    = landAcres > 0 ? Math.floor(landAcres * densityAcre[treeType]) : 0;
  const co2FromLand = (fromLand * rateKg / 1000).toFixed(2);

  showResult('afforestation-result', `
    <h4>🌳 Afforestation Plan</h4>
    <div class="result-main" style="color:var(--green-mid)">${treesNeeded.toLocaleString()} trees</div>
    <p>Required to offset <strong>${co2Need} tonnes CO₂/year</strong> using <em>${treeType}</em> species over ${years} years.</p>
    <ul>
      <li>CO₂ absorbed per tree / year: ${rateKg} kg</li>
      <li>Land needed: ~${landNeeded} acres</li>
      <li>Total CO₂ offset over ${years} yrs: ${Number(totalCO2).toLocaleString()} tonnes</li>
      <li>Annual O₂ produced: ${oxygenTonnes} tonnes</li>
      <li>People sustained by O₂ output: ~${people.toLocaleString()}</li>
      ${landAcres > 0 ? '<li>Your ' + landAcres + ' acres → ' + fromLand.toLocaleString() + ' trees → absorbs ' + co2FromLand + ' t CO₂/yr</li>' : ''}
    </ul>
    <p style="font-size:0.82rem;opacity:0.65;margin-top:10px">Based on average mature-tree rates. Young trees absorb less; sequestration rises with canopy closure.</p>
  `, 'good');
}

/* ============================================================
   CALCULATOR 3 — OXYGEN PRODUCTION
   ============================================================ */
function calcOxygen() {
  const numTrees   = parseInt(document.getElementById('numTrees').value);
  const treeAge    = parseInt(document.getElementById('treeAge').value) || 10;
  const forestType = document.getElementById('forestType').value;
  const sunHours   = parseFloat(document.getElementById('sunHours').value) || 8;

  if (!numTrees || numTrees <= 0) {
    showResult('oxygen-result', '<h4>Please enter the number of trees.</h4>', 'warning');
    return;
  }

  const baseO2   = { tropical:120, temperate:90, boreal:60, mangrove:100 };
  const ageFactor = Math.min(treeAge / 30, 1);
  const sunFactor = sunHours / 8;

  const o2PerTree    = baseO2[forestType] * ageFactor * sunFactor;
  const totalO2Kg    = numTrees * o2PerTree;
  const totalO2T     = (totalO2Kg / 1000).toFixed(2);
  const people       = Math.floor(totalO2Kg / 266);
  const co2Absorbed  = (totalO2Kg * 44 / 32).toFixed(0);
  const glucoseKg    = (totalO2Kg * 180 / 192).toFixed(0);

  const labels = { tropical:'Tropical Rainforest', temperate:'Temperate Forest', boreal:'Boreal/Taiga', mangrove:'Mangrove' };

  showResult('oxygen-result', `
    <h4>🌬️ Oxygen Production Estimate</h4>
    <div class="result-main" style="color:#00838f">${Number(totalO2T).toLocaleString()} tonnes O₂/year</div>
    <p><strong>${numTrees.toLocaleString()}</strong> ${labels[forestType]} trees — age ${treeAge} yrs, ${sunHours} hrs sunlight/day</p>
    <ul>
      <li>O₂ per tree / year: ${o2PerTree.toFixed(1)} kg</li>
      <li>Total O₂: ${Math.round(totalO2Kg).toLocaleString()} kg (${totalO2T} tonnes)</li>
      <li>People whose annual O₂ need is met: <strong>${people.toLocaleString()}</strong></li>
      <li>CO₂ absorbed to produce this O₂: ${Number(co2Absorbed).toLocaleString()} kg/yr</li>
      <li>Glucose synthesised (6CO₂+6H₂O→C₆H₁₂O₆+6O₂): ~${Number(glucoseKg).toLocaleString()} kg/yr</li>
    </ul>
    <p style="font-size:0.82rem;opacity:0.65;margin-top:10px">
      One person consumes ~266 kg O₂/year (550 L/day). Values estimated; real rates vary by microclimate, soil & species.
    </p>
  `, 'sky');
}

/* ============================================================
   CALCULATOR 4 — GREENHOUSE GAS (GWP)
   IPCC AR6 GWP100 values
   ============================================================ */
function calcGHG() {
  const co2Mt = parseFloat(document.getElementById('ghgCO2').value)  || 0;
  const ch4Mt = parseFloat(document.getElementById('ghgCH4').value)  || 0;
  const n2oMt = parseFloat(document.getElementById('ghgN2O').value)  || 0;
  const years = parseInt(document.getElementById('ghgYears').value)   || 50;

  if (co2Mt + ch4Mt + n2oMt === 0) {
    showResult('ghg-result', '<h4>Please enter at least one emission value.</h4>', 'warning');
    return;
  }

  const GWP_CH4 = 27.9;
  const GWP_N2O = 273;

  const co2e_co2  = co2Mt;
  const co2e_ch4  = ch4Mt * GWP_CH4;
  const co2e_n2o  = n2oMt * GWP_N2O;
  const totalCO2e = co2e_co2 + co2e_ch4 + co2e_n2o;
  const cumulative = (totalCO2e * years).toFixed(0);

  const ppmRise = (co2Mt / 7800).toFixed(4);
  const cumPpm  = (co2Mt * years / 7800).toFixed(2);

  const C0 = 420;
  const C  = C0 + parseFloat(cumPpm);
  const deltaF = 5.35 * Math.log(C / C0);
  const deltaT = (0.8 * deltaF).toFixed(3);

  const cls = totalCO2e > 50000 ? 'danger' : totalCO2e > 10000 ? 'warning' : '';

  showResult('ghg-result', `
    <h4>☁️ Greenhouse Gas Warming Potential</h4>
    <div class="result-main" style="color:#e65100">${Number(totalCO2e.toFixed(1)).toLocaleString()} Mt CO₂e / year</div>
    <p>Combined annual emissions in CO₂-equivalent (GWP100, IPCC AR6).</p>
    <ul>
      <li>CO₂ contribution: ${co2Mt.toLocaleString()} Mt CO₂e (GWP = 1)</li>
      <li>CH₄ contribution: ${co2e_ch4.toLocaleString(undefined,{maximumFractionDigits:1})} Mt CO₂e (GWP = ${GWP_CH4})</li>
      <li>N₂O contribution: ${co2e_n2o.toLocaleString(undefined,{maximumFractionDigits:1})} Mt CO₂e (GWP = ${GWP_N2O})</li>
      <li>Cumulative over ${years} years: ~${Number(cumulative).toLocaleString()} Mt CO₂e</li>
      <li>Annual CO₂ atmospheric rise: +${ppmRise} ppm (cumulative +${cumPpm} ppm)</li>
      <li>Estimated temperature forcing over ${years} yrs: +${deltaT} °C</li>
    </ul>
    <p style="font-size:0.82rem;opacity:0.65;margin-top:10px">
      IPCC AR6 GWP100: CH₄=27.9, N₂O=273. Temp forcing uses simplified ECS (λ=0.8 K/W·m⁻²); real climate involves complex feedbacks.
    </p>
  `, cls);
}

/* ============================================================
   CALCULATOR 5 — PERSONAL CARBON FOOTPRINT
   ============================================================ */
function calcCarbonFootprint() {
  const carKm       = parseFloat(document.getElementById('carKm').value) || 0;
  const fuelType    = document.getElementById('fuelType').value;
  const electricity = parseFloat(document.getElementById('electricity').value) || 0;
  const flights     = parseFloat(document.getElementById('flights').value) || 0;
  const dietType    = document.getElementById('dietType').value;

  const fuelFactor = { petrol:0.192, diesel:0.171, cng:0.114, ev:0.053 };
  const gridFactor = 0.71; // India grid kg CO₂/kWh (CEA 2023)
  const dietFactor = { meat_heavy:3300, average:2000, vegetarian:1400, vegan:1000 };

  const carCO2   = carKm * fuelFactor[fuelType] * 365 / 1000;
  const elecCO2  = electricity * 12 * gridFactor / 1000;
  const flightCO2 = flights * 510 / 1000; // ~510 kg CO₂ per economy flight avg
  const dietCO2  = dietFactor[dietType] / 1000;
  const total    = carCO2 + elecCO2 + flightCO2 + dietCO2;

  const indiaAvg  = 1.9;
  const globalAvg = 4.7;
  const paris15   = 2.1;

  let status, cls;
  if (total <= paris15)       { status = '✅ Paris-Compatible (≤2.1 t)'; cls = 'good'; }
  else if (total <= indiaAvg) { status = '🟡 Below India Average';        cls = ''; }
  else if (total <= globalAvg){ status = '🟠 Near Global Average';        cls = 'warning'; }
  else                         { status = '🔴 Above Global Average';       cls = 'danger'; }

  const treesToOffset = Math.ceil(total * 1000 / 22);

  const tips = [];
  if (carKm > 20 && fuelType !== 'ev') tips.push('Switch to EV or carpool to cut transport emissions');
  if (electricity > 250) tips.push('Install solar panels or switch to a green tariff');
  if (flights > 2) tips.push('Consider train/bus alternatives for short trips');
  if (dietType === 'meat_heavy') tips.push('Reducing red meat intake is one of the highest-impact changes');

  showResult('carbon-result', `
    <h4>🚗 Your Annual Carbon Footprint</h4>
    <div class="result-main" style="color:${cls==='good'?'#27ae60':cls==='danger'?'#c0392b':'#e08c3a'}">${total.toFixed(2)} tonnes CO₂e</div>
    <p><strong>Status: ${status}</strong></p>
    <p style="font-size:0.85rem;color:var(--text-mid)">India avg: ${indiaAvg}t &nbsp;|&nbsp; Global avg: ${globalAvg}t &nbsp;|&nbsp; Paris 1.5°C target: ${paris15}t</p>
    <ul>
      <li>🚗 Transport: ${carCO2.toFixed(3)} t CO₂ (${fuelType}, ${carKm} km/day × 365)</li>
      <li>⚡ Electricity: ${elecCO2.toFixed(3)} t CO₂ (${electricity} kWh/month, India grid)</li>
      <li>✈️ Flights: ${flightCO2.toFixed(3)} t CO₂ (${flights} flights/yr)</li>
      <li>🥗 Diet (${dietType.replace('_',' ')}): ${dietCO2.toFixed(3)} t CO₂</li>
      <li>🌳 Trees needed to offset: <strong>${treesToOffset.toLocaleString()}</strong> tropical trees</li>
    </ul>
    ${tips.length > 0 ? '<p style="margin-top:10px;font-weight:600;color:var(--green-deep)">💡 Personalised Tips:</p><ul>' + tips.map(t => '<li>' + t + '</li>').join('') + '</ul>' : ''}
    <p style="font-size:0.82rem;opacity:0.65;margin-top:10px">Sources: DEFRA 2023, CEA India 2023, IPCC. Excludes embodied emissions in goods & services.</p>
  `, cls);
}
