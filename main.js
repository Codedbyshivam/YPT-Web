let hasStartedOnce = false;
let activeSubject = null;
let pendingSubject = null;

const subjects = {};

if (window.location.pathname.includes("group-detail.html")) {
    document.addEventListener("DOMContentLoaded", () => {
      const group = JSON.parse(localStorage.getItem("selectedGroup"));
      const nameEl = document.getElementById("groupName");
  
      if (group && group.name) {
        nameEl.textContent = group.name;
      } else {
        nameEl.textContent = "Unknown Group";
      }
    });
  }

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
    // DARK MODE SETUP
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
        document.getElementById("themeToggle").innerHTML = "🌞 Light Mode";
    } else {
        document.getElementById("themeToggle").innerHTML = "🌙 Dark Mode";
    }
  
    if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  
    // DEFAULT SUBJECTS
    addSubject("Math");
    addSubject("English");
    addSubject("Science");
  
    // Reset Main Timer Text
    const mainTimer = document.getElementById("main-timer");
    if (mainTimer) {
        mainTimer.textContent = "00:00:00";
    }
  
    // Tab Switch
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

    isPaused = false;
}


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
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

// Load tasks from localStorage on page load

// Save tasks to localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll("#pendingTasks li, #completedTasks li").forEach(li => {
        tasks.push({
            text: li.querySelector(".task-text").textContent,
            priority: li.dataset.priority,
            dueDate: li.dataset.dueDate || "",
            completed: li.parentElement.id === "completedTasks"
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        addTaskToDOM(task.text, task.priority, task.dueDate, task.completed);
    });
}

addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (text === "") {
        showToast("Please enter a task.");
        return;
    }


    addTaskToDOM(text, priority, dueDate, false);
    taskInput.value = "";
    dueDateInput.value = "";
    saveTasks();
});

function addTaskToDOM(text, priority, dueDate, completed = false) {
    const li = document.createElement("li");
    li.className = `task-item ${priority}`;
    li.setAttribute("draggable", "true");
    li.dataset.priority = priority;
    li.dataset.dueDate = dueDate;

    li.innerHTML = `
  <span class="task-text">${text}</span>
  <div class="task-buttons">
    <button onclick="markDone(this)">✅</button>
    <button onclick="editTask(this)">✏️</button>
    <button onclick="deleteTask(this)">❌</button>
  </div>
`;


    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", handleDrop);

    if (completed) {
        li.classList.add("completed");
        li.querySelector(".task-buttons").children[1].remove(); // remove ✅
        completedTasks.appendChild(li);
    } else {
        pendingTasks.appendChild(li);
    }
}

function markDone(btn) {
    const task = btn.closest("li");
    task.classList.add("completed");
    btn.remove(); // remove ✅
    completedTasks.appendChild(task);
    saveTasks();
}

function deleteTask(btn) {
    btn.closest("li").remove();
    saveTasks();
}

function editTask(btn) {
    const li = btn.closest("li");
    const currentText = li.querySelector(".task-text").textContent;
    const newText = prompt("Edit your task:", currentText);
    if (newText !== null && newText.trim() !== "") {
        li.querySelector(".task-text").textContent = newText;
        saveTasks();
    }
}

// Drag and drop logic
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = "move";
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const list = this.parentElement;
        list.insertBefore(draggedItem, this);
        saveTasks();
    }
}
let currentEditTask = null;

function editTask(btn) {
    currentEditTask = btn.closest("li");
    const currentText = currentEditTask.querySelector(".task-text").textContent;
    document.getElementById("editTaskInput").value = currentText;
    document.getElementById("editTaskModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editTaskModal").style.display = "none";
    currentEditTask = null;
}

document.getElementById("saveEditBtn").onclick = () => {
    const newText = document.getElementById("editTaskInput").value.trim();
    if (newText !== "" && currentEditTask) {
        currentEditTask.querySelector(".task-text").textContent = newText;
        closeEditModal();
        saveTasks(); // Optional: re-save to localStorage
    }
};
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500); // Hide after 2.5s
}
document.getElementById("filterBtn").onclick = () => {
    document.getElementById("filterModal").style.display = "flex";
};

document.getElementById("cancelFilter").onclick = () => {
    document.getElementById("filterModal").style.display = "none";
};

document.getElementById("applyFilter").onclick = () => {
    applyFilter();
    document.getElementById("filterModal").style.display = "none";
};
function applyFilter() {
    const priority = document.getElementById("filterPriority").value;
    const status = document.getElementById("filterStatus").value;
    const dueDate = document.getElementById("filterDueDate").value;

    const tasks = document.querySelectorAll(".task-item");
    tasks.forEach(task => {
        let show = true;

        // Priority filter
        if (priority !== "all" && !task.classList.contains(priority)) {
            show = false;
        }

        // Status filter
        if (status === "pending" && task.classList.contains("completed")) {
            show = false;
        }
        if (status === "completed" && !task.classList.contains("completed")) {
            show = false;
        }

        // Due date filter (only if task has data-date)
        const taskDate = task.getAttribute("data-date");
        if (dueDate && taskDate && new Date(taskDate) > new Date(dueDate)) {
            show = false;
        }

        task.style.display = show ? "flex" : "none";
    });
}
function checkTaskReminders() {
    const now = new Date();

    const tasks = document.querySelectorAll("#pendingTasks li");

    tasks.forEach(task => {
        const due = task.getAttribute("data-due");
        if (!due || task.classList.contains("notified")) return;

        const dueTime = new Date(due);
        const diffMinutes = (dueTime - now) / (1000 * 60);

        if (diffMinutes <= 30 && diffMinutes > 0) {
            // Mark as notified to prevent repeated alerts
            task.classList.add("notified");

            // Show Notification
            if (Notification.permission === "granted") {
                new Notification("📌 Reminder", {
                    body: `Your task "${task.dataset.text}" is due in ${Math.ceil(diffMinutes)} minutes!`
                });
            }

            // Optional: also show in-app popup
            showToast(`Reminder: "${task.dataset.text}" is due soon!`);
        }
    });
}

// Create a new list item (li) element
function createListItem() { // Move the code into a function, so it can be called later
    const li = document.createElement("li"); // Assign the created li to the li variable

    // Get the value from the date input and assign it to dueDateValue.
    const dueDateValue = document.getElementById("dueDateInput").value;
    // Get the value from the text input and assign it to text.
    const text = document.getElementById("taskTextInput").value;

    li.setAttribute("data-due", dueDateValue);  // Use dueDateValue that was taken from the date input.
    li.setAttribute("data-text", text);         // For notifications
    return li;
}

// Run every minute
setInterval(checkTaskReminders, 60 * 1000);

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3500);
}



let userGroups = JSON.parse(localStorage.getItem("userGroups")) || [];
let currentGroupMode = null; // either 'create' or 'join'
// The following functions will now have access to the initialized variable currentGroupMode.

function openGroupModal(mode) {
  currentGroupMode = mode; // This line was previously the problem, and is now safe.

  const modal = document.getElementById("groupModal");
  const title = document.getElementById("groupModalTitle");
  const input = document.getElementById("groupInput");

  modal.style.display = "flex";
  input.value = "";

  title.textContent = mode === "create" ? "Create a New Group" : "Join a Group";
  input.placeholder = mode === "create" ? "Enter group name..." : "Enter group code...";
}

function closeGroupModal() {
  document.getElementById("groupModal").style.display = "none";
}

function renderMyGroups() {
    const container = document.getElementById("myGroupsList");
    container.innerHTML = "";
  
    if (userGroups.length === 0) {
      container.innerHTML = "<p>No groups yet.</p>";
      return;
    }
  
    userGroups.forEach(group => {
      const div = document.createElement("div");
      div.className = "group-card";
      div.innerHTML = `<strong>${group.name}</strong> ${group.owner ? "<span class='owner-tag'>(Owner)</span>" : ""}`;
  
      // 👇 Add group redirection logic
      div.addEventListener("click", () => {
        localStorage.setItem("selectedGroup", JSON.stringify(group));
        window.location.href = "group-detail.html"; // 👈 Your target group detail page
      });
  
      container.appendChild(div);
    });
  }
  
  function showPopup(message) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "#ff6600";
    popup.style.color = "white";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "6px";
    popup.style.zIndex = "9999";
    popup.style.fontFamily = "Poppins, sans-serif";
    popup.style.fontWeight = "bold";
    popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    document.body.appendChild(popup);
  
    setTimeout(() => popup.remove(), 2500);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    renderMyGroups();
  
    const confirmBtn = document.getElementById("groupConfirmBtn");
    confirmBtn.addEventListener("click", () => {
      const input = document.getElementById("groupInput");
      const name = input.value.trim();
      if (!name) {
        showPopup("Please enter a valid group name.");
        return;
      }
  
      const exists = userGroups.some(g => g.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        showPopup("You already have this group.");
        return;
      }
  
      userGroups.push({
        name,
        owner: currentGroupMode === "create"
      });
  
      localStorage.setItem("userGroups", JSON.stringify(userGroups));
      renderMyGroups();
      closeGroupModal();
  
      showPopup(currentGroupMode === "create"
        ? `✅ Group "${name}" created!`
        : `🔗 Joined "${name}"`);
    });
  });


