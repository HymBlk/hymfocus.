const welcomePage = document.getElementById("welcomePage");
const dashboardPage = document.getElementById("dashboardPage");
const startDailyFocus = document.getElementById("startDailyFocus");

const timerDisplay = document.getElementById("timerDisplay");
const progressCircle = document.getElementById("progressCircle");
const startPauseBtn = document.getElementById("startPauseBtn");
const restartBtn = document.getElementById("restartBtn");
const stopBtn = document.getElementById("stopBtn");
const sessionTitle = document.getElementById("sessionTitle");
const timerWrap = document.getElementById("timerWrap");

const modeButtons = document.querySelectorAll(".mode");
const scrollButtons = document.querySelectorAll("[data-scroll]");
const sideItems = document.querySelectorAll(".side-item");

const settingsPanel = document.getElementById("settingsPanel");
const settingsHead = document.getElementById("settingsHead");
const settingsToggle = document.getElementById("settingsToggle");

const focusMinutesInput = document.getElementById("focusMinutes");
const shortMinutesInput = document.getElementById("shortMinutes");
const longMinutesInput = document.getElementById("longMinutes");
const timerStyleSelect = document.getElementById("timerStyle");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const quickAddTask = document.getElementById("quickAddTask");
const taskList = document.getElementById("taskList");
const taskProgressText = document.getElementById("taskProgressText");
const taskProgressBar = document.getElementById("taskProgressBar");

const notesInput = document.getElementById("notesInput");
const clearNotes = document.getElementById("clearNotes");
const savedStatus = document.getElementById("savedStatus");

const bgInput = document.getElementById("bgInput");
const resetBackground = document.getElementById("resetBackground");

const radius = 96;
const circumference = 2 * Math.PI * radius;

if (progressCircle) {
  progressCircle.style.strokeDasharray = String(circumference);
}

let settings = JSON.parse(localStorage.getItem("hymfocusSettings")) || {
  focus: 25,
  short: 5,
  long: 15,
  timerStyle: "circle"
};

let tasks = JSON.parse(localStorage.getItem("hymfocusTasks")) || [];

let currentMode = "focus";
let totalSeconds = settings.focus * 60;
let remainingSeconds = totalSeconds;
let intervalId = null;
let running = false;

const modeLabels = {
  focus: "Focus Time",
  short: "Short Break",
  long: "Long Break"
};

/* WELCOME TO DASHBOARD */

if (startDailyFocus) {
  startDailyFocus.addEventListener("click", () => {
    welcomePage.classList.add("leaving");

    setTimeout(() => {
      welcomePage.classList.add("hidden");
      dashboardPage.classList.remove("hidden");
    }, 520);
  });
}

/* SCROLL BUTTONS */

scrollButtons.forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.scroll;
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
});

/* SIDEBAR ACTIVE STATE */

sideItems.forEach(item => {
  item.addEventListener("click", () => {
    sideItems.forEach(button => button.classList.remove("active"));
    item.classList.add("active");
  });
});

/* SETTINGS OPEN / CLOSE */

if (settingsHead && settingsPanel && settingsToggle) {
  settingsHead.addEventListener("click", () => {
    settingsPanel.classList.toggle("collapsed");

    if (settingsPanel.classList.contains("collapsed")) {
      settingsToggle.textContent = "⌄";
    } else {
      settingsToggle.textContent = "⌃";
    }
  });
}

/* SETTINGS */

function saveSettings() {
  localStorage.setItem("hymfocusSettings", JSON.stringify(settings));
}

function applySettingsToInputs() {
  focusMinutesInput.value = settings.focus;
  shortMinutesInput.value = settings.short;
  longMinutesInput.value = settings.long;
  timerStyleSelect.value = settings.timerStyle;

  applyTimerStyle();
}

function getModeMinutes(mode) {
  return settings[mode];
}

function updateSettingFromInputs() {
  settings.focus = Math.max(1, Number(focusMinutesInput.value) || 25);
  settings.short = Math.max(1, Number(shortMinutesInput.value) || 5);
  settings.long = Math.max(1, Number(longMinutesInput.value) || 15);
  settings.timerStyle = timerStyleSelect.value;

  saveSettings();
  applyTimerStyle();
  resetToCurrentMode();
}

[focusMinutesInput, shortMinutesInput, longMinutesInput, timerStyleSelect].forEach(input => {
  input.addEventListener("change", updateSettingFromInputs);
});

document.querySelectorAll("[data-plus], [data-minus]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();

    const inputId = button.dataset.plus || button.dataset.minus;
    const input = document.getElementById(inputId);

    if (!input) return;

    const current = Number(input.value) || 1;

    if (button.dataset.plus) {
      input.value = current + 1;
    } else {
      input.value = Math.max(1, current - 1);
    }

    updateSettingFromInputs();
  });
});

function applyTimerStyle() {
  timerWrap.classList.remove("circle-style", "digital-style");

  if (settings.timerStyle === "digital") {
    timerWrap.classList.add("digital-style");
  } else {
    timerWrap.classList.add("circle-style");
  }
}

/* TIMER */

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);

  if (progressCircle) {
    const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = String(offset);
  }
}

function resetToCurrentMode() {
  pauseTimer();

  totalSeconds = getModeMinutes(currentMode) * 60;
  remainingSeconds = totalSeconds;

  sessionTitle.textContent = modeLabels[currentMode];

  updateTimerDisplay();
}

function startTimer() {
  if (running) return;

  running = true;
  startPauseBtn.textContent = "Ⅱ Pause";

  intervalId = setInterval(() => {
    if (remainingSeconds <= 0) {
      pauseTimer();
      remainingSeconds = 0;
      updateTimerDisplay();
      alert("Session finished. Good job!");
      return;
    }

    remainingSeconds--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  running = false;
  clearInterval(intervalId);
  startPauseBtn.textContent = "▶ Start";
}

function stopTimer() {
  pauseTimer();
  remainingSeconds = 0;
  updateTimerDisplay();
}

startPauseBtn.addEventListener("click", () => {
  if (running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

restartBtn.addEventListener("click", resetToCurrentMode);
stopBtn.addEventListener("click", stopTimer);

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    modeButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentMode = button.dataset.mode;

    resetToCurrentMode();
  });
});

/* TASKS */

function saveTasks() {
  localStorage.setItem("hymfocusTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.textContent = "⌫";
    deleteButton.title = "Delete task";

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteButton);

    taskList.appendChild(li);
  });

  updateTaskProgress();
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text,
    done: false
  });

  taskInput.value = "";

  saveTasks();
  renderTasks();
}

function updateTaskProgress() {
  const total = tasks.length;
  const done = tasks.filter(task => task.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  taskProgressText.textContent = `${done} / ${total} tasks completed`;
  taskProgressBar.style.width = `${percent}%`;
}

addTaskBtn.addEventListener("click", addTask);

quickAddTask.addEventListener("click", () => {
  taskInput.focus();
});

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    addTask();
  }
});

/* NOTES */

notesInput.value = localStorage.getItem("hymfocusNotes") || "";

notesInput.addEventListener("input", () => {
  localStorage.setItem("hymfocusNotes", notesInput.value);

  savedStatus.textContent = "Saving...";

  clearTimeout(notesInput.saveTimeout);

  notesInput.saveTimeout = setTimeout(() => {
    savedStatus.textContent = "Auto-saved";
  }, 500);
});

clearNotes.addEventListener("click", () => {
  notesInput.value = "";
  localStorage.removeItem("hymfocusNotes");

  savedStatus.textContent = "Cleared";

  setTimeout(() => {
    savedStatus.textContent = "Auto-saved";
  }, 900);
});

/* BACKGROUND */

function setBackground(imageData) {
  document.documentElement.style.setProperty("--user-bg", `url("${imageData}")`);
}

bgInput.addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const imageData = reader.result;

    setBackground(imageData);

    try {
      localStorage.setItem("hymfocusBackground", imageData);
    } catch {
      alert("The image is too large to save, but it is applied now. Choose a smaller image to keep it after refresh.");
    }
  };

  reader.readAsDataURL(file);
});

resetBackground.addEventListener("click", () => {
  localStorage.removeItem("hymfocusBackground");
  document.documentElement.style.removeProperty("--user-bg");
});

const savedBackground = localStorage.getItem("hymfocusBackground");

if (savedBackground) {
  setBackground(savedBackground);
}

/* INITIALIZE */

applySettingsToInputs();
resetToCurrentMode();
renderTasks();