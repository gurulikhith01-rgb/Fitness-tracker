/* START DATE: Feb 25, 2026 */
const START_DATE = new Date(2026, 1, 25);
const TODAY = new Date(); TODAY.setHours(0,0,0,0);

document.getElementById('header-date').innerText = TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/* FULL 30-DAY SCHEDULE DATA FROM CSV */
const schedule = [
    { am: "Treadmill + 1s Pushup/Squat + Crunches", pm: "Plank, High Plank, Bird-Dog", b: "Kichidi (Moderate)", l: "Green Leave Pappu, Dondakaya Curry", s: "Guggillu", d: "Bagara Rice + Protein" },
    { am: "Treadmill + 1s Pushup/Squat + Rev Crunches", pm: "Bicycle Crunches, Leg Raises", b: "Idly (3-4 pcs)", l: "Pudhina Rice, Tomato Pappu", s: "White Senagalu", d: "2 Chapathi + Aalu Curma" },
    { am: "Treadmill + 1s Pushup/Squat + Bicycle Crunches", pm: "Plank, High Plank (No Side Planks)", b: "Karam Dosa 1pc", l: "Green Leave Pappu, Bendakaya Pulusu", s: "Watermelon Pieces", d: "1.5c Egg Fried Rice" },
    { am: "Treadmill + 1s Pushup/Squat + Russian Twists", pm: "Bicycle Crunches, Russian Twists", b: "Idly (Skip Bonda)", l: "Pappu, Cabbage+Carrot Iguru", s: "Red Senagalu", d: "2 Chapathi + Tomato Pappu" },
    { am: "20m Incline Walk + 3s Lunges", pm: "Active Rest Walk", b: "Upma", l: "Mixed Veg Curry", s: "Roasted Chana", d: "1 Chapathi + Veg Bowl" }
];

const grid = document.getElementById('workout-grid');

function updateGlobalStats() {
    const total = 30;
    const completed = document.querySelectorAll('.day-cb:checked').length;
    const pct = Math.round((completed / total) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('pct-text').innerText = pct + '%';

    let streak = 0;
    for(let i=1; i<=30; i++) {
        if(localStorage.getItem(`nani-day-${i}`) === 'true') streak++;
        else break;
    }
    document.getElementById('streak-count').innerText = streak;
}

function renderExtras(day, container) {
    container.innerHTML = '';
    const items = JSON.parse(localStorage.getItem(`extras-${day}`) || "[]");
    items.forEach(text => {
        const li = document.createElement('li');
        li.className = 'extra-item';
        li.innerText = `+ ${text}`;
        container.appendChild(li);
    });
}

for (let i = 1; i <= 30; i++) {
    const d = new Date(START_DATE); d.setDate(START_DATE.getDate() + (i-1));
    const isToday = d.getTime() === TODAY.getTime();
    const data = schedule[(i-1) % schedule.length];
    
    const daySaved = localStorage.getItem(`nani-day-${i}`) === 'true';
    const garlicSaved = localStorage.getItem(`nani-garlic-${i}`) === 'true';
    const waterLevel = parseInt(localStorage.getItem(`nani-water-${i}`)) || 0;

    const card = document.createElement('div');
    card.className = `card ${daySaved ? 'completed' : ''} ${isToday ? 'is-today' : ''}`;
    card.innerHTML = `
        <div style="display:flex; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; font-size:1.1rem; font-weight:800;">Day ${i}</h3>
            ${isToday ? '<span class="no-print" style="background:#3b82f6; color:white; padding:2px 8px; border-radius:4px; font-size:0.6rem; margin-left:10px; font-weight:800;">TODAY</span>' : ''}
            <span style="margin-left:auto; font-size:0.7rem; font-weight:800; color:#94a3b8;">${d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'}).toUpperCase()}</span>
        </div>

        <div class="water-tracker no-print">
            ${[1,2,3,4].map(n => `<span class="drop ${n <= waterLevel ? 'active' : ''}" data-val="${n}">💧</span>`).join('')}
            <small style="margin-left:auto; font-size:0.6rem; opacity:0.6">4L WATER GOAL</small>
        </div>

        <div class="habit-row">
            <input type="checkbox" class="garlic-cb no-print" id="g-${i}" ${garlicSaved ? 'checked' : ''}>
            <label for="g-${i}" style="cursor:pointer">🧄 Raw Garlic (06:40 AM)</label>
        </div>

        <div class="workout-box">
            <strong>🏋️ 05:30:</strong> ${data.am}<br>
            <strong>🔥 05:00:</strong> ${data.pm}
        </div>

        <div class="diet-box">
            🍳 ${data.b} | 🍲 ${data.l}<br>
            🍎 ${data.s} | 🫓 ${data.d}
        </div>

        <div class="extra-section no-print">
            <div class="extra-input-group">
                <input type="text" class="extra-input" placeholder="Extra workout..." id="in-${i}">
                <button class="add-btn" id="btn-${i}">+</button>
            </div>
            <ul class="extra-list" id="list-${i}"></ul>
        </div>

        <div style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;" class="no-print">
            <input type="checkbox" class="day-cb" id="d-${i}" ${daySaved ? 'checked' : ''}>
            <label for="d-${i}" style="font-weight:800; cursor:pointer;">SESSION COMPLETE</label>
        </div>
    `;

    /* WATER LOGIC */
    card.querySelectorAll('.drop').forEach(dr => {
        dr.onclick = () => {
            const val = dr.getAttribute('data-val');
            localStorage.setItem(`nani-water-${i}`, val);
            card.querySelectorAll('.drop').forEach(d2 => d2.classList.toggle('active', d2.getAttribute('data-val') <= val));
        }
    });

    /* EXTRA ACTIVITY LOGIC */
    const extraList = card.querySelector(`#list-${i}`);
    renderExtras(i, extraList);
    card.querySelector(`#btn-${i}`).onclick = () => {
        const val = card.querySelector(`#in-${i}`).value.trim();
        if(!val) return;
        const list = JSON.parse(localStorage.getItem(`extras-${i}`) || "[]");
        list.push(val); localStorage.setItem(`extras-${i}`, JSON.stringify(list));
        card.querySelector(`#in-${i}`).value = ''; renderExtras(i, extraList);
    };

    /* SAVE LOGIC */
    card.querySelector('.garlic-cb').onclick = (e) => localStorage.setItem(`nani-garlic-${i}`, e.target.checked);
    card.querySelector('.day-cb').onclick = (e) => {
        localStorage.setItem(`nani-day-${i}`, e.target.checked);
        card.classList.toggle('completed', e.target.checked);
        updateGlobalStats();
    };

    grid.appendChild(card);
}

document.getElementById('print-btn').onclick = () => window.print();
document.getElementById('reset-btn').onclick = () => { if(confirm("Clear progress?")) { localStorage.clear(); location.reload(); }};
updateGlobalStats();