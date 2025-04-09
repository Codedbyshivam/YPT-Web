let hasStartedOnce = false;
let activeSubject = null;
let pendingSubject = null;

const subjects = {};

function format(val) {
    return val < 10 ? "0" + val : val;
}

function updateSubjectTimer(subjectId) {
    const obj = subjects[subjectId];
    obj.s++;
    if (obj.s === 60) { obj.s = 0; obj.m++; }
    if (obj.m === 60) { obj.m = 0; obj.h++; }

    document.getElementById(`${subjectId}-timer`).textContent =
        `${format(obj.h)}:${format(obj.m)}:${format(obj.s)}`;

    updateMainTimer();
}

function updateMainTimer() {
    let totalS = 0, totalM = 0, totalH = 0;

    for (let key in subjects) {
        totalS += subjects[key].s;
        totalM += subjects[key].m;
        totalH += subjects[key].h;
    }

    totalM += Math.floor(totalS / 60);
    totalS = totalS % 60;
    totalH += Math.floor(totalM / 60);
    totalM = totalM % 60;

    const formatted = `${format(totalH)}:${format(totalM)}:${format(totalS)}`;

    // Update orange bar timer
    const mainClock = document.getElementById("digitalClock");
    if (mainClock) mainClock.textContent = formatted;
}


function toggleSubjectTimer(subjectId) {
    if (subjectId === activeSubject) {
        stopSubject(subjectId);
        return;
    }

    const isAnotherRunning = activeSubject !== null;

    if (hasStartedOnce && isAnotherRunning) {
        pendingSubject = subjectId;
        document.getElementById("confirmModal").style.display = "flex";
    } else {
        startSubject(subjectId);
    }
}

function startSubject(subjectId) {
    const btn = document.getElementById(`${subjectId}-btn`);

    // Stop focus timer if active
    if (focusInterval) {
        pauseFocusTimer();
    }

    subjects[subjectId].interval = setInterval(() => {
        updateSubjectTimer(subjectId);
        updateDailyTotalTime(); // ⬅️ Add this
    }, 1000);

    btn.textContent = "⏸";
    btn.classList.add("active");

    activeSubject = subjectId;
    hasStartedOnce = true;

    updateMainTimer();
}


function stopSubject(subjectId) {
    const btn = document.getElementById(`${subjectId}-btn`);

    clearInterval(subjects[subjectId].interval);
    subjects[subjectId].interval = null;
    btn.textContent = "▶";
    btn.classList.remove("active");

    if (activeSubject === subjectId) activeSubject = null;

    updateMainTimer(); // 🟢 Update immediately when timer stops
}

// Modal controls (optional)
document.getElementById("confirmYes").onclick = () => {
    document.getElementById("confirmModal").style.display = "none";

    if (activeSubject) stopSubject(activeSubject);
    if (pendingSubject) {
        startSubject(pendingSubject);
        pendingSubject = null;
    }
};

document.getElementById("confirmNo").onclick = () => {
    document.getElementById("confirmModal").style.display = "none";
    pendingSubject = null;
};

// Dynamically add subject
function addSubject(name) {
    const id = name.toLowerCase().replace(/\s+/g, '-');

    if (subjects[id]) {
        alert("Subject already exists!");
        return;
    }

    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
    <button id="${id}-btn" onclick="toggleSubjectTimer('${id}')">▶</button>
    <div class="subject-info">
      <h2>${name}</h2>
      <p id="${id}-timer">00:00:00</p>
    </div>
  `;

    document.getElementById('subject-list').appendChild(card);
    subjects[id] = { s: 0, m: 0, h: 0, interval: null };
}



function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab");
    const pages = document.querySelectorAll(".tab-page");

    tabs.forEach(tab => tab.classList.remove("active"));
    pages.forEach(page => page.classList.remove("active-tab"));

    document.querySelector(`.tab-nav button[onclick*="${tabName}"]`).classList.add("active");
    document.getElementById(`${tabName}-tab`).classList.add("active-tab");
}
setInterval(updateMainTimer, 1000);


const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// On load, check saved theme and update label
document.addEventListener("DOMContentLoaded", () => {
    // 🌙 Dark mode setup
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.body.classList.add("dark-mode");
      document.getElementById("themeToggle").innerHTML = "🌞 Light Mode";
    } else {
      document.getElementById("themeToggle").innerHTML = "🌙 Dark Mode";
    }
  
    // 🧠 Add default subjects
    addSubject("Math");
    addSubject("English");
    addSubject("Science");
  
    // 🟠 Reset main timer text
    const mainTimer = document.getElementById("main-timer");
    if (mainTimer) {
      mainTimer.textContent = "00:00:00";
    }
  
    // ✅ Switch to Subjects tab after a short delay to make sure everything's rendered
    setTimeout(() => {
      switchTab("subjects");
    }, 50);
  });
  

// Toggle theme + update label + save preference
themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);

    themeToggle.innerHTML = isDark ? "🌞 Light Mode" : "🌙 Dark Mode";
});

// Show the Add Subject modal
document.getElementById("add-subject-btn").onclick = () => {
    const modal = document.getElementById("addSubjectModal");
    modal.style.display = "flex";
    document.getElementById("newSubjectInput").value = ""; // Clear previous input
    document.getElementById("newSubjectInput").focus();
};

// Confirm Add Subject
document.getElementById("addSubjectConfirm").onclick = () => {
    const name = document.getElementById("newSubjectInput").value.trim();
    if (name !== "") {
        addSubject(name);
        document.getElementById("addSubjectModal").style.display = "none";
    } else {
        alert("Please enter a valid subject name.");
    }
};

// Cancel Add Subject
document.getElementById("addSubjectCancel").onclick = () => {
    document.getElementById("addSubjectModal").style.display = "none";
};


let focusSeconds = 0;
let focusInterval = null;

function updateFocusDisplay() {
    const hours = String(Math.floor(focusSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((focusSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(focusSeconds % 60).padStart(2, "0");
    document.getElementById("focus-time").textContent = `${hours}:${minutes}:${seconds}`;
}

function startFocusTimer() {
    if (focusInterval) return;

    // Stop active subject timer if running
    if (activeSubject) {
        stopSubject(activeSubject);
    }

    focusInterval = setInterval(() => {
        focusSeconds++;
        updateFocusDisplay();
        updateMainTimer(); // Also update main clock
        updateDailyTotalTime(); // Update daily time
    }, 1000);
}


function pauseFocusTimer() {
    clearInterval(focusInterval);
    focusInterval = null;
}

function resetFocusTimer() {
    clearInterval(focusInterval);
    focusInterval = null;
    focusSeconds = 0;
    updateFocusDisplay();
}

// Optional: auto init display
updateFocusDisplay();
// Break Timer Variables
let breakSeconds = 0;
let breakInterval = null;

function updateBreakTime() {
    const hrs = String(Math.floor(breakSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((breakSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(breakSeconds % 60).padStart(2, '0');
    document.getElementById("break-time").textContent = `${hrs}:${mins}:${secs}`;
}

function startBreakTimer() {
    if (!breakInterval) {
        breakInterval = setInterval(() => {
            breakSeconds++;
            updateBreakTime();
        }, 1000);
    }
}

function pauseBreakTimer() {
    clearInterval(breakInterval);
    breakInterval = null;
}

function resetBreakTimer() {
    clearInterval(breakInterval);
    breakInterval = null;
    breakSeconds = 0;
    updateBreakTime();
}
function updateDailyTotalTime() {
    let totalSeconds = focusSeconds; // Start with focus timer

    // Add all subject timers
    for (let key in subjects) {
        const { h, m, s } = subjects[key];
        totalSeconds += h * 3600 + m * 60 + s;
    }

    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');

    document.getElementById('daily-total-time').textContent = `${hrs}:${mins}:${secs}`;
}
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("welcome-screen").style.display = "none";
    }, 3000); // 3 seconds
});
let countdownInterval;
let countdownTotal = 0; // total countdown time in seconds
let remainingTime = 0;
let isPaused = false;

const countdownInput = document.getElementById('countdown-input');
const countdownDisplay = document.getElementById('countdown-display');
const startBtn = document.getElementById('countdown-start');
const pauseBtn = document.getElementById('countdown-pause');
const resetBtn = document.getElementById('countdown-reset');

const ring = document.querySelector(".progress-ring-circle");
const radius = 50;
const circumference = 2 * Math.PI * radius;
ring.style.strokeDasharray = `${circumference}`;
ring.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = offset;
}

// Unified countdown display update
function updateCountdownDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    countdownDisplay.textContent = formatted;

    const percent = countdownTotal > 0 ? ((countdownTotal - remainingTime) / countdownTotal) * 100 : 0;
    setProgress(percent);
}

function startCountdown() {
    if (!isPaused) {
        const minutes = parseInt(countdownInput.value);
        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }
        countdownTotal = minutes * 60;
        remainingTime = countdownTotal;
    }

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            updateCountdownDisplay();
        } else {
            clearInterval(countdownInterval);
            isPaused = false; // Reset pause state when done
            countdownDisplay.textContent = "⏰ Done!";
    
            // ▶️ Play the alarm sound
            const alarm = document.getElementById("alarmSound");
            if (alarm) {
                alarm.play().catch(e => console.log("Sound playback failed:", e));
            }
        }
    }, 1000);
    
    isPaused = false;}
    

function pauseCountdown() {
    clearInterval(countdownInterval);
    isPaused = true;
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownInput.value = '';
    countdownTotal = 0;
    remainingTime = 0;
    isPaused = false;
    updateCountdownDisplay();
}

// Attach event listeners
startBtn.addEventListener('click', startCountdown);
pauseBtn.addEventListener('click', pauseCountdown);
resetBtn.addEventListener('click', resetCountdown);

// Set initial display
updateCountdownDisplay();

