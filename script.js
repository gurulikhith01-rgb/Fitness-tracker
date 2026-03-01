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

const rawData = [
    { am: "Treadmill + Crunches", b: "Kichidi", l: "Green Pappu, Dondakaya", s: "Guggillu", pm: "Plank, High Plank, Bird-Dog", d: "Bagara Rice + Protein" },
    { am: "Treadmill + Rev Crunches", b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: "Bicycle Crunches, Leg Raises", d: "2 Chapathi + Aalu Curma" },
    { am: "Treadmill + Bicycle Crunches", b: "Karam Dosa 1pc", l: "Green Pappu, Bendakaya", s: "Watermelon", pm: "Plank, High Plank", d: "1.5c Egg Fried Rice" },
    { am: "Treadmill + Russian Twists", b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot", s: "Red Senagalu", pm: "Bicycle Crunches, Russian Twists", d: "2 Chapathi + Tomato Pappu" },
    { am: "20m Incline Walk + Circuit", b: "Puri (Max 2)", l: "Bisbilabath, Pesarapappu Iguru", s: "Seasonal Fruit", pm: "Plank, Bicycle Crunches, Leg Raises", d: "Bagara rice + Protin" },
    { am: "Treadmill + Leg Raises", b: "Idly (Skip Bonda)", l: "Green Pappu, Arati Curry", s: "1 Masalawada", pm: "Plank, Bicycle Crunches", d: "2 Chapathi + Rajma Curma" },
    { am: "Treadmill + Mt. Climbers", b: "Onion Dosa", l: "Dosakaya Pappu, Beerakaya", s: "Tea/Milk", pm: "Bicycle Crunches, Leg Raises", d: "1c Egg Curry + 0.5c Rice" }
];

function autoExpand(tx) { tx.style.height = 'inherit'; tx.style.height = tx.scrollHeight + 'px'; }

// PRINTING SYSTEM
function printSingleCard(dayNum) {
    const card = document.getElementById(`card-${dayNum}`);
    document.body.classList.add('printing-single-mode');
    card.classList.add('printing-now');
    window.print();
    card.classList.remove('printing-now');
    document.body.classList.remove('printing-single-mode');
}

document.getElementById('main-archive-print').addEventListener('click', () => {
    document.body.classList.remove('printing-single-mode');
    window.print();
});

// ENGINE LOGIC
let swInt; let elapsed = 0; let sStart;
function toggleEngine(type) {
    const sBox = document.getElementById('engine-status');
    const swTxt = document.getElementById('stopwatch-text');
    const container = document.getElementById('engine-container');
    let dNum = Math.floor((new Date() - START_DATE)/(86400000)) + 1;
    
    if(!swInt) {
        sStart = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        let base = Date.now() - (elapsed * 1000);
        container.classList.add('engine-active');
        swInt = setInterval(() => { 
            elapsed = Math.floor((Date.now() - base)/1000); 
            let h = Math.floor(elapsed/3600); let m = Math.floor((elapsed%3600)/60); let s = elapsed%60; 
            swTxt.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; 
        }, 1000);
        sBox.innerText = `LOGGING ${type.toUpperCase()}...`;
    } else {
        clearInterval(swInt); swInt = null;
        const sEnd = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        container.classList.remove('engine-active');
        db.ref(`${USER_KEY}/day-${dNum}/sessions/${type}`).set({ 
            display: `${sStart} - ${sEnd} (${swTxt.innerText})`
        });
        sBox.innerText = "SYSTEM STANDBY"; 
        elapsed = 0; swTxt.innerText = "00:00:00";
    }
}

// SYNC
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
        const sess = dData.sessions || {};
        let logStr = "";
        if(sess.Morning) logStr += `☀️ AM: ${sess.Morning.display}<br>`;
        if(sess.Evening) logStr += `🌇 PM: ${sess.Evening.display}`;
        card.querySelector('.sess-logs').innerHTML = logStr || "No telemetry recorded";
        const water = dData.water || 0;
        card.querySelectorAll('.drop').forEach(dr => dr.classList.toggle('active', dr.getAttribute('data-val') <= water));
        card.querySelector('.garlic-cb').checked = dData.garlicTaken || false;
        if(dData.manualLog) { const tx = card.querySelector('.notes-area'); tx.value = dData.manualLog; autoExpand(tx); }
    }
    document.getElementById('progress-fill').style.width = Math.round((done/30)*100) + '%';
    document.getElementById('pct-text').innerText = Math.round((done/30)*100) + '%';
});

// GRID INIT
const grid = document.getElementById('workout-grid');
for (let i = 1; i <= 30; i++) {
    const dDate = new Date(START_DATE); dDate.setDate(START_DATE.getDate() + (i-1));
    const d = rawData[(i-1) % 7];
    const card = document.createElement('div');
    card.id = `card-${i}`; card.className = `card`;
    card.innerHTML = `
        <div class="card-header">
            <strong>DAY ${i} // ${dDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</strong>
            <small class="card-date">${dDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</small>
            <button class="btn-print-mini no-print" onclick="printSingleCard(${i})">🖨️ PRINT</button>
        </div>
        <div class="garlic-box"><input type="checkbox" class="garlic-cb" id="garlic-${i}" onchange="db.ref('${USER_KEY}/day-${i}/garlicTaken').set(this.checked)"><label for="garlic-${i}">🧄 RAW GARLIC PROTOCOL</label></div>
        <div class="water-bay">${[1,2,3,4].map(n => `<span class="drop" data-val="${n}" onclick="db.ref('${USER_KEY}/day-${i}/water').set(${n})">💧</span>`).join('')}</div>
        <div class="engine-btns-container">
            <button class="engine-btn am-trigger" onclick="toggleEngine('Morning')">☀️ AM ENGINE</button>
            <button class="engine-btn pm-trigger" onclick="toggleEngine('Evening')">🌇 PM ENGINE</button>
        </div>
        <div class="data-strip">AM: ${d.am}</div><div class="data-strip pm">PM: ${d.pm}</div>
        <div class="sess-logs"></div>
        <div class="nutrition-strip"><span class="pill">🍳 ${d.b}</span><span class="pill">🍲 ${d.l}</span><span class="pill">☕ ${d.s}</span><span class="pill">🫓 ${d.d}</span></div>
        <div class="manual-log-wrapper">
            <label class="section-tag small">TELEMETRY FEED</label>
            <textarea class="notes-area" placeholder="Enter session metadata..." onchange="db.ref('${USER_KEY}/day-${i}/manualLog').set(this.value)"></textarea>
        </div>
        <div class="mission-row"><input type="checkbox" class="day-cb" id="cb-${i}" onchange="db.ref('${USER_KEY}/day-${i}/targetMet').set(this.checked)"><label for="cb-${i}">MISSION ACCOMPLISHED</label></div>
    `;
    grid.appendChild(card);
}

setInterval(() => {
    const now = new Date();
    document.getElementById('real-time-clock').innerText = now.toLocaleTimeString('en-GB');
    document.getElementById('hub-day-name').innerText = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    document.getElementById('hub-full-date').innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const curDay = Math.floor((now - START_DATE) / 86400000) + 1;
    document.getElementById('days-left-tag').innerText = `${30 - curDay} DAYS REMAINING`;
    const diet = rawData[(curDay - 1) % 7] || rawData[0];
    const hour = now.getHours();
    document.getElementById('sidebar-next-meal').innerText = hour < 11 ? "🍳 Breakfast: " + diet.b : hour < 16 ? "🍲 Lunch: " + diet.l : hour < 19 ? "☕ Snack: " + diet.s : "🫓 Dinner: " + diet.d;
}, 1000);