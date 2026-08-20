const timerDisplay = document.querySelector('#timerDisplay');
const startPauseButton = document.querySelector('#startPauseButton');
const resetButton = document.querySelector('#resetButton');
const switchModeButton = document.querySelector('#switchModeButton');
const focusMinutes = document.querySelector('#focusMinutes');
const breakMinutes = document.querySelector('#breakMinutes');
const modeLabel = document.querySelector('#modeLabel');
const sessionHint = document.querySelector('#sessionHint');
const completedSessions = document.querySelector('#completedSessions');
const progressCircle = document.querySelector('#progressCircle');
const taskForm = document.querySelector('#taskForm');
const taskInput = document.querySelector('#taskInput');
const taskList = document.querySelector('#taskList');
const breathingButton = document.querySelector('#breathingButton');
const breathingCue = document.querySelector('#breathingCue');
const breathingOrb = document.querySelector('.breathing-orb');
const soundToggle = document.querySelector('#soundToggle');
const soundButtons = document.querySelectorAll('.sound');

const ringLength = 2 * Math.PI * 54;
let mode = 'focus';
let secondsLeft = Number(focusMinutes.value) * 60;
let totalSeconds = secondsLeft;
let intervalId = null;
let sessionCount = 0;
let audioContext;
let noiseNode;
let gainNode;
let isSoundOn = false;
let currentSound = 'rain';
let breathingInterval;

progressCircle.style.strokeDasharray = ringLength;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

function updateTimer() {
  timerDisplay.textContent = formatTime(secondsLeft);
  const elapsedRatio = 1 - secondsLeft / totalSeconds;
  progressCircle.style.strokeDashoffset = ringLength * elapsedRatio;
}

function setMode(nextMode) {
  mode = nextMode;
  const minutes = mode === 'focus' ? Number(focusMinutes.value) : Number(breakMinutes.value);
  secondsLeft = minutes * 60;
  totalSeconds = secondsLeft;
  modeLabel.textContent = mode === 'focus' ? '集中' : '休憩';
  sessionHint.textContent = mode === 'focus'
    ? `${minutes}分集中して、${breakMinutes.value}分休憩しましょう。`
    : `${minutes}分だけ目と肩を休めましょう。`;
  switchModeButton.textContent = mode === 'focus' ? '休憩に切替' : '集中に切替';
  document.title = `${formatTime(secondsLeft)} | ${modeLabel.textContent} - Focus Garden`;
  updateTimer();
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  startPauseButton.textContent = 'スタート';
}

function completeSession() {
  stopTimer();
  if (mode === 'focus') {
    sessionCount += 1;
    completedSessions.textContent = sessionCount;
    setMode('break');
  } else {
    setMode('focus');
  }
}

startPauseButton.addEventListener('click', () => {
  if (intervalId) {
    stopTimer();
    return;
  }
  startPauseButton.textContent = '一時停止';
  intervalId = setInterval(() => {
    secondsLeft -= 1;
    document.title = `${formatTime(secondsLeft)} | ${modeLabel.textContent} - Focus Garden`;
    updateTimer();
    if (secondsLeft <= 0) completeSession();
  }, 1000);
});

resetButton.addEventListener('click', () => {
  stopTimer();
  setMode(mode);
});

switchModeButton.addEventListener('click', () => {
  stopTimer();
  setMode(mode === 'focus' ? 'break' : 'focus');
});

[focusMinutes, breakMinutes].forEach((input) => {
  input.addEventListener('change', () => {
    input.value = Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value) || Number(input.min)));
    stopTimer();
    setMode(mode);
  });
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const item = document.createElement('li');
  item.innerHTML = `
    <label>
      <input type="checkbox">
      <span></span>
    </label>
    <button class="delete" type="button" aria-label="タスクを削除">削除</button>
  `;
  item.querySelector('span').textContent = text;
  item.querySelector('.delete').addEventListener('click', () => item.remove());
  taskList.append(item);
  taskInput.value = '';
});

breathingButton.addEventListener('click', () => {
  clearInterval(breathingInterval);
  let expanding = true;
  breathingCue.textContent = '吸って';
  breathingOrb.classList.add('expand');
  breathingInterval = setInterval(() => {
    expanding = !expanding;
    breathingCue.textContent = expanding ? '吸って' : '吐いて';
    breathingOrb.classList.toggle('expand', expanding);
  }, 4000);
});

function createNoiseBuffer(context, soundType) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    const texture = soundType === 'cafe' ? Math.sin(i / 13) * 0.08 : soundType === 'forest' ? Math.sin(i / 29) * 0.14 : 0;
    data[i] = (white * 0.28) + texture;
  }
  return buffer;
}

function startSound() {
  audioContext = audioContext || new AudioContext();
  noiseNode = audioContext.createBufferSource();
  gainNode = audioContext.createGain();
  noiseNode.buffer = createNoiseBuffer(audioContext, currentSound);
  noiseNode.loop = true;
  gainNode.gain.value = 0.08;
  noiseNode.connect(gainNode).connect(audioContext.destination);
  noiseNode.start();
  isSoundOn = true;
  soundToggle.textContent = '環境音 ON';
}

function stopSound() {
  if (noiseNode) noiseNode.stop();
  isSoundOn = false;
  soundToggle.textContent = '環境音 OFF';
}

soundToggle.addEventListener('click', () => {
  if (isSoundOn) stopSound();
  else startSound();
});

soundButtons.forEach((button) => {
  button.addEventListener('click', () => {
    soundButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    currentSound = button.dataset.sound;
    if (isSoundOn) {
      stopSound();
      startSound();
    }
  });
});

setMode('focus');
