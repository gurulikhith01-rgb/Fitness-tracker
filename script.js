/* FIREBASE CONFIGURATION */
const firebaseConfig = {
  apiKey: "AIzaSyDiC6U5wU1HufsKonu0yZ7GZtqVw8woEnk",
  authDomain: "fitness-tracker-1fe61.firebaseapp.com",
  databaseURL: "https://fitness-tracker-1fe61-default-rtdb.firebaseio.com",
  projectId: "fitness-tracker-1fe61",
  storageBucket: "fitness-tracker-1fe61.appspot.com",
  messagingSenderId: "1098616149591",
  appId: "1:1098616149591:web:d27457731236100c56360c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const USER_PATH = "U_Guru_Likhith_Reddy";

const START_DATE = new Date(2026, 1, 25);
const TODAY = new Date(); TODAY.setHours(0,0,0,0);

document.getElementById('header-date').innerText = TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const schedule = [
    { am: "Treadmill + Pushups/Squat + Crunches", pm: "Plank, High Plank, Bird-Dog", b: "Kichidi", bq: "1 Bowl", l: "Dondakaya Curry", lq: "2 Scoops + Fist Rice", s: "Guggillu", sq: "Half Cup", d: "Bagara Rice", dq: "1 Cup" },
    { am: "Treadmill + Pushups/Squat + Rev Crunches", pm: "Bicycle Crunches, Leg Raises", b: "Idly", bq: "3-4 Pcs", l: "Tomato Pappu", lq: "2 Scoops + Fist Rice", s: "White Senagalu", sq: "Bowl", d: "2 Chapathi", dq: "2 Pcs" },
    { am: "Treadmill + Pushups/Squat + Bicycle Crunches", pm: "Plank (No Side Planks)", b: "Karam Dosa", bq: "1 Pc", l: "Bendakaya Pulusu", lq: "2 Scoops + Fist Rice", s: "Watermelon", sq: "3 Pcs", d: "Egg Fried Rice", dq: "1.5 Cups" },
    { am: "Treadmill + Pushups/Squat + Russian Twists", pm: "Bicycle Crunches, Russian Twists", b: "Idly", bq: "4 Pcs", l: "Cabbage Carrot", lq: "2 Scoops + Fist Rice", s: "Red Senagalu", sq: "Bowl", d: "2 Chapathi", dq: "2 Pcs" },
    { am: "20m Incline Walk + 3s Lunges", pm: "Active Rest Walk", b: "Upma", bq: "1 Bowl", l: "Mixed Veg Curry", lq: "Large Portion", s: "Roasted Chana", sq: "Handful", d: "1 Chapathi", dq: "1 Pc + Veg" }
];

const grid = document.getElementById('workout-grid');

// SYNC DATA FROM CLOUD
function syncFromCloud() {
    db.ref(USER_PATH).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        let completedCount = 0;
        for (let i = 1; i <= 30; i++) {
            const card = document.getElementById(`card-${i}`);
            if (!card) continue;

            const isDone = data[`day-${i}`] || false;
            const isGarlic = data[`garlic-${i}`] || false;
            const waterLvl = data[`water-${i}`] || 0;

            card.classList.toggle('completed', isDone);
            card.querySelector('.day-cb').checked = isDone;
            card.querySelector('.garlic-cb').checked = isGarlic;
            
            card.querySelectorAll('.drop').forEach(dr => {
                dr.classList.toggle('active', dr.getAttribute('data-val') <= waterLvl);
            });

            if (isDone) completedCount++;
        }

        const pct = Math.round((completedCount / 30) * 100);
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('pct-text').innerText = pct + '%';
        
        let streak = 0;
        for(let i=1; i<=30; i++) {
            if(data[`day-${i}`]) streak++;
            else break;
        }
        document.getElementById('streak-count').innerText = streak;
    });
}

// GENERATE GRID
for (let i = 1; i <= 30; i++) {
    const d = new Date(START_DATE); d.setDate(START_DATE.getDate() + (i-1));
    const isToday = d.getTime() === TODAY.getTime();
    const data = schedule[(i-1) % schedule.length];

    const card = document.createElement('div');
    card.id = `card-${i}`;
    card.className = `card ${isToday ? 'is-today' : ''}`;
    card.innerHTML = `
        <div style="display:flex; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; font-size:1.1rem; font-weight:800;">Day ${i}</h3>
            ${isToday ? '<span class="no-print" style="background:#3b82f6; color:white; padding:2px 8px; border-radius:4px; font-size:0.6rem; margin-left:10px; font-weight:800;">TODAY</span>' : ''}
            <span style="margin-left:auto; font-size:0.7rem; font-weight:800; color:#94a3b8;">${d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'}).toUpperCase()}</span>
        </div>

        <div class="water-tracker no-print">
            ${[1,2,3,4].map(n => `<span class="drop" data-val="${n}">💧</span>`).join('')}
            <small style="margin-left:auto; font-size:0.6rem; opacity:0.6">4L WATER</small>
        </div>

        <div class="habit-row">
            <input type="checkbox" class="garlic-cb no-print" id="g-${i}">
            <label for="g-${i}" style="cursor:pointer">🧄 Raw Garlic (06:40 AM)</label>
        </div>

        <div class="workout-box">
            <strong>🏋️ 05:30:</strong> ${data.am}<br>
            <strong>🔥 05:00:</strong> ${data.pm}
        </div>

        <div class="diet-box">
            🍳 ${data.b} <span class="portion-tag">${data.bq}</span> | 🍲 ${data.l} <span class="portion-tag">${data.lq}</span><br>
            🫓 ${data.d} <span class="portion-tag">${data.dq}</span>
        </div>

        <div style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;" class="no-print">
            <input type="checkbox" class="day-cb" id="d-${i}">
            <label for="d-${i}" style="font-weight:800; cursor:pointer;">SESSION COMPLETE</label>
        </div>
    `;

    // SYNC ON CLICK
    card.querySelector('.day-cb').onchange = (e) => db.ref(`${USER_PATH}/day-${i}`).set(e.target.checked);
    card.querySelector('.garlic-cb').onchange = (e) => db.ref(`${USER_PATH}/garlic-${i}`).set(e.target.checked);
    card.querySelectorAll('.drop').forEach(dr => {
        dr.onclick = () => db.ref(`${USER_PATH}/water-${i}`).set(dr.getAttribute('data-val'));
    });

    grid.appendChild(card);
}

document.getElementById('print-btn').onclick = () => window.print();
document.getElementById('reset-btn').onclick = () => { if(confirm("Clear all cloud data?")) db.ref(USER_PATH).remove(); };

syncFromCloud();