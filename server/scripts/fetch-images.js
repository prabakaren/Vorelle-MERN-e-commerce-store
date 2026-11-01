// Downloads a free-licensed photo for every product from Wikimedia Commons.
//
//   cd server
//   npm run images            (skips photos you already have)
//   npm run images -- --force (downloads everything again)
//
// Photos are saved to client/public/images/<slug>.jpg, matching the names seed.js uses.
// A CREDITS.txt file with the photographer and licence is written next to them.
// Needs Node 18+ and an internet connection. Products it cannot find keep their coloured tile.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../client/public/images');
const force = process.argv.includes('--force');

// slug -> search phrases, most specific first, then a generic fallback.
const PRODUCTS = {
  'apple-airpods-pro-2nd-generation': ['AirPods Pro', 'wireless earbuds'],
  'sony-wh-1000xm5-wireless-headphones': ['Sony WH-1000XM5', 'wireless headphones'],
  'jbl-flip-6-bluetooth-speaker': ['JBL Flip 6', 'portable bluetooth speaker'],
  'logitech-mx-master-3s-wireless-mouse': [
    'Logitech MX Master',
    'wireless computer mouse',
  ],
  'amazon-kindle-paperwhite': ['Kindle Paperwhite', 'e-reader'],
  'amazon-echo-dot-5th-gen': ['Amazon Echo Dot', 'smart speaker'],
  'anker-powercore-20000mah-power-bank': ['Anker power bank', 'power bank'],
  'boat-airdopes-141-earbuds': ['boAt Airdopes', 'true wireless earbuds'],
  'xiaomi-smart-band-8': ['Xiaomi Smart Band', 'fitness tracker'],
  'samsung-galaxy-buds2-pro': ['Samsung Galaxy Buds', 'wireless earbuds'],
  'philips-air-fryer-hd9200': ['Philips air fryer', 'air fryer'],
  'hawkins-classic-pressure-cooker-3-l': ['Hawkins pressure cooker', 'pressure cooker'],
  'bialetti-moka-express-6-cup': ['Bialetti Moka Express', 'moka pot'],
  'lodge-cast-iron-skillet-10-25-inch': ['Lodge cast iron skillet', 'cast iron skillet'],
  'borosil-glass-storage-set-set-of-3': [
    'glass food storage container',
    'glass container lid',
  ],
  'prestige-pic-20-induction-cooktop': ['induction cooktop', 'induction cooker'],
  'milton-thermosteel-flask-1-l': ['vacuum flask', 'thermos'],
  'pigeon-stovekraft-mixer-grinder': ['mixer grinder', 'kitchen blender'],
  'cello-opalware-dinner-set-18-pieces': ['dinner set', 'dinnerware'],
  'wakefit-memory-foam-pillow': ['memory foam pillow', 'pillow'],
  'philips-wiz-smart-led-bulb-9w': ['smart LED bulb', 'LED light bulb'],
  'havells-stealth-air-ceiling-fan': ['ceiling fan', 'ceiling fan white'],
  'bajaj-majesty-room-heater': ['electric room heater', 'fan heater'],
  'godrej-aer-smart-matic-air-freshener': ['air freshener spray', 'air freshener'],
  'solimo-cotton-bedsheet-set-double': ['cotton bedsheet', 'bed linen'],
  'wildcraft-wiki-backpack-35-l': ['backpack', 'hiking backpack'],
  'american-tourister-cabin-trolley-55-cm': ['cabin suitcase', 'hard shell suitcase'],
  'skybags-brat-laptop-backpack': ['laptop backpack', 'school backpack'],
  'nike-brasilia-training-duffel-bag': ['duffel bag', 'gym bag'],
  'stanley-quencher-h2-0-tumbler': ['insulated tumbler', 'travel tumbler'],
  'cello-puro-steel-x-water-bottle-900-ml': [
    'stainless steel water bottle',
    'water bottle',
  ],
  'parker-vector-standard-ball-pen': ['Parker pen', 'ballpoint pen'],
  'pilot-v5-hi-tecpoint-pen-pack-of-5': ['Pilot V5 pen', 'rollerball pen'],
  'moleskine-classic-notebook-large-ruled': ['Moleskine notebook', 'hardcover notebook'],
  'casio-fx-991ex-classwiz-calculator': ['Casio fx-991', 'scientific calculator'],
  'faber-castell-connector-pens-set-of-25': ['felt tip pens', 'colouring markers'],
  'classmate-spiral-notebook-pack-of-6': ['spiral notebook', 'notebook'],
  'staedtler-noris-hb-pencils-pack-of-12': ['graphite pencils', 'pencils'],
  'yonex-astrox-3dg-badminton-racquet': ['Yonex badminton racquet', 'badminton racket'],
  'nivia-storm-football-size-5': ['football ball', 'soccer ball'],
  'decathlon-domyos-yoga-mat-8-mm': ['yoga mat', 'exercise mat'],
  'boldfit-resistance-bands-set-of-5': ['resistance bands', 'exercise band'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HEADERS = {
  'User-Agent': 'VorelleStudentProject/1.0 (class project; image downloader)',
};
const strip = (html = '') =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) await sleep(3000 * (i + 1));
    else throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('Too many retries');
}

// Finds the first JPEG on Commons that matches the phrase.
async function searchImage(phrase) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${phrase} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '800',
  });
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index);
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (info && info.mime === 'image/jpeg' && info.width >= 400 && info.thumburl) {
      const meta = info.extmetadata || {};
      return {
        url: info.thumburl,
        title: p.title,
        artist: strip(meta.Artist?.value) || 'Unknown',
        license: strip(meta.LicenseShortName?.value) || 'See Wikimedia Commons',
        page: info.descriptionurl,
      };
    }
  }
  return null;
}

async function download(url, file) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) {
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    }
    if (res.status === 429 || res.status >= 500) await sleep(3000 * (i + 1));
    else throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('Download failed');
}

async function main() {
  if (fs.existsSync(outDir) && !fs.statSync(outDir).isDirectory()) {
    console.error(
      `"${outDir}" is a FILE. Delete it and create a folder named "images" instead.`,
    );
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const credits = [];
  const missing = [];
  let done = 0;

  for (const [slug, phrases] of Object.entries(PRODUCTS)) {
    const file = path.join(outDir, `${slug}.jpg`);
    done += 1;
    if (fs.existsSync(file) && !force) {
      console.log(`[${done}/42] ${slug}: already there, skipped`);
      continue;
    }
    let found = null;
    for (const phrase of phrases) {
      try {
        found = await searchImage(phrase);
      } catch (err) {
        console.log(`   search "${phrase}" failed: ${err.message}`);
      }
      await sleep(700);
      if (found) break;
    }
    if (!found) {
      console.log(`[${done}/42] ${slug}: no photo found`);
      missing.push(slug);
      continue;
    }
    try {
      await download(found.url, file);
      credits.push(
        `${slug}.jpg\n  ${found.title}\n  By: ${found.artist}\n  Licence: ${found.license}\n  Source: ${found.page}\n`,
      );
      console.log(`[${done}/42] ${slug}: saved`);
    } catch (err) {
      console.log(`[${done}/42] ${slug}: download failed (${err.message})`);
      missing.push(slug);
    }
    await sleep(700);
  }

  if (credits.length) {
    const creditsFile = path.join(outDir, 'CREDITS.txt');
    const old = fs.existsSync(creditsFile)
      ? fs.readFileSync(creditsFile, 'utf8') + '\n'
      : '';
    fs.writeFileSync(
      creditsFile,
      `${old}Photos from Wikimedia Commons (free licences):\n\n${credits.join('\n')}`,
    );
  }
  console.log(`\nFinished. Saved ${credits.length} new photo(s) in ${outDir}`);
  if (missing.length) {
    console.log(
      'No photo for these (they keep a coloured tile; add them by hand or in Admin):',
    );
    missing.forEach((m) => console.log(`  - ${m}.jpg`));
  }
}

main().catch((err) => {
  console.error('Something went wrong:', err.message);
  process.exit(1);
});