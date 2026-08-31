// app.js
// records.json faylını oxuyur (build.js tərəfindən yaradılır) və
// tapılan hər video üçün kart yaradır.

async function loadRecords() {
  const grid = document.getElementById("records-grid");
  const countEl = document.getElementById("count-number");
  const generatedAtEl = document.getElementById("generated-at");

  let manifest;
  try {
    const res = await fetch("./records.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`records.json tapılmadı (${res.status})`);
    manifest = await res.json();
  } catch (err) {
    grid.innerHTML = emptyState(
      "records.json oxunmadı",
      "Build əmri (node build.js) işə düşməyib, ya da hələ heç run olunmayıb."
    );
    return;
  }

  const records = manifest.records || [];

  if (generatedAtEl && manifest.generatedAt) {
    const d = new Date(manifest.generatedAt);
    generatedAtEl.textContent = `son build: ${d.toLocaleString("az-AZ")}`;
  }

  animateCount(countEl, records.length);

  if (records.length === 0) {
    grid.innerHTML = emptyState(
      "Hələ heç bir record yoxdur",
      "./records qovluğuna video faylı əlavə edib push et — build zamanı avtomatik görünəcək."
    );
    return;
  }

  grid.innerHTML = "";
  records.forEach((record) => grid.appendChild(buildCard(record)));
}

function emptyState(title, detail) {
  return `
    <div class="empty">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(detail)}</p>
    </div>
  `;
}

function animateCount(el, target) {
  if (!el) return;
  if (target === 0) {
    el.textContent = "0";
    return;
  }
  const duration = 500;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function buildCard(record) {
  const card = document.createElement("article");
  card.className = "card";

  const media = document.createElement("div");
  media.className = "card-media";

  const video = document.createElement("video");
  video.src = record.url;
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;

  const durationTag = document.createElement("span");
  durationTag.className = "duration-tag";
  durationTag.textContent = "--:--";

  video.addEventListener("loadedmetadata", () => {
    if (isFinite(video.duration)) {
      durationTag.textContent = formatDuration(video.duration);
      // örtük şəkil (thumbnail) üçün ilk kadrdan bir az irəli gedirik
      video.currentTime = Math.min(1, video.duration / 2);
    }
  });

  const playHint = document.createElement("div");
  playHint.className = "play-hint";
  playHint.innerHTML = playIconSvg();

  media.addEventListener("click", () => {
    if (media.classList.contains("is-playing")) return;
    media.classList.add("is-playing");
    video.controls = true;
    video.muted = false;
    video.play().catch(() => {});
  });

  media.appendChild(video);
  media.appendChild(playHint);
  media.appendChild(durationTag);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("p");
  title.className = "card-title";
  title.textContent = record.title || record.name;

  const meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = `${record.sizeLabel} · ${formatDate(record.modified)}`;

  body.appendChild(title);
  body.appendChild(meta);

  card.appendChild(media);
  card.appendChild(body);

  return card;
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "short", year: "numeric" });
}

function playIconSvg() {
  return `
    <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="22" cy="22" r="21" fill="rgba(12,15,20,0.55)" stroke="#ece8de" stroke-width="1.2" />
      <path d="M18 14.5L30 22L18 29.5V14.5Z" fill="#ece8de" />
    </svg>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadRecords();
