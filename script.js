let musicOn = localStorage.getItem("royaleMusic") === "on";

const particleLayer = document.querySelector(".particle-layer");
const musicButton = document.querySelector(".music-toggle");
const music = document.querySelector("#bgMusic");
const bowKnot = document.querySelector(".bow-knot");
const giftHint = document.querySelector(".gift-hint");
let pullStartY = 0;
let pullStartX = 0;
let isPulling = false;

function updateMusicButton() {
  if (musicButton) {
    musicButton.textContent = `Música: ${musicOn ? "ON" : "OFF"}`;
  }
}

function startMusic() {
  if (!music) return;

  music.volume = 0.45;
  music.play().catch(() => {
    musicOn = false;
    localStorage.setItem("royaleMusic", "off");
    updateMusicButton();
  });
}

function stopMusic() {
  if (!music) return;
  music.pause();
}

function toggleMusic() {
  musicOn = !musicOn;
  localStorage.setItem("royaleMusic", musicOn ? "on" : "off");
  updateMusicButton();

  if (musicOn) {
    startMusic();
    return;
  }

  stopMusic();
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Explosão central usada na abertura do presente.
function createBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  if (!particleLayer) return;

  const heart = String.fromCodePoint(0x2665);
  const sparkle = String.fromCodePoint(0x2726);
  const smallSparkle = String.fromCodePoint(0x2727);
  const star = String.fromCodePoint(0x2605);
  const shapes = [heart, heart, heart, heart, sparkle, smallSparkle, star];
  const colors = ["#ff5d96", "#ff7ab0", "#ffd84e", "#ffaf1b", "#ffffff", "#63c7ff"];

  for (let i = 0; i < 135; i += 1) {
    const particle = document.createElement("span");
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(90, Math.min(window.innerWidth, 900) * 0.55);
    const size = randomBetween(14, 34);

    particle.className = "particle";
    particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--spin", `${randomBetween(-520, 520)}deg`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--duration", `${randomBetween(1.25, 1.95)}s`);
    particle.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    particleLayer.appendChild(particle);

    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function openGift(eventOrElement) {
  if (document.body.classList.contains("opening")) return;

  const source = eventOrElement?.currentTarget || eventOrElement || bowKnot;
  const rect = source.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  bowKnot?.style.setProperty("--pull-y", "96px");
  if (giftHint) giftHint.textContent = "abrindo...";
  document.body.classList.add("opening");
  document.body.classList.remove("pulling");
  createBurst(originX, originY);

  window.setTimeout(() => {
    window.location.href = "carta.html";
  }, 2000);
}

function setupPullRibbon() {
  if (!bowKnot) return;

  bowKnot.addEventListener("pointerdown", (event) => {
    if (document.body.classList.contains("opening")) return;

    isPulling = true;
    pullStartY = event.clientY;
    pullStartX = event.clientX;
    document.body.classList.add("pulling");
    if (giftHint) giftHint.textContent = "solta agora!";
    bowKnot.setPointerCapture(event.pointerId);
  });

  bowKnot.addEventListener("pointermove", (event) => {
    if (!isPulling || document.body.classList.contains("opening")) return;

    const pullY = Math.max(0, Math.min(96, event.clientY - pullStartY));
    const pullX = Math.abs(event.clientX - pullStartX);
    bowKnot.style.setProperty("--pull-y", `${pullY}px`);

    if (pullY > 72 || pullX > 95) {
      isPulling = false;
      openGift(bowKnot);
    }
  });

  function cancelPull() {
    if (!isPulling || document.body.classList.contains("opening")) return;

    isPulling = false;
    document.body.classList.remove("pulling");
    bowKnot.style.setProperty("--pull-y", "0px");
    if (giftHint) giftHint.textContent = "puxe o laço dourado";
  }

  bowKnot.addEventListener("pointerup", (event) => {
    const pullY = Math.max(0, event.clientY - pullStartY);

    if (isPulling && pullY > 70) {
      isPulling = false;
      openGift(bowKnot);
      return;
    }

    cancelPull();
  });

  bowKnot.addEventListener("pointercancel", cancelPull);
}

// Partículas flutuantes constantes na página da carta.
function startLetterBackground() {
  if (!document.body.classList.contains("letter-page") || !particleLayer) return;

  function spawnFloatingParticle() {
    const particle = document.createElement("span");
    particle.className = "float-particle";
    particle.textContent = Math.random() > 0.28 ? String.fromCodePoint(0x2665) : String.fromCodePoint(0x2726);
    particle.style.left = `${randomBetween(3, 97)}vw`;
    particle.style.setProperty("--size", `${randomBetween(13, 25)}px`);
    particle.style.setProperty("--duration", `${randomBetween(7, 13)}s`);
    particle.style.setProperty("--drift", `${randomBetween(-55, 55)}px`);
    particleLayer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }

  for (let i = 0; i < 18; i += 1) {
    window.setTimeout(spawnFloatingParticle, i * 180);
  }

  window.setInterval(spawnFloatingParticle, 430);
}

function setupLetterButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "back") {
        window.location.href = "index.html";
      }
    });
  });
}

function setupImageFallbacks() {
  document.querySelectorAll(".character-frame img, .couple-frame img").forEach((image) => {
    image.addEventListener("error", () => {
      const label = image.alt.includes("Rainha") ? "Rainha" : image.alt.includes("Princesa") ? "Princesa" : "Rei";
      const fallback = document.createElement("div");
      fallback.className = "image-fallback";
      fallback.textContent = label === "Rainha" || label === "Princesa" ? `${String.fromCodePoint(0x1F451)}${String.fromCodePoint(0x1F3F9)}` : String.fromCodePoint(0x1F451);
      fallback.setAttribute("aria-label", `${label} em placeholder fofo`);
      image.replaceWith(fallback);
    });
  });
}

bowKnot?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openGift(bowKnot);
  }
});
musicButton?.addEventListener("click", toggleMusic);
setupPullRibbon();
setupLetterButtons();
setupImageFallbacks();
startLetterBackground();
updateMusicButton();

// O navegador pode bloquear autoplay; o botão mantém o estado salvo e reativa após interação.
if (musicOn) {
  startMusic();
} else {
  stopMusic();
}
