const scenes = Array.from(document.querySelectorAll('.scene'));
const progressBar = document.querySelector('.progress-bar');
const hint = document.querySelector('.hint');
const nextButton = document.querySelector('[data-next]');
const restartButton = document.querySelector('[data-restart]');

let currentScene = 0;
const lastSceneIndex = scenes.length - 1;

function renderScene(index, pushState = true) {
  currentScene = Math.max(0, Math.min(index, lastSceneIndex));

  scenes.forEach((scene, i) => {
    scene.classList.toggle('is-active', i === currentScene);
  });

  const progress = ((currentScene + 1) / scenes.length) * 100;
  progressBar.style.width = `${progress}%`;

  if (currentScene === 0) {
    hint.textContent = '';
  } else if (currentScene === lastSceneIndex) {
    hint.textContent = '❤';
  } else {
    hint.textContent = 'Touche l’écran pour avancer';
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

nextButton?.addEventListener('click', () => updateScene(1));
restartButton?.addEventListener('click', () => updateScene(0));

history.replaceState({ scene: 0 }, '', '#scene-0');
renderScene(0, false);
