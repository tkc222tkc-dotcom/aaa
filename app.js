const fileInput = document.getElementById('fileInput');
const playlistEl = document.getElementById('playlist');
const nowPlayingEl = document.getElementById('nowPlaying');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const seekBar = document.getElementById('seekBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeBar = document.getElementById('volumeBar');
const featureGrid = document.getElementById('featureGrid');

const tracks = [];
let currentIndex = -1;

const formatTime = (sec) => {
  if (!Number.isFinite(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const renderPlaylist = () => {
  playlistEl.innerHTML = '';

  tracks.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track.name;
    li.classList.toggle('active', index === currentIndex);
    li.addEventListener('click', () => loadTrack(index, true));
    playlistEl.appendChild(li);
  });
};

const loadTrack = (index, autoplay = false) => {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];
  audioPlayer.src = track.url;
  nowPlayingEl.textContent = track.name;
  renderPlaylist();

  if (autoplay) {
    audioPlayer.play();
    playPauseBtn.textContent = '⏸ 一時停止';
  }
};

fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []);
  files.forEach((file) => {
    tracks.push({
      name: file.name,
      url: URL.createObjectURL(file),
    });
  });

  if (currentIndex === -1 && tracks.length > 0) {
    loadTrack(0);
  } else {
    renderPlaylist();
  }
});

playPauseBtn.addEventListener('click', () => {
  if (!audioPlayer.src && tracks.length > 0) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.textContent = '⏸ 一時停止';
  } else {
    audioPlayer.pause();
    playPauseBtn.textContent = '▶ 再生';
  }
});

nextBtn.addEventListener('click', () => {
  if (!tracks.length) return;
  const nextIndex = (currentIndex + 1) % tracks.length;
  loadTrack(nextIndex, true);
});

prevBtn.addEventListener('click', () => {
  if (!tracks.length) return;
  const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(prevIndex, true);
});

audioPlayer.addEventListener('timeupdate', () => {
  if (!audioPlayer.duration) return;
  seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  durationEl.textContent = formatTime(audioPlayer.duration);
});

seekBar.addEventListener('input', () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
});

volumeBar.addEventListener('input', () => {
  audioPlayer.volume = Number(volumeBar.value);
});

audioPlayer.addEventListener('ended', () => {
  if (!tracks.length) return;
  const nextIndex = (currentIndex + 1) % tracks.length;
  loadTrack(nextIndex, true);
});

const features = [
  '出欠管理', '遅刻早退メモ', '本日の練習目標', '週間練習計画', '基礎練メニュー', '曲別達成度',
  'テンポ目標', 'チューニング記録', 'セクション練習メモ', 'パート割り当て', '本番セットリスト', 'MC台本メモ',
  '機材チェック', '貸出返却管理', '予算メモ', '購入リスト', '大会カウントダウン', '本番タイムテーブル',
  '練習タイマー', '休憩タイマー', '連絡事項', 'ミーティング議事録', '当番表', '課題ToDo',
  '改善フィードバック', '個人目標', '体調管理メモ', 'モチベーション一言', '緊急連絡先', '振り返り日誌',
];

const getStoreKey = (index) => `music-club-feature-${index}`;

const createFeatureCard = (title, index) => {
  const card = document.createElement('article');
  card.className = 'feature-card';

  const heading = document.createElement('h3');
  heading.textContent = `${index + 1}. ${title}`;

  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = '入力して「保存」を押すと端末に保存されます。';

  const textarea = document.createElement('textarea');
  const savedText = localStorage.getItem(getStoreKey(index));
  textarea.value = savedText || '';

  const row = document.createElement('div');
  row.className = 'row';

  const saveButton = document.createElement('button');
  saveButton.textContent = '保存';
  saveButton.addEventListener('click', () => {
    localStorage.setItem(getStoreKey(index), textarea.value);
    status.textContent = '保存済み';
  });

  const clearButton = document.createElement('button');
  clearButton.textContent = 'クリア';
  clearButton.addEventListener('click', () => {
    textarea.value = '';
    localStorage.removeItem(getStoreKey(index));
    status.textContent = '未保存';
  });

  const status = document.createElement('span');
  status.className = 'kpi';
  status.textContent = savedText ? '保存済み' : '未保存';

  row.append(saveButton, clearButton);
  card.append(heading, hint, textarea, row, status);
  return card;
};

const renderFeatureCards = () => {
  featureGrid.innerHTML = '';
  features.forEach((title, index) => {
    featureGrid.appendChild(createFeatureCard(title, index));
  });
};

renderFeatureCards();
