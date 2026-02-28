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
        let dayNum = Math.floor((TODAY - START_DATE)/(86400000)) + 1;
        db.ref(`${USER_KEY}/gym-${dayNum}`).set(document.getElementById('stopwatch-text').innerText);
        btn.innerText = "START SESSION"; btn.style.background = "#3b82f6";
    }
}

let currentStars = 0; let sleepHours = 0;
function setStars(n) {
    currentStars = n;
    const starSpans = document.querySelectorAll('#star-container span');
    starSpans.forEach((s, idx) => {
        s.innerText = idx < n ? '★' : '☆';
        if (sleepHours > 0 && sleepHours < 5) s.classList.add('star-warning');
        else s.classList.remove('star-warning');
    });
}
function calculateSleep() {
    let bed = document.getElementById('bed-time').value;
    let wake = document.getElementById('wake-time').value;
    if(!bed || !wake) return;
    let b = new Date(`2026-01-01T${bed}:00`);
    let w = new Date(`2026-01-01T${wake}:00`);
    if(w <= b) w.setDate(w.getDate() + 1);
    sleepHours = (w - b) / 3600000;
    document.getElementById('sleep-result').innerText = `${Math.floor(sleepHours)}h ${Math.floor(((w-b)%3600000)/60000)}m`;
    setStars(currentStars);
}
function saveSleepToCloud() {
    let dayNum = Math.floor((TODAY - START_DATE)/(86400000)) + 1;
    db.ref(`${USER_KEY}/sleep-${dayNum}`).set({time: document.getElementById('sleep-result').innerText, stars: currentStars, danger: sleepHours < 5});
    alert("Recovery logged.");
}
function closeTrophy() { document.getElementById('trophy-overlay').classList.add('trophy-hidden'); }
function saveManualLog(day) {
    const text = document.getElementById(`manual-text-${day}`).value;
    db.ref(`${USER_KEY}/manual-log-${day}`).set(text);
    alert("Activity Log Saved!");
}

// --- EXACT 30-DAY DATA HARCODED FROM YOUR CSV ---
const rawData = [
    { am: ["Treadmill + 1s Pushup/Squat", "Crunches"], b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", pm: ["Plank, High Plank, Bird-Dog"], d: "Bagara Rice + Protein" },
    { am: ["Treadmill + 1s Pushup/Squat", "Rev Crunches"], b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: ["Bicycle Crunches, Leg Raises"], d: "2 Chapathi + Aalu Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Bicycle Crunches"], b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "Watermelon", pm: ["Plank, High Plank (No Side Planks)"], d: "1.5c Egg Fried Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Russian Twists"], b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", pm: ["Bicycle Crunches, Russian Twists"], d: "2 Chapathi + Tomato Pappu" },
    { am: ["20m Incline Walk", "Pushups (1 Set)", "Squats (1 Set)", "Lunges (3s)", "Leg Raises (3s)"], b: "Puri (Max 2)", l: "Special Chicken Curry, Rice", s: "Fruit Salad", pm: ["Plank, Bicycle Crunches, Leg Raises"], d: "1 Chapathi + Light Veg" },
    { am: ["Treadmill + 1s Pushup/Squat", "Leg Raises"], b: "Idly (Skip Bonda)", l: "Green Leave Pappu, Arati Curry", s: "1 Masalawada (Max)", pm: ["Plank, Bicycle Crunches"], d: "2 Chapathi + Rajma Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Mt. Climbers"], b: "Onion Dosa (1 pc)", l: "Dosakaya Pappu, Beerakaya Curry", s: "Tea/Milk (No Sugar)", pm: ["Bicycle Crunches, Leg Raises"], d: "1c Egg Curry + 0.5c Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Crunches"], b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", pm: ["Plank, High Plank, Bird-Dog"], d: "Bagara Rice + Protein" },
    { am: ["Treadmill + 1s Pushup/Squat", "Rev Crunches"], b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: ["Bicycle Crunches, Leg Raises"], d: "2 Chapathi + Aalu Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Bicycle Crunches"], b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "Watermelon", pm: ["Plank, High Plank (No Side Planks)"], d: "1.5c Egg Fried Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Russian Twists"], b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", pm: ["Bicycle Crunches, Russian Twists"], d: "2 Chapathi + Tomato Pappu" },
    { am: ["20m Incline Walk", "Pushups (1 Set)", "Squats (1 Set)", "Lunges (3s)", "Leg Raises (3s)"], b: "Puri (Max 2)", l: "Special Chicken Curry, Rice", s: "Fruit Salad", pm: ["Plank, Bicycle Crunches, Leg Raises"], d: "1 Chapathi + Light Veg" },
    { am: ["Treadmill + 1s Pushup/Squat", "Leg Raises"], b: "Idly (Skip Bonda)", l: "Green Leave Pappu, Arati Curry", s: "1 Masalawada (Max)", pm: ["Plank, Bicycle Crunches"], d: "2 Chapathi + Rajma Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Mt. Climbers"], b: "Onion Dosa (1 pc)", l: "Dosakaya Pappu, Beerakaya Curry", s: "Tea/Milk (No Sugar)", pm: ["Bicycle Crunches, Leg Raises"], d: "1c Egg Curry + 0.5c Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Crunches"], b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", pm: ["Plank, High Plank, Bird-Dog"], d: "Bagara Rice + Protein" },
    { am: ["Treadmill + 1s Pushup/Squat", "Rev Crunches"], b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: ["Bicycle Crunches, Leg Raises"], d: "2 Chapathi + Aalu Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Bicycle Crunches"], b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "Watermelon", pm: ["Plank, High Plank (No Side Planks)"], d: "1.5c Egg Fried Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Russian Twists"], b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", pm: ["Bicycle Crunches, Russian Twists"], d: "2 Chapathi + Tomato Pappu" },
    { am: ["20m Incline Walk", "Pushups (1 Set)", "Squats (1 Set)", "Lunges (3s)", "Leg Raises (3s)"], b: "Puri (Max 2)", l: "Special Chicken Curry, Rice", s: "Fruit Salad", pm: ["Plank, Bicycle Crunches, Leg Raises"], d: "1 Chapathi + Light Veg" },
    { am: ["Treadmill + 1s Pushup/Squat", "Leg Raises"], b: "Idly (Skip Bonda)", l: "Green Leave Pappu, Arati Curry", s: "1 Masalawada (Max)", pm: ["Plank, Bicycle Crunches"], d: "2 Chapathi + Rajma Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Mt. Climbers"], b: "Onion Dosa (1 pc)", l: "Dosakaya Pappu, Beerakaya Curry", s: "Tea/Milk (No Sugar)", pm: ["Bicycle Crunches, Leg Raises"], d: "1c Egg Curry + 0.5c Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Crunches"], b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", pm: ["Plank, High Plank, Bird-Dog"], d: "Bagara Rice + Protein" },
    { am: ["Treadmill + 1s Pushup/Squat", "Rev Crunches"], b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", pm: ["Bicycle Crunches, Leg Raises"], d: "2 Chapathi + Aalu Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Bicycle Crunches"], b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "Watermelon", pm: ["Plank, High Plank (No Side Planks)"], d: "1.5c Egg Fried Rice" },
    { am: ["Treadmill + 1s Pushup/Squat", "Russian Twists"], b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", pm: ["Bicycle Crunches, Russian Twists"], d: "2 Chapathi + Tomato Pappu" },
    { am: ["20m Incline Walk", "Pushups (1 Set)", "Squats (1 Set)", "Lunges (3s)", "Leg Raises (3s)"], b: "Puri (Max 2)", l: "Special Chicken Curry, Rice", s: "Fruit Salad", pm: ["Plank, Bicycle Crunches, Leg Raises"], d: "1 Chapathi + Light Veg" },
    { am: ["Treadmill + 1s Pushup/Squat", "Leg Raises"], b: "Idly (Skip Bonda)", l: "Green Leave Pappu, Arati Curry", s: "1 Masalawada (Max)", pm: ["Plank, Bicycle Crunches"], d: "2 Chapathi + Rajma Curma" },
    { am: ["Treadmill + 1s Pushup/Squat", "Mt. Climbers"], b: "Onion Dosa (1 pc)", l: "Dosakaya Pappu, Beerakaya Curry", s: "Tea/Milk (No Sugar)", pm: ["Bicycle Crunches, Leg Raises"], d: "1c Egg Curry + 0.5c Rice" }
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
        card.querySelectorAll('.drop').forEach(dr => dr.classList.toggle('active', dr.getAttribute('data-val') <= (data[`water-${i}`] || 0)));
        const sleep = data[`sleep-${i}`];
        if(sleep) {
            const starColor = sleep.danger ? "color:var(--danger)" : "color:#fbbf24";
            card.querySelector('.recovery-info').innerHTML = `🛌 Recovery: ${sleep.time} | <span style="${starColor}">${"★".repeat(sleep.stars)}</span>`;
        }
        const log = data[`manual-log-${i}`];
        if(log) document.getElementById(`manual-text-${i}`).value = log;
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
    const dayData = rawData[(i-1) % rawData.length];
    const card = document.createElement('div');
    card.id = `card-${i}`; card.className = `card ${dDate.getTime() === TODAY.getTime() ? 'is-today' : ''}`;
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between"><strong>Day ${i}</strong><small>${dDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</small></div>
        <div class="water-tracker">${[1,2,3,4].map(n => `<span class="drop" data-val="${n}">💧</span>`).join('')}</div>
        <div style="font-size:0.75rem; font-weight:800; color:#991b1b; background:#fff1f2; padding:10px; border-radius:12px; margin:15px 0;">
            <input type="checkbox" class="garlic-cb" id="g-${i}"> <label for="g-${i}">🧄 Raw Garlic Dose</label>
        </div>
        <div class="workout-section">
            <p style="font-size:0.6rem; font-weight:900; color:var(--text-dim); margin:0 0 5px 0; text-transform:uppercase;">🌅 Morning Workout</p>
            ${dayData.am.map(ex => `<div class="exercise-item">${ex}</div>`).join('')}
            <p style="font-size:0.6rem; font-weight:900; color:var(--text-dim); margin:10px 0 5px 0; text-transform:uppercase;">🌇 Evening Core</p>
            ${dayData.pm.map(ex => `<div class="exercise-item">${ex}</div>`).join('')}
        </div>
        <div class="recovery-info"></div>
        <div class="diet-box">
            <div class="diet-item">🍳 ${dayData.b}</div><div class="diet-item">🍲 ${dayData.l}</div>
            <div class="diet-item">☕ ${dayData.s}</div><div class="diet-item">🫓 ${dayData.d}</div>
        </div>
        <div class="manual-log-section no-print">
            <textarea id="manual-text-${i}" rows="2" placeholder="Write extra notes..."></textarea>
            <button onclick="saveManualLog(${i})">SAVE NOTE</button>
        </div>
        <div style="margin-top:20px; border-top:1px solid #f1f5f9; padding-top:15px;">
            <input type="checkbox" class="day-cb" id="d-${i}" style="width:20px; height:20px; cursor:pointer;"> 
            <label for="d-${i}" style="font-weight:800; cursor:pointer; margin-left:8px;">TARGET MET</label>
        </div>
    `;
    card.querySelector('.day-cb').onchange = (e) => db.ref(`${USER_KEY}/day-${i}`).set(e.target.checked);
    card.querySelector('.garlic-cb').onchange = (e) => db.ref(`${USER_KEY}/garlic-${i}`).set(e.target.checked);
    card.querySelectorAll('.drop').forEach(dr => dr.onclick = () => db.ref(`${USER_KEY}/water-${i}`).set(dr.getAttribute('data-val')));
    grid.appendChild(card);
}
document.getElementById('reset-btn').onclick = () => { if(confirm("Clear cloud data?")) db.ref(USER_KEY).remove(); };