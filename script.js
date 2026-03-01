const firebaseConfig = {
  apiKey: "AIzaSyDiC6U5wU1HufsKonu0yZ7GZtqVw8woEnk",
  authDomain: "fitness-tracker-1fe61.firebaseapp.com",
  databaseURL: "https://fitness-tracker-1fe61-default-rtdb.firebaseio.com",
  projectId: "fitness-tracker-1fe61",
  storageBucket: "fitness-tracker-1fe61.appspot.com",
  messagingSenderId: "1098616149591",
  appId: "1:1098616149591:web:d27457731236100c56360c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const USER_KEY = "U_Guru_Likhith_Reddy";
const START_DATE = new Date(2026, 1, 25);
const TODAY = new Date(); TODAY.setHours(0,0,0,0);

function autoExpand(tx) { tx.style.height = 'inherit'; tx.style.height = tx.scrollHeight + 'px'; }

const canvas = document.getElementById('victory-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function triggerVictory() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    for(let i=0; i<80; i++) particles.push({ x: window.innerWidth/2, y: window.innerHeight/2, vx: (Math.random()-0.5)*25, vy: (Math.random()-0.5)*25, size: Math.random()*5+2, alpha: 1 });
    requestAnimationFrame(updateParticles);
}
function updateParticles() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach((p,i) => { p.x+=p.vx; p.y+=p.vy; p.alpha-=0.015; ctx.globalAlpha=p.alpha; ctx.fillStyle="#00ffa3"; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); if(p.alpha<=0) particles.splice(i,1); });
    if(particles.length>0) requestAnimationFrame(updateParticles);
}

setInterval(() => {
    const now = new Date();
    document.getElementById('real-time-clock').innerText = now.toLocaleTimeString('en-GB');
    document.getElementById('hub-day-name').innerText = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    document.getElementById('hub-full-date').innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const curDay = Math.floor((TODAY - START_DATE) / 86400000) + 1;
    document.getElementById('days-left-tag').innerText = `${30 - curDay} DAYS REMAINING`;
    const diet = rawData[(curDay - 1) % 7];
    const hour = now.getHours();
    document.getElementById('sidebar-next-meal').innerText = hour < 11 ? "🍳 Breakfast: " + diet.b : hour < 16 ? "🍲 Lunch: " + diet.l : hour < 19 ? "☕ Snack: " + diet.s : "🫓 Dinner: " + diet.d;
}, 1000);

let swInt; let elapsed = 0; let sStart;
function toggleEngine(type) {
    const sBox = document.querySelector('.engine-subtext');
    const swTxt = document.getElementById('stopwatch-text');
    let dayNum = Math.floor((new Date() - START_DATE)/(86400000)) + 1;
    if(!swInt) {
        sStart = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        let base = Date.now() - (elapsed * 1000);
        swInt = setInterval(() => { elapsed = Math.floor((Date.now() - base)/1000); let h = Math.floor(elapsed/3600); let m = Math.floor((elapsed%3600)/60); let s = elapsed%60; swTxt.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }, 1000);
        sBox.innerText = `ENGINE ACTIVE: ${type.toUpperCase()}`; sBox.style.color = "var(--emerald)";
    } else {
        clearInterval(swInt); swInt = null;
        db.ref(`${USER_KEY}/day-${dayNum}/sessions/${type}`).set({ start: sStart, end: new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}), duration: swTxt.innerText });
        sBox.innerText = "SYSTEM STANDBY"; sBox.style.color = "#444";
        elapsed = 0; swTxt.innerText = "00:00:00";
    }
}

const rawData = [
    { am: "Treadmill + Crunches", b: "Kichidi", l: "Green Pappu, Dondakaya", s: "Guggillu", pm: "Plank, High Plank, Bird-Dog", d: "Bagara Rice + Protein" },
    { am: "Treadmill + Rev Crunches", b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: "Bicycle Crunches, Leg Raises", d: "2 Chapathi + Aalu Curma" },
    { am: "Treadmill + Bicycle Crunches", b: "Karam Dosa 1pc", l: "Green Pappu, Bendakaya", s: "Watermelon", pm: "Plank, High Plank", d: "1.5c Egg Fried Rice" },
    { am: "Treadmill + Russian Twists", b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot", s: "Red Senagalu", pm: "Bicycle Crunches, Russian Twists", d: "2 Chapathi + Tomato Pappu" },
    { am: "20m Incline Walk + Circuit", b: "Puri (Max 2)", l: "Bisbilabath, Pesarapappu Iguru", s: "Seasonal Fruit", pm: "Plank, Bicycle Crunches, Leg Raises", d: "Bagara rice + Protin" },
    { am: "Treadmill + Leg Raises", b: "Idly (Skip Bonda)", l: "Green Pappu, Arati Curry", s: "1 Masalawada", pm: "Plank, Bicycle Crunches", d: "2 Chapathi + Rajma Curma" },
    { am: "Treadmill + Mt. Climbers", b: "Onion Dosa", l: "Dosakaya Pappu, Beerakaya", s: "Tea/Milk", pm: "Bicycle Crunches, Leg Raises", d: "1c Egg Curry + 0.5c Rice" }
];

db.ref(USER_KEY).on('value', snap => {
    const data = snap.val() || {};
    let done = 0;
    for(let i=1; i<=30; i++) {
        const card = document.getElementById(`card-${i}`); if(!card) continue;
        const dData = data[`day-${i}`] || {};
        const met = dData.targetMet || false;
        card.querySelector('.day-cb').checked = met;
        card.classList.toggle('target-met', met);
        if(met) done++;
        const water = dData.water || 0;
        card.querySelectorAll('.drop').forEach(dr => dr.classList.toggle('active', dr.getAttribute('data-val') <= water));
        
        const isToday = (new Date(START_DATE.getTime() + (i-1)*86400000).getTime() === TODAY.getTime());
        if(isToday && new Date().getHours() >= 10 && !dData.garlicTaken) card.querySelector('.garlic-box').classList.add('garlic-nag');
        else card.querySelector('.garlic-box').classList.remove('garlic-nag');
        card.querySelector('.garlic-cb').checked = dData.garlicTaken || false;

        const sess = dData.sessions || {};
        card.querySelector('.sess-logs').innerHTML = (sess.Morning ? `☀️ AM: ${sess.Morning.duration}<br>` : "") + (sess.Evening ? `🌇 PM: ${sess.Evening.duration}` : "");
        if(dData.manualLog) { const tx = card.querySelector('.notes-area'); tx.value = dData.manualLog; autoExpand(tx); }
    }
    document.getElementById('progress-fill').style.width = Math.round((done/30)*100) + '%';
    document.getElementById('pct-text').innerText = Math.round((done/30)*100) + '%';
});

const grid = document.getElementById('workout-grid');
for (let i = 1; i <= 30; i++) {
    const dDate = new Date(START_DATE); dDate.setDate(START_DATE.getDate() + (i-1));
    const d = rawData[(i-1) % 7];
    const isSun = (dDate.getDay() === 0);
    const card = document.createElement('div');
    card.id = `card-${i}`; card.className = `card ${dDate.getTime() === TODAY.getTime() ? 'is-today' : ''} ${isSun ? 'sunday-card' : ''}`;
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items: baseline; margin-bottom: 15px;"><strong style="font-size:1.2rem;">${dDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} // DAY ${i}</strong><small style="font-weight:800; color:#ccc">${dDate.toLocaleDateString()}</small></div>
        <div class="garlic-box"><input type="checkbox" class="garlic-cb" id="garlic-${i}" onchange="db.ref('${USER_KEY}/day-${i}/garlicTaken').set(this.checked)"><label style="font-weight:900; color:var(--red); font-size:0.75rem; cursor:pointer;" for="garlic-${i}">🧄 RAW GARLIC PROTOCOL</label></div>
        <div class="water-bay">${[1,2,3,4].map(n => `<span class="drop" data-val="${n}" onclick="db.ref('${USER_KEY}/day-${i}/water').set(${n})">💧</span>`).join('')}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><button class="btn-action" onclick="toggleEngine('Morning')">🌅 MORNING</button><button class="btn-action" onclick="toggleEngine('Evening')">🌇 EVENING</button></div>
        <div class="data-strip">AM CORE: ${d.am}</div><div class="data-strip" style="border-left-color:var(--emerald);">PM CORE: ${d.pm}</div>
        <div class="sess-logs" style="font-size:0.75rem; font-weight:800; color:var(--blue); margin-bottom:10px;"></div>
        <div class="nutrition-strip"><span class="pill">🍳 ${d.b}</span><span class="pill">🍲 ${d.l}</span><span class="pill">☕ ${d.s}</span><span class="pill">🫓 ${d.d}</span></div>
        <textarea class="notes-area" placeholder="Telemetry logs..." oninput="autoExpand(this)" onchange="db.ref('${USER_KEY}/day-${i}/manualLog').set(this.value)"></textarea>
        <button onclick="document.getElementById('card-${i}').classList.add('printing-active'); window.print(); document.getElementById('card-${i}').classList.remove('printing-active');" class="btn-action" style="width:100%; background:#f0f0f0; color:#000; margin-top:20px;">PRINT SESSION REPORT</button>
        <div class="mission-check-row"><input type="checkbox" class="day-cb cb-zenith" id="cb-${i}" onchange="if(this.checked) triggerVictory(); db.ref('${USER_KEY}/day-${i}/targetMet').set(this.checked)"><label for="cb-${i}" style="font-weight:900; letter-spacing:1px; cursor:pointer;">MISSION ACCOMPLISHED</label></div>
    `;
    grid.appendChild(card);
}
document.getElementById('reset-btn').onclick = () => { if(confirm("Wipe all cloud history?")) db.ref(USER_KEY).remove(); };