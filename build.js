// build.js
// Bu skript ./records qovluğunu skan edir və tapdığı bütün video fayllarının
// siyahısını records.json faylına yazır. index.html səhifəsi həmin json-u
// oxuyaraq qovluqdakı bütün recordları avtomatik göstərir.
//
// Cloudflare Pages "Build command" olaraq bunu işə salır:
//   node build.js
// (və ya "npm run build", package.json-dakı script eyni şeyi edir)

const fs = require("fs");
const path = require("path");

const RECORDS_DIR = path.join(__dirname, "records");
const OUTPUT_FILE = path.join(__dirname, "records.json");

// Dəstəklənən video uzantıları
const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".mkv",
  ".avi",
  ".m4v",
]);

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex++;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function buildRecordsManifest() {
  if (!fs.existsSync(RECORDS_DIR)) {
    console.warn(`Xəbərdarlıq: "${RECORDS_DIR}" tapılmadı, boş siyahı yazılır.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), records: [] }, null, 2));
    return;
  }

  const files = fs.readdirSync(RECORDS_DIR, { withFileTypes: true });

  const records = files
    .filter((entry) => entry.isFile())
    .filter((entry) => VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const fullPath = path.join(RECORDS_DIR, entry.name);
      const stats = fs.statSync(fullPath);
      return {
        name: entry.name,
        title: path.parse(entry.name).name.replace(/[-_]+/g, " "),
        url: `./records/${encodeURIComponent(entry.name)}`,
        size: stats.size,
        sizeLabel: humanSize(stats.size),
        modified: stats.mtime.toISOString(),
      };
    })
    // ən yeni record ən öndə
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: records.length,
    records,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`records.json yaradıldı: ${records.length} record tapıldı.`);
}

buildRecordsManifest();
