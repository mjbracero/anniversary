const anthem = document.getElementById("anthem");
const hint = document.getElementById("playHint");
const audio = document.getElementById("ourSong");

let playing = false;
let audioReady = false;
let melody = null;

audio.addEventListener("canplaythrough", () => {
  audioReady = true;
});

audio.addEventListener("error", () => {
  audioReady = false;
});

function createMelody() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);

  const notes = [
    349.23, 440.0, 523.25, 440.0,
    392.0, 493.88, 587.33, 493.88,
    329.63, 415.3, 523.25, 415.3,
    349.23, 440.0, 698.46, 523.25,
  ];

  let stopped = false;
  let next = ctx.currentTime + 0.05;
  let i = 0;
  let timer = null;

  function schedule() {
    if (stopped) return;
    const now = ctx.currentTime;
    while (next < now + 1.2) {
      const freq = notes[i % notes.length];
      i += 1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      gain.gain.setValueAtTime(0, next);
      gain.gain.linearRampToValueAtTime(0.22, next + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, next + 0.85);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(next);
      osc.stop(next + 0.9);
      next += 0.48;
    }
    timer = setTimeout(schedule, 400);
  }

  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  pad.type = "sine";
  pad.frequency.value = 174.61;
  padGain.gain.value = 0.04;
  pad.connect(padGain);
  padGain.connect(master);
  pad.start();
  schedule();

  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 400);
    },
  };
}

async function play() {
  try {
    await audio.play();
    playing = true;
    anthem.classList.add("playing");
    hint.textContent = "double click to pause.";
    return;
  } catch {
    // If the file cannot play, use a soft built-in melody.
  }
  melody = createMelody();
  playing = true;
  anthem.classList.add("playing");
  hint.textContent = "double click to pause.";
}

function pause() {
  audio.pause();
  if (melody) {
    melody.stop();
    melody = null;
  }
  playing = false;
  anthem.classList.remove("playing");
  hint.textContent = "double click here to play the song.";
}

function toggle() {
  if (playing) pause();
  else play();
}

anthem.addEventListener("dblclick", (event) => {
  event.preventDefault();
  toggle();
});

anthem.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
});

const featuredPhotos = new Set([
  "02.jpeg", "03.jpeg", "04.jpeg", "05.jpeg", "06.jpeg", "07.jpeg", "08.jpeg", "09.jpeg",
  "12.jpeg", "13.jpeg", "15.jpeg", "17.jpeg", "20.jpeg", "22.jpeg",
  "25.jpeg", "28.jpeg", "30.jpeg", "32.jpeg", "35.jpeg", "38.jpeg", "40.jpeg", "42.jpeg",
  "43.jpeg", "45.jpeg", "48.jpeg", "70.jpeg", "100.jpeg",
]);

const albumPhotos = [];
for (let i = 2; i <= 100; i += 1) {
  const name = `${String(i).padStart(2, "0")}.jpeg`;
  if (!featuredPhotos.has(name)) albumPhotos.push(name);
}
albumPhotos.push("71c7ccef-f88e-49e6-9b64-dff8742939a7.jpeg");

const book = document.getElementById("book");
const flipPrev = document.getElementById("flipPrev");
const flipNext = document.getElementById("flipNext");
const bookStage = document.getElementById("bookStage");

function lovePattern() {
  const line = "i love you i love you i love you i love you i love you i love you i love you i love you";
  return Array.from({ length: 16 }, () => `<span>${line}</span>`).join("");
}

function makePhotoPage(src) {
  const page = document.createElement("div");
  page.className = "page";
  page.innerHTML = `<div class="paper-page"><img src="${src}" alt="" decoding="async" draggable="false" /></div>`;
  return page;
}

function makeBackCover() {
  const page = document.createElement("div");
  page.className = "page page-cover page-cover-back";
  page.dataset.density = "hard";
  page.innerHTML = `<div class="cover-face"><div class="cover-love-pattern" aria-hidden="true">${lovePattern()}</div></div>`;
  return page;
}

function warmPhotos() {
  albumPhotos.forEach((name) => {
    const img = new Image();
    img.decoding = "async";
    img.src = `us/${name}`;
  });
}

warmPhotos();

albumPhotos.forEach((name) => {
  book.appendChild(makePhotoPage(`us/${name}`));
});
book.appendChild(makeBackCover());

const pages = book.querySelectorAll(".page");
const pageFlip = new St.PageFlip(book, {
  width: 360,
  height: 520,
  size: "stretch",
  minWidth: 250,
  maxWidth: 420,
  minHeight: 260,
  maxHeight: 620,
  showCover: true,
  drawShadow: true,
  maxShadowOpacity: 0.45,
  flippingTime: 650,
  usePortrait: true,
  autoSize: true,
  showPageCorners: true,
  disableFlipByClick: false,
  useMouseEvents: true,
  mobileScrollSupport: true,
  swipeDistance: 30,
  startZIndex: 2,
});

function updateButtons() {
  const index = pageFlip.getCurrentPageIndex();
  const last = pageFlip.getPageCount() - 1;
  flipPrev.disabled = index <= 0;
  flipNext.disabled = index >= last;
}

pageFlip.on("flip", () => {
  updateButtons();
});

pageFlip.on("init", () => {
  updateButtons();
});
pageFlip.loadFromHTML(pages);

flipPrev.addEventListener("click", (event) => {
  event.stopPropagation();
  pageFlip.flipPrev();
});
flipNext.addEventListener("click", (event) => {
  event.stopPropagation();
  pageFlip.flipNext();
});

document.addEventListener("keydown", (event) => {
  if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (event.key === "ArrowRight") pageFlip.flipNext();
  if (event.key === "ArrowLeft") pageFlip.flipPrev();
});

const loveSection = document.getElementById("love");
if (loveSection) {
  const showLove = () => loveSection.classList.add("in-view");
  if ("IntersectionObserver" in window) {
    const loveWatch = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          showLove();
          loveWatch.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    loveWatch.observe(loveSection);
  } else {
    showLove();
  }
}
