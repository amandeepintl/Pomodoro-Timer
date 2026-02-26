const TIMER_MODES = {
    WORK: { id: 'work' },
    SHORT_BREAK: { id: 'short-break' },
    LONG_BREAK: { id: 'long-break' }
};

let currentMode = TIMER_MODES.WORK;
let timeLeft = 0;
let timerId = null;
let isRunning = false;
let sessionsCompleted = 0;
const SESSION_GOAL = 4;

let modeProgress = {
    work: null,
    'short-break': null,
    'long-break': null
};

const hoursDisplay = document.getElementById('hours');
const hoursColon = document.getElementById('hours-colon');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const progressCircle = document.getElementById('progress-ring-circle');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workBtn = document.getElementById('work-btn');
const breakBtn = document.getElementById('break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const alertSound = document.getElementById('alert-sound');

const workH = document.getElementById('work-h');
const workM = document.getElementById('work-m');
const breakH = document.getElementById('break-h');
const breakM = document.getElementById('break-m');
const longH = document.getElementById('long-h');
const longM = document.getElementById('long-m');

const autoSwitchToggle = document.getElementById('auto-switch');
const sessionText = document.getElementById('session-text');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const CIRCUMFERENCE = 2 * Math.PI * 110;

const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
clickSound.volume = 0.5;

function playClick() {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => { });
}

function getSecondsFromInputs(hInput, mInput) {
    return (parseInt(hInput.value) || 0) * 3600 + (parseInt(mInput.value) || 0) * 60;
}

function updateDisplay() {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    const timerContainer = document.querySelector('.timer-display');
    if (h > 0) {
        timerContainer.classList.add('has-hours');
        hoursDisplay.style.display = 'inline';
        hoursColon.style.display = 'inline';
        hoursDisplay.textContent = String(h).padStart(2, '0');
    } else {
        timerContainer.classList.remove('has-hours');
        hoursDisplay.style.display = 'none';
        hoursColon.style.display = 'none';
    }

    minutesDisplay.textContent = String(m).padStart(2, '0');
    secondsDisplay.textContent = String(s).padStart(2, '0');

    let totalDuration;
    if (currentMode.id === 'work') totalDuration = getSecondsFromInputs(workH, workM);
    else if (currentMode.id === 'short-break') totalDuration = getSecondsFromInputs(breakH, breakM);
    else totalDuration = getSecondsFromInputs(longH, longM);

    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);

    sessionText.textContent = `${Math.min(sessionsCompleted + 1, SESSION_GOAL)} / ${SESSION_GOAL} Sessions Completed`;
    const hText = h > 0 ? `${String(h).padStart(2, '0')}:` : '';
    document.title = `${hText}${minutesDisplay.textContent}:${secondsDisplay.textContent} | Pomodoro Timer`;
}

function switchMode(mode, force = false) {
    if (!force && currentMode.id === mode.id) return;

    // Save current progress before switching
    if (currentMode) {
        modeProgress[currentMode.id] = timeLeft;
    }

    stopTimer();
    currentMode = mode;

    const timerCard = document.querySelector('.timer-card');
    timerCard.classList.remove('mode-switching');
    void timerCard.offsetWidth; // Trigger reflow
    timerCard.classList.add('mode-switching');
    setTimeout(() => timerCard.classList.remove('mode-switching'), 500);

    workBtn.classList.remove('active');
    breakBtn.classList.remove('active');
    longBreakBtn.classList.remove('active');
    document.body.classList.remove('break-mode', 'long-break-mode');

    if (mode.id === 'work') {
        workBtn.classList.add('active');
        timeLeft = modeProgress.work !== null ? modeProgress.work : getSecondsFromInputs(workH, workM);
    } else if (mode.id === 'short-break') {
        breakBtn.classList.add('active');
        document.body.classList.add('break-mode');
        timeLeft = modeProgress['short-break'] !== null ? modeProgress['short-break'] : getSecondsFromInputs(breakH, breakM);
    } else {
        longBreakBtn.classList.add('active');
        document.body.classList.add('long-break-mode');
        timeLeft = modeProgress['long-break'] !== null ? modeProgress['long-break'] : getSecondsFromInputs(longH, longM);
    }

    updateDisplay();
    saveState();
}

function startTimer() {
    if (isRunning || timeLeft <= 0) return;
    playClick();
    isRunning = true;
    startPauseBtn.textContent = 'Pause';
    startPauseBtn.classList.add('running');
    [workH, workM, breakH, breakM, longH, longM, autoSwitchToggle].forEach(el => el.disabled = true);

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else handleTimerComplete();
    }, 1000);
}

function stopTimer() {
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.remove('running');
    clearInterval(timerId);
    timerId = null;
    [workH, workM, breakH, breakM, longH, longM, autoSwitchToggle].forEach(el => el.disabled = false);
}

function resetTimer() {
    playClick();
    stopTimer();
    modeProgress[currentMode.id] = null; // Clear saved progress on reset
    if (currentMode.id === 'work') timeLeft = getSecondsFromInputs(workH, workM);
    else if (currentMode.id === 'short-break') timeLeft = getSecondsFromInputs(breakH, breakM);
    else timeLeft = getSecondsFromInputs(longH, longM);
    updateDisplay();
    saveState();
}

function handleTimerComplete() {
    stopTimer();
    alertSound.play().catch(() => { });
    progressCircle.style.strokeDashoffset = '0';
    modeProgress[currentMode.id] = null; // Reset progress for the completed mode

    if (currentMode.id === 'work') sessionsCompleted++;
    else if (currentMode.id === 'long-break') sessionsCompleted = 0;

    if (autoSwitchToggle.checked) {
        setTimeout(() => {
            let nextMode = currentMode.id === 'work' ? (sessionsCompleted >= SESSION_GOAL ? TIMER_MODES.LONG_BREAK : TIMER_MODES.SHORT_BREAK) : TIMER_MODES.WORK;
            switchMode(nextMode, true);
            startTimer();
        }, 1500);
    } else saveState();
}

function saveState() {
    localStorage.setItem('pomodoroSettingsV3', JSON.stringify({
        workH: workH.value, workM: workM.value,
        breakH: breakH.value, breakM: breakM.value,
        longH: longH.value, longM: longM.value,
        autoSwitch: autoSwitchToggle.checked,
        sessionsCompleted,
        modeProgress
    }));
}

function loadState() {
    const saved = localStorage.getItem('pomodoroSettingsV3');
    if (saved) {
        const s = JSON.parse(saved);
        workH.value = s.workH || 0;
        workM.value = s.workM || 25;
        breakH.value = s.breakH || 0;
        breakM.value = s.breakM || 5;
        longH.value = s.longH || 0;
        longM.value = s.longM || 15;
        autoSwitchToggle.checked = s.autoSwitch;
        sessionsCompleted = s.sessionsCompleted || 0;
        modeProgress = s.modeProgress || { work: null, 'short-break': null, 'long-break': null };
    }
    switchMode(TIMER_MODES.WORK, true);
}

startPauseBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
});

resetBtn.addEventListener('click', resetTimer);

workBtn.addEventListener('click', () => switchMode(TIMER_MODES.WORK));
breakBtn.addEventListener('click', () => switchMode(TIMER_MODES.SHORT_BREAK));
longBreakBtn.addEventListener('click', () => switchMode(TIMER_MODES.LONG_BREAK));

[workH, workM, breakH, breakM, longH, longM].forEach(input => {
    input.addEventListener('change', () => {
        const modeId = input.id.split('-')[0];
        const isCurrentMode = (modeId === 'work' && currentMode.id === 'work') ||
            (modeId === 'break' && currentMode.id === 'short-break') ||
            (modeId === 'long' && currentMode.id === 'long-break');
        if (isCurrentMode && !isRunning) {
            if (modeId === 'work') timeLeft = getSecondsFromInputs(workH, workM);
            else if (modeId === 'break') timeLeft = getSecondsFromInputs(breakH, breakM);
            else timeLeft = getSecondsFromInputs(longH, longM);
            updateDisplay();
        }
        saveState();
    });
});

document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return;
        const targetId = btn.dataset.target;
        const step = parseInt(btn.dataset.step);
        const input = document.getElementById(targetId);
        let val = (parseInt(input.value) || 0) + step;

        if (targetId.endsWith('-h')) {
            if (val < 0) val = 23;
            else if (val > 23) val = 0;
        } else {
            if (val < 0) val = 59;
            else if (val > 59) val = 0;
        }

        input.value = val;
        input.dispatchEvent(new Event('change'));
        playClick();
    });
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    setTimeout(() => settingsModal.classList.add('active'), 10);
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    setTimeout(() => settingsModal.style.display = 'none', 300);
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
        setTimeout(() => settingsModal.style.display = 'none', 300);
    }
});

loadState();
