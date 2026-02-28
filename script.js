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

// --- SESSION STOPWATCH LOGIC ---
let stopwatchInterval;
let startTime;
let elapsedSeconds = 0;

function toggleGymSession() {
    const btn = document.getElementById('session-btn');
    const status = document.getElementById('session-status');

    if (!stopwatchInterval) {
        // START SESSION
        startTime = Date.now() - (elapsedSeconds * 1000);
        stopwatchInterval = setInterval(updateStopwatchDisplay, 1000);
        btn.innerText = "END GYM SESSION";
        btn.className = "stop-btn";
        status.innerText = "LIVE AT GYM";
        status.style.color = "#10b981";
    } else {
        // END SESSION
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        const totalTime = document.getElementById('stopwatch-text').innerText;
        
        // Save current session time to Cloud for Today
        const dayDiff = Math.floor((TODAY - START_DATE) / (1000 * 60 * 60 * 24)) + 1;
        db.ref(`${USER_KEY}/session-${dayDiff}`).set(totalTime);
        
        btn.innerText = "START SESSION";
        btn.className = "start-btn";
        status.innerText = "SESSION SAVED";
        alert("Workout saved: " + totalTime);
    }
}

function updateStopwatchDisplay() {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;
    document.getElementById('stopwatch-text').innerText = 
        `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    elapsedSeconds = 0;
    document.getElementById('stopwatch-text').innerText = "00:00:00";
    document.getElementById('session-btn').innerText = "START SESSION";
    document.getElementById('session-btn').className = "start-btn";
}

function toggleGymMode() { document.getElementById('app-body').classList.toggle('gym-mode-active'); }

// --- SCHEDULE DATA ---
const schedule = [
    { am: "Treadmill + Pushups/Squat + Crunches", pm: "Plank, High Plank, Bird-Dog", b: "Kichidi", l: "Dondakaya Curry", d: "Bagara Rice" },
    { am: "Treadmill + Pushups/Squat + Rev Crunches", pm: "Bicycle Crunches, Leg Raises", b: "Idly (3-4)", l: "Tomato Pappu", d: "2 Chapathi" },
    { am: "Treadmill + Pushups/Squat + Bicycle Crunches", pm: "Full Plank Hold", b: "Karam Dosa", l: "Bendakaya Pulusu", d: "Egg Fried Rice" },
    { am: "Treadmill + Pushups/Squat + Russian Twists", pm: "Bicycle Crunches + Twists", b: "Idly (4)", l: "Cabbage Carrot", d: "2 Chapathi" },
    { am: "20m Incline Walk + 3s Lunges", pm: "Active Walk", b: "Upma", l: "Mixed Veg Curry", d: "1 Chapathi + Veg" }
];

// --- LIVE CLOUD SYNC ---
db.ref(USER_KEY).on('value', snap => {
    const data = snap.val() || {};
    let doneCount = 0;
    for(let i=1; i<=30; i++) {
        const card = document.getElementById(`card-${i}`);
        if(!card) continue;
        const isDone = data[`day-${i}`] || false;
        card.classList.toggle('completed', isDone);
        card.querySelector('.day-cb').checked = isDone;
        card.querySelector('.garlic-cb').checked = data[`garlic-${i}`] || false;
        const waterVal = data[`water-${i}`] || 0;
        card.querySelectorAll('.drop').forEach(dr => dr.classList.toggle('active', dr.getAttribute('data-val') <= waterVal));
        
        // Update session time on card if saved
        const sTime = data[`session-${i}`];
        card.querySelector('.session-time-badge').innerText = sTime ? `Gym Session: ${sTime}` : "";

        if(isDone) doneCount++;
    }
    document.getElementById('progress-fill').style.width = (doneCount/30*100)+'%';
    document.getElementById('pct-text').innerText = Math.round(doneCount/30*100)+'%';
    let streak = 0; for(let i=1; i<=30; i++) { if(data[`day-${i}`]) streak++; else break; }
    document.getElementById('streak-count').innerText = streak;
});

// --- BUILD GRID ---
const grid = document.getElementById('workout-grid');
for (let i = 1; i <= 30; i++) {
    const dDate = new Date(START_DATE); dDate.setDate(START_DATE.getDate() + (i-1));
    const isToday = dDate.getTime() === TODAY.getTime();
    const dayData = schedule[(i-1) % schedule.length];
    const card = document.createElement('div');
    card.id = `card-${i}`; card.className = `card ${isToday ? 'is-today' : ''}`;
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between"><strong>Day ${i}</strong><small>${dDate.getDate()} ${dDate.toLocaleString('en',{month:'short'})}</small></div>
        <div class="water-tracker no-print">
            ${[1,2,3,4].map(n => `<span class="drop" data-val="${n}">💧</span>`).join('')}
        </div>
        <div class="habit-row"><input type="checkbox" class="garlic-cb" id="g-${i}"><label for="g-${i}">🧄 Raw Garlic (06:40)</label></div>
        <div class="workout-box">🏃 AM: ${dayData.am}<br>🔥 PM: ${dayData.pm}</div>
        <div class="diet-box">🍳 ${dayData.b} | 🍲 ${dayData.l} | 🫓 ${dayData.d}</div>
        <span class="session-time-badge"></span>
        <div style="margin-top:15px" class="no-print"><input type="checkbox" class="day-cb" id="d-${i}"> <label for="d-${i}"><strong>SESSION COMPLETE</strong></label></div>
    `;
    card.querySelector('.day-cb').onchange = (e) => db.ref(`${USER_KEY}/day-${i}`).set(e.target.checked);
    card.querySelector('.garlic-cb').onchange = (e) => db.ref(`${USER_KEY}/garlic-${i}`).set(e.target.checked);
    card.querySelectorAll('.drop').forEach(dr => {
        dr.onclick = () => db.ref(`${USER_KEY}/water-${i}`).set(dr.getAttribute('data-val'));
    });
    grid.appendChild(card);
}
document.getElementById('reset-btn').onclick = () => { if(confirm("Clear cloud data?")) db.ref(USER_KEY).remove(); };