const audio = document.querySelector("#audio");
const playButton = document.querySelector("#play-button");
const progress = document.querySelector("#progress");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");

const now = new Date();
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const firstDay = new Date(2026, 0, 1);
const daysSinceFirstDay = Math.floor((startOfToday - firstDay) / 86400000);

const dailyNotes = [
  "Essa me lembrou você.",
  "Um som bonito para um dia tranquilo.",
  "Dá o play e fica mais um pouco.",
  "Hoje combina com essa.",
  "Só queria dividir esta com você.",
  "Para ouvir sem pressa.",
  "Uma pequena pausa no meio do dia.",
  "Achei que você fosse gostar.",
  "Essa tem um pedacinho de nós.",
  "Para deixar o caminho mais leve.",
  "Ouvi e pensei: Franjuda.",
  "Um som para guardar.",
  "Hoje eu trouxe essa para você.",
  "Talvez ela diga o que eu não soube dizer.",
  "Para tocar baixinho e ficar por perto.",
  "Mais uma para a nossa coleção.",
  "Essa merece chegar até você.",
  "Um pouquinho de música para hoje.",
  "Tem dias que pedem uma canção assim.",
  "Espero que ela encontre você bem.",
  "Coloquei essa aqui só porque sim.",
  "Para fazer companhia por alguns minutos.",
  "Essa tem cara de fim de tarde.",
  "Uma música simples, mas especial.",
  "Fica com essa por hoje.",
  "Talvez vire uma das suas favoritas.",
  "Essa chegou na hora certa.",
  "Uma trilha pequena para o seu dia.",
  "Só um lembrete bonito em forma de som.",
  "A de hoje é toda sua.",
  "Nos encontramos de novo no play.",
];

const noteOverrides = {};

const songOverrides = {};

function noteForDay(index, dateKey) {
  if (noteOverrides[dateKey]) return noteOverrides[dateKey];
  return dailyNotes[index % dailyNotes.length];
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

async function loadSong() {
  try {
    const response = await fetch("songs.json");
    if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
    const songs = await response.json();
    if (!Array.isArray(songs) || !songs.length) throw new Error("Catálogo vazio.");
    const index = ((daysSinceFirstDay % songs.length) + songs.length) % songs.length;
    const dateKey = localDateKey(now);
    const overrideTitle = songOverrides[dateKey];
    const song = overrideTitle
      ? songs.find((item) => item.title === overrideTitle) ?? songs[index]
      : songs[index];

    document.querySelector("#song-title").textContent = song.title;
    document.querySelector("#artist").textContent = song.artist;
    audio.src = song.file;
    playButton.disabled = false;
  } catch (error) {
    document.querySelector("#song-title").textContent = "A música está descansando";
    document.querySelector("#artist").textContent = "Tente novamente em instantes";
    playButton.disabled = true;
    console.error(error);
  }
}

playButton.addEventListener("click", async () => {
  const errorMessage = document.querySelector("#player-error");
  errorMessage.hidden = true;
  try {
    if (audio.paused) {
      if (audio.error) audio.load();
      await audio.play();
    } else audio.pause();
  } catch (error) {
    errorMessage.textContent = "Não consegui tocar agora. Tente dar o play de novo.";
    errorMessage.hidden = false;
  }
});

audio.addEventListener("play", () => {
  document.body.classList.add("is-playing");
  playButton.textContent = "❚❚";
  playButton.setAttribute("aria-label", "Pausar música");
});

audio.addEventListener("pause", () => {
  document.body.classList.remove("is-playing");
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Tocar música");
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
  progress.disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
});

audio.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(audio.currentTime);
  progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.style.setProperty("--progress", `${progress.value}%`);
});

audio.addEventListener("ended", () => {
  progress.value = 0;
  progress.style.setProperty("--progress", "0%");
  audio.currentTime = 0;
});

progress.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  progress.style.setProperty("--progress", `${progress.value}%`);
});

audio.addEventListener("error", () => {
  const errorMessage = document.querySelector("#player-error");
  errorMessage.textContent = "A música não carregou. Tente dar o play novamente.";
  errorMessage.hidden = false;
  progress.disabled = true;
});

document.querySelector("#today").textContent = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "long", year: "numeric",
}).format(now).toUpperCase();

loadSong();
