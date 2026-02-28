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

document.getElementById('header-date').innerText = TODAY.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

// --- RECOVERY & STOPWATCH ---
let stopwatchInt; let elapsed = 0;
function toggleGymSession() {
    const btn = document.getElementById('session-btn');
    if(!stopwatchInt) {
        let start = Date.now() - (elapsed * 1000);
        stopwatchInt = setInterval(() => {
            elapsed = Math.floor((Date.now() - start)/1000);
            let h = Math.floor(elapsed/3600); let m = Math.floor((elapsed%3600)/60); let s = elapsed%60;
            document.getElementById('stopwatch-text').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }, 1000);
        btn.innerText = "END SESSION"; btn.style.background = "#ef4444";
    } else {
        clearInterval(stopwatchInt); stopwatchInt = null;
        let dNum = Math.floor((TODAY - START_DATE)/(86400000)) + 1;
        db.ref(`${USER_KEY}/gym-${dNum}`).set(document.getElementById('stopwatch-text').innerText);
        btn.innerText = "START SESSION"; btn.style.background = "#3b82f6";
    }
}

let currentStars = 0; let sleepHours = 0;
function setStars(n) {
    currentStars = n;
    document.querySelectorAll('#star-container span').forEach((s, i) => s.innerText = i < n ? '★' : '☆');
    if (sleepHours > 0 && sleepHours < 5) document.querySelectorAll('#star-container span').forEach(s => s.classList.add('star-warning'));
    else document.querySelectorAll('#star-container span').forEach(s => s.classList.remove('star-warning'));
}
function calculateSleep() {
    let bed = document.getElementById('bed-time').value; let wake = document.getElementById('wake-time').value;
    if(!bed || !wake) return;
    let b = new Date(`2026-01-01T${bed}:00`); let w = new Date(`2026-01-01T${wake}:00`);
    if(w <= b) w.setDate(w.getDate() + 1);
    sleepHours = (w - b) / 3600000;
    document.getElementById('sleep-result').innerText = `${Math.floor(sleepHours)}h ${Math.floor(((w-b)%3600000)/60000)}m`;
    setStars(currentStars);
}
function saveSleepToCloud() {
    let dNum = Math.floor((TODAY - START_DATE)/(86400000)) + 1;
    db.ref(`${USER_KEY}/sleep-${dNum}`).set({time: document.getElementById('sleep-result').innerText, stars: currentStars, danger: sleepHours < 5});
    alert("Recovery synced.");
}
function saveManualLog(d) {
    db.ref(`${USER_KEY}/note-${d}`).set(document.getElementById(`note-text-${d}`).value);
    alert("Manual log saved.");
}
function closeTrophy() { document.getElementById('trophy-overlay').classList.add('trophy-hidden'); }

// --- EXACT SCHEDULE DATA ---
const rawData = [
    { am: "Treadmill + 1s Pushup/Squat + Crunches", b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", pm: "Plank, High Plank, Bird-Dog", d: "Bagara Rice + Protein" },
    { am: "Treadmill + 1s Pushup/Squat + Rev Crunches", b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: "Bicycle Crunches, Leg Raises", d: "2 Chapathi + Aalu Curma" },
    { am: "Treadmill + 1s Pushup/Squat + Bicycle Crunches", b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "two small pieces of watermelon", pm: "Plank, High Plank (No Side Planks)", d: "1.5c Egg Fried Rice" },
    { am: "Treadmill + 1s Pushup/Squat + Russian Twists", b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", pm: "Bicycle Crunches, Russian Twists", d: "2 Chapathi + Tomato Pappu" },
    { am: "20m Incline Walk + Circuit (Lunges/Leg Raises)", b: "Puri (Max 2)", l: "Bisbilabath, Pesarapappu Iguru", s: "Seasonal Fruit", pm: "Plank, Bicycle Crunches, Leg Raises", d: "Bagara rice + Protin" }, // CORRECT SUNDAY
    { am: "Treadmill + 1s Pushup/Squat + Leg Raises", b: "Idly (Skip Bonda)", l: "Green Leave Pappu, Arati Curry", s: "1 Masalawada (Max)", pm: "Plank, Bicycle Crunches", d: "2 Chapathi + Rajma Curma" },
    { am: "Treadmill + 1s Pushup/Squat + Mt. Climbers", b: "Onion Dosa (1 pc)", l: "Dosakaya Pappu, Beerakaya Curry", s: "Tea/Milk (No Sweet)", pm: "Bicycle Crunches, Leg Raises", d: "1c Egg Curry + 0.5c Rice" }
];

db.ref(USER_KEY).on('value', snap => {
    const data = snap.val() || {};
    let done = 0;
    for(let i=1; i<=30; i++) {
        const card = document.getElementById(`card-${i}`);
        if(!card) continue;
        const isD = data[`day-${i}`]; card.classList.toggle('completed', isD);
        card.querySelector('.day-cb').checked = isD;
        card.querySelector('.garlic-cb').checked = data[`garlic-${i}`];
        if(data[`note-${i}`]) document.getElementById(`note-text-${i}`).value = data[`note-${i}`];
        if(isD) done++;
    }
    const pct = Math.round(done/30*100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('pct-text').innerText = pct + '%';
    if(pct === 100) document.getElementById('trophy-overlay').classList.remove('trophy-hidden');
});

const grid = document.getElementById('workout-grid');
for (let i = 1; i <= 30; i++) {
    const dDate = new Date(START_DATE); dDate.setDate(START_DATE.getDate() + (i-1));
    const d = rawData[(i-1) % 7];
    const card = document.createElement('div');
    card.id = `card-${i}`; card.className = `card ${dDate.getTime() === TODAY.getTime() ? 'is-today' : ''}`;
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Day ${i}</strong>
            <small style="font-weight:800; color:#64748b">${dDate.toLocaleDateString('en-US',{weekday:'short', month:'short', day:'numeric'})}</small>
        </div>
        <div style="font-size:0.6rem; color:#ef4444; background:rgba(239,68,68,0.05); padding:8px; border-radius:10px; margin:15px 0; font-weight:800; border: 1px solid rgba(239,68,68,0.1);">
            <input type="checkbox" class="garlic-cb" id="g-${i}"> <label for="g-${i}">🧄 RAW GARLIC HABIT</label>
        </div>
        <div class="item-row">🌅 AM: ${d.am}</div>
        <div class="item-row" style="border-left-color: var(--green);">🌇 PM: ${d.pm}</div>
        <div class="diet-stack">
            <span class="tag">🍳 ${d.b}</span><span class="tag">🍲 ${d.l}</span><span class="tag">☕ ${d.s}</span><span class="tag">🫓 ${d.d}</span>
        </div>
        <div class="manual-entry"><textarea id="note-text-${i}" rows="2" placeholder="Manual note..."></textarea><button onclick="saveManualLog(${i})">SAVE ACTIVITY</button></div>
        <div style="margin-top:20px; border-top:1px solid #f1f5f9; padding-top:15px;">
            <input type="checkbox" class="day-cb" id="d-${i}" style="width:18px; height:18px;"> 
            <label for="d-${i}" style="font-weight:800; cursor:pointer; margin-left:8px; font-size:0.8rem;">TARGET MET</label>
        </div>
    `;
    card.querySelector('.day-cb').onchange = (e) => db.ref(`${USER_KEY}/day-${i}`).set(e.target.checked);
    card.querySelector('.garlic-cb').onchange = (e) => db.ref(`${USER_KEY}/garlic-${i}`).set(e.target.checked);
    grid.appendChild(card);
}
document.getElementById('reset-btn').onclick = () => { if(confirm("Clear data?")) db.ref(USER_KEY).remove(); };