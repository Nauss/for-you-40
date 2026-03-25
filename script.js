const scenes = Array.from(document.querySelectorAll('.scene'));
const progressBar = document.querySelector('.progress-bar');
const hint = document.querySelector('.hint');
const nextButton = document.querySelector('[data-next]');
const restartButton = document.querySelector('[data-restart]');

let currentScene = 0;
const lastSceneIndex = scenes.length - 1;

function updateScene(index) {
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
    hint.textContent = 'Touchez l’écran pour avancer';
  }
}

function goNext() {
  if (currentScene < lastSceneIndex) {
    updateScene(currentScene + 1);
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
});

nextButton?.addEventListener('click', () => updateScene(1));
restartButton?.addEventListener('click', () => updateScene(0));

updateScene(0);
