const scenes = Array.from(document.querySelectorAll('.scene'));
const progressBar = document.querySelector('.progress-bar');
const hint = document.querySelector('.hint');
const nextButton = document.querySelector('[data-next]');
const restartButton = document.querySelector('[data-restart]');
const appShell = document.querySelector('.app-shell');

let currentScene = 0;
const lastSceneIndex = scenes.length - 1;
const fakeEndingScene = 7;
const DEFAULT_THEME = 'default';
const THEME_ALIASES = {
  luxe: 'luxe',
  'luxe-romantique': 'luxe',
  roadtrip: 'roadtrip',
  'roadtrip-polaroid': 'roadtrip',
  cine: 'cine',
  'cine-premium': 'cine',
  editorial: 'editorial',
  sunset: 'sunset',
  minimal: 'minimal',
  default: 'default',
  mix: 'mix',
  mix1: 'mix1',
  mix2: 'mix2',
  mix3: 'mix3',
};

const AVAILABLE_THEMES = new Set(Object.values(THEME_ALIASES));

const swipeState = {
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  tracking: false,
  lockedAxis: null,
};

const SWIPE_THRESHOLD = 50;
const AXIS_LOCK_THRESHOLD = 12;

function normalizeTheme(themeName) {
  return THEME_ALIASES[themeName] || DEFAULT_THEME;
}

function applyTheme(themeName) {
  const safeTheme = normalizeTheme(themeName);
  document.body.classList.remove(...Array.from(AVAILABLE_THEMES, (name) => `theme-${name}`));
  document.body.classList.add(`theme-${safeTheme}`);
  document.body.dataset.theme = safeTheme;
}

function getThemeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('theme') || DEFAULT_THEME;
}

function renderScene(index, pushState = true) {
  currentScene = Math.max(0, Math.min(index, lastSceneIndex));

  scenes.forEach((scene, i) => {
    scene.classList.toggle('is-active', i === currentScene);
  });

  const cappedScene = Math.min(currentScene, fakeEndingScene);
  const progress = fakeEndingScene === 0 ? 100 : (cappedScene / fakeEndingScene) * 100;
  progressBar.style.width = `${progress}%`;

  if (currentScene >= fakeEndingScene) {
    hint.textContent = '❤';
  } else {
    hint.textContent = '';
  }

  if (pushState) {
    const url = new URL(window.location.href);
    url.hash = `scene-${currentScene}`;
    history.pushState({ scene: currentScene }, '', url);
  }
}

function updateScene(index) {
  renderScene(index, true);
}

function goNext() {
  if (currentScene < lastSceneIndex) {
    updateScene(currentScene + 1);
  }
}

function goBack() {
  if (currentScene > 0) {
    history.back();
  }
}

function shouldIgnoreTap(target) {
  return Boolean(target.closest('button'));
}

function resetSwipe() {
  swipeState.startX = 0;
  swipeState.startY = 0;
  swipeState.deltaX = 0;
  swipeState.deltaY = 0;
  swipeState.tracking = false;
  swipeState.lockedAxis = null;
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  swipeState.startX = event.clientX;
  swipeState.startY = event.clientY;
  swipeState.deltaX = 0;
  swipeState.deltaY = 0;
  swipeState.tracking = true;
  swipeState.lockedAxis = null;
}

function onPointerMove(event) {
  if (!swipeState.tracking) return;

  swipeState.deltaX = event.clientX - swipeState.startX;
  swipeState.deltaY = event.clientY - swipeState.startY;

  if (!swipeState.lockedAxis) {
    if (
      Math.abs(swipeState.deltaX) < AXIS_LOCK_THRESHOLD &&
      Math.abs(swipeState.deltaY) < AXIS_LOCK_THRESHOLD
    ) {
      return;
    }

    swipeState.lockedAxis =
      Math.abs(swipeState.deltaX) >= Math.abs(swipeState.deltaY) ? 'x' : 'y';
  }

  if (swipeState.lockedAxis === 'x') {
    event.preventDefault();
  }
}

function onPointerUp() {
  if (!swipeState.tracking) return;

  const { deltaX, deltaY, lockedAxis } = swipeState;
  const isHorizontal = lockedAxis === 'x' && Math.abs(deltaX) > Math.abs(deltaY);

  if (isHorizontal && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
    if (deltaX < 0) {
      goNext();
    } else {
      goBack();
    }
  }

  resetSwipe();
}

document.addEventListener('click', (event) => {
  if (shouldIgnoreTap(event.target)) return;
  goNext();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
    if (currentScene === 0 && document.activeElement === nextButton) return;
    goNext();
  }

  if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
    goBack();
  }
});

window.addEventListener('popstate', (event) => {
  const sceneFromState = event.state?.scene;

  if (typeof sceneFromState === 'number') {
    renderScene(sceneFromState, false);
    return;
  }

  const hashMatch = window.location.hash.match(/scene-(\d+)/);
  const hashScene = hashMatch ? Number(hashMatch[1]) : 0;
  renderScene(hashScene, false);
});

if (appShell) {
  appShell.addEventListener('pointerdown', onPointerDown, { passive: true });
  appShell.addEventListener('pointermove', onPointerMove, { passive: false });
  appShell.addEventListener('pointerup', onPointerUp);
  appShell.addEventListener('pointercancel', resetSwipe);
  appShell.addEventListener('pointerleave', onPointerUp);
}

applyTheme(getThemeFromUrl());
nextButton?.addEventListener('click', () => updateScene(1));
restartButton?.addEventListener('click', () => updateScene(0));

history.replaceState({ scene: 0 }, '', `${window.location.search}#scene-0`);
renderScene(0, false);
