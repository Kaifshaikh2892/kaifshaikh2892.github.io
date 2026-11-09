#!/usr/bin/env node
/**
 * ARIBAZ — générateur statique minimaliste.
 * Aucune dépendance : Node 18+ suffit.
 *
 *   node tools/build.mjs
 *
 * Source  : content/posts/*.md  (frontmatter + markdown)
 * Sortie  : index.html, articles/*.html, feed.xml, sitemap.xml, robots.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const LOGO_MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'img', 'logos', 'manifest.json'), 'utf8'));

const SITE = {
  name: 'ARIBAZ',
  author: 'ARIBAZ',
  url: 'https://arielbaz.github.io',
  tagline: 'La tech utile, propre et sans blabla.',
  description:
    "Des astuces concrètes pour un numérique plus simple, plus sûr et plus propre : outils gratuits, vie privée, filtrage familial et productivité.",
  whatsapp: 'https://whatsapp.com/channel/0029VavhmewLtOjKNl2a3f1S',
  github: 'https://github.com/arielbaz',
  email: '',
};

const CATEGORIES = [
  { name: 'Productivité', slug: 'productivite', art: 'art-produ', blurb: 'Raccourcis, outils de bureau, bureautique : gagner du temps chaque jour.' },
  { name: 'Sécurité', slug: 'securite', art: 'art-secu', blurb: 'Mots de passe, fuites de données, navigateurs : reprendre la main sur sa vie privée.' },
  { name: 'Filtrage', slug: 'filtrage', art: 'art-filtre', blurb: 'DNS, contrôle parental, filtres d\u2019images : un internet plus sain à la maison.' },
  { name: 'Alternatives', slug: 'alternatives', art: 'art-alter', blurb: 'Remplacer les services par défaut par des outils libres, gratuits et respectueux.' },
  { name: 'Mobile', slug: 'mobile', art: 'art-mobile', blurb: 'iPhone, Android, eSIM, appels Wi-Fi : les réglages qui changent le quotidien.' },
];

/* -------------------------------------------------------------------------- */
/* Icônes SVG                                                                 */
/* -------------------------------------------------------------------------- */
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  shield: `<path d="M12 3 4.5 6v6c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6L12 3Z" ${STROKE}/><path d="m9 12 2.2 2.2L15.5 10" ${STROKE}/>`,
  globe: `<circle cx="12" cy="12" r="8.5" ${STROKE}/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" ${STROKE}/>`,
  lock: `<rect x="4.8" y="10.5" width="14.4" height="10" rx="2.6" ${STROKE}/><path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" ${STROKE}/><circle cx="12" cy="15.5" r="1.3" ${STROKE}/>`,
  folder: `<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h3.4l1.8 2.2h7.8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" ${STROKE}/><path d="M9 13.5h6M12 10.5v6" ${STROKE}/>`,
  camera: `<rect x="3.2" y="6.8" width="17.6" height="12.4" rx="2.6" ${STROKE}/><circle cx="12" cy="13" r="3.4" ${STROKE}/><path d="M8.5 6.8 9.8 4.6h4.4l1.3 2.2" ${STROKE}/>`,
  text: `<path d="M6 4.5h12M12 4.5v15M8.5 19.5h7" ${STROKE}/>`,
  mic: `<rect x="9" y="3.2" width="6" height="11" rx="3" ${STROKE}/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" ${STROKE}/>`,
  book: `<path d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5H11v16.8H5.7A1.7 1.7 0 0 0 4 22V5.2Z" ${STROKE}/><path d="M20 5.2a1.7 1.7 0 0 0-1.7-1.7H13v16.8h5.3A1.7 1.7 0 0 1 20 22V5.2Z" ${STROKE}/><path d="M7 8h1.6M15.4 8H17" ${STROKE}/>`,
  usb: `<path d="M12 21V5M12 5l-2.6 2.8M12 5l2.6 2.8" ${STROKE}/><rect x="9.4" y="12.5" width="5.2" height="4" rx="1" ${STROKE}/><path d="M6 16.5V13l2-1M18 15.5V12l-2-1" ${STROKE}/>`,
  eye: `<path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12Z" ${STROKE}/><circle cx="12" cy="12" r="3.1" ${STROKE}/>`,
  'eye-off': `<path d="M3 3l18 18" ${STROKE}/><path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6 0 9.4 6 9.4 6a17 17 0 0 1-3 3.6M6.4 7.5A16.6 16.6 0 0 0 2.6 12S6 18 12 18a9.7 9.7 0 0 0 4.1-.9" ${STROKE}/><path d="M9.9 10a3 3 0 0 0 4.2 4.2" ${STROKE}/>`,
  wifi: `<path d="M2.5 9.2a14 14 0 0 1 19 0M5.8 12.6a9.4 9.4 0 0 1 12.4 0M9 16a4.7 4.7 0 0 1 6 0" ${STROKE}/><circle cx="12" cy="19.2" r="1.1" fill="currentColor" stroke="none"/>`,
  phone: `<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.8" ${STROKE}/><path d="M10.6 5.6h2.8" ${STROKE}/><path d="M15.6 12.4c-.5 3-3 5.2-6 5.4" ${STROKE} opacity=".55"/>`,
  image: `<rect x="3.2" y="4.8" width="17.6" height="14.4" rx="2.6" ${STROKE}/><circle cx="8.6" cy="9.8" r="1.6" ${STROKE}/><path d="m4.4 17 4.6-4.4 3.3 3 2.5-2.2 4.2 4" ${STROKE}/>`,
  breach: `<path d="M12 3.2 3.6 6.6v5.6c0 4.6 3.4 7.6 8.4 8.9 5-1.3 8.4-4.3 8.4-8.9V6.6L12 3.2Z" ${STROKE}/><path d="M12 8.6v4.2" ${STROKE}/><circle cx="12" cy="16" r=".9" fill="currentColor" stroke="none"/>`,
  clipboard: `<rect x="5.6" y="4.6" width="12.8" height="16.2" rx="2.4" ${STROKE}/><path d="M9.4 4.6V3.4h5.2v1.2" ${STROKE}/><path d="M9 10h6M9 13.6h6M9 17.2h3.6" ${STROKE}/>`,
  sim: `<path d="M6.4 3.6h7.2l4 4v12.8H6.4V3.6Z" ${STROKE}/><rect x="9.6" y="11" width="4.8" height="5.2" rx="1" ${STROKE}/>`,
  layers: `<path d="m12 3.4 8.4 4.4L12 12.2 3.6 7.8 12 3.4Z" ${STROKE}/><path d="m3.6 12.2 8.4 4.4 8.4-4.4M3.6 16.6l8.4 4.4 8.4-4.4" ${STROKE}/>`,
  search: `<circle cx="11" cy="11" r="6.4" ${STROKE}/><path d="m20 20-4.4-4.4" ${STROKE}/>`,
  arrow: `<path d="M4 12h15M13 5.5 19.5 12 13 18.5" ${STROKE}/>`,
  'arrow-up-right': `<path d="M7 17 17 7M9 7h8v8" ${STROKE}/>`,
  whatsapp: `<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.4A8.4 8.4 0 1 1 20.5 11.6Z" ${STROKE}/><path d="M8.8 8.1c-.3.1-.8.5-.8 1.4 0 2 2.6 5 5.5 5.6 1.3.3 1.9-.1 2.3-.5.3-.4.5-1 .3-1.2l-1.3-.7c-.2-.1-.5 0-.7.2l-.5.6c-.2.2-.4.2-.6.1-.7-.3-2.3-1.6-2.7-2.4-.1-.2 0-.4.2-.5l.6-.5c.2-.2.2-.4.1-.6l-.7-1.4c-.2-.3-.5-.3-.8-.2Z" ${STROKE}/>`,
  rss: `<path d="M5 19a1 1 0 1 0 0-.01" ${STROKE}/><path d="M4.5 11.5A8 8 0 0 1 12.5 19.5M4.5 5a14.5 14.5 0 0 1 14.5 14.5" ${STROKE}/>`,
  github: `<path d="M9.2 20.4v-2.6c-2.7.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 4.9.4.3.7.9.7 1.9v3.1" ${STROKE}/>`,
  link: `<path d="M10 13.8a4.2 4.2 0 0 0 6 0l2.6-2.6a4.2 4.2 0 0 0-6-6l-1.5 1.5" ${STROKE}/><path d="M14 10.2a4.2 4.2 0 0 0-6 0L5.4 12.8a4.2 4.2 0 0 0 6 6l1.5-1.5" ${STROKE}/>`,
  clock: `<circle cx="12" cy="12" r="8.4" ${STROKE}/><path d="M12 7.6V12l3 1.8" ${STROKE}/>`,
  sun: `<circle cx="12" cy="12" r="4.2" ${STROKE}/><path d="M12 2.6v2M12 19.4v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.6 12h2M19.4 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" ${STROKE}/>`,
  plus: `<path d="M12 5v14M5 12h14" ${STROKE}/>`,
  wrench: `<path d="M15.2 4.8a4 4 0 0 0 4 6.9L9.6 21.3a2.3 2.3 0 1 1-3.3-3.3L16 8.4a4 4 0 0 0-0.8-3.6Z" ${STROKE}/>`,
  chip: `<rect x="7" y="7" width="10" height="10" rx="2" ${STROKE}/><path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3" ${STROKE}/>`,
  bike: `<circle cx="6" cy="17" r="3.2" ${STROKE}/><circle cx="18" cy="17" r="3.2" ${STROKE}/><path d="m9 17 3-7h4M12 10l3.5 7M14 7h3" ${STROKE}/>`,
  music: `<path d="M9 18V5l10-2v13" ${STROKE}/><circle cx="6.5" cy="18" r="2.6" ${STROKE}/><circle cx="16.5" cy="16" r="2.6" ${STROKE}/>`,
  code: `<path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.5 5l-3 14" ${STROKE}/>`,
  heart: `<path d="M12 20s-7.5-4.4-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.6 12 20 12 20Z" ${STROKE}/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7" ${STROKE}/>`,
};

function icon(name, cls = '') {
  const body = ICONS[name] || ICONS.layers;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${body}</svg>`;
}

/* -------------------------------------------------------------------------- */
/* Utilitaires                                                                */
/* -------------------------------------------------------------------------- */
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function rfcDate(iso) {
  return new Date(iso + 'T09:00:00Z').toUTCString();
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* -------------------------------------------------------------------------- */
/* Markdown (sous-ensemble)                                                    */
/* -------------------------------------------------------------------------- */
function inline(md) {
  let s = esc(md);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|[^\s)]+)\)/g, (_, t, u) => {
    const ext = /^https?:/.test(u);
    return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return s;
}

function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let firstPara = true;

  const flushList = (ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    const items = [];
    while (i < lines.length) {
      const line = lines[i];
      const m = ordered ? line.match(/^\s*\d+\.\s+(.*)$/) : line.match(/^\s*[-*]\s+(.*)$/);
      if (!m) break;
      items.push(`<li>${inline(m[1])}</li>`);
      i++;
    }
    out.push(`<${tag}>${items.join('')}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Encart / callout
    const tip = line.match(/^:::(\w+)\s*(.*)$/);
    if (tip) {
      const label = tip[2] || 'Le bon réflexe';
      i++;
      const buf = [];
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      const inner = buf.join('\n').split(/\n{2,}/).map((p) => `<p>${inline(p.replace(/\n/g, ' '))}</p>`).join('');
      out.push(`<div class="protip"><div class="label">${icon('check')}${esc(label)}</div>${inner}</div>`);
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) { flushList(false); continue; }
    if (/^\s*\d+\.\s+/.test(line)) { flushList(true); continue; }

    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${markdown(buf.join('\n'))}</blockquote>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|:::|\s*[-*]\s|\s*\d+\.\s|>|---)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    if (buf.length) {
      const cls = firstPara ? ' class="lead"' : '';
      out.push(`<p${cls}>${inline(buf.join(' '))}</p>`);
      firstPara = false;
    }
  }
  return out.join('\n');
}

/* -------------------------------------------------------------------------- */
/* Lecture des articles                                                        */
/* -------------------------------------------------------------------------- */
function parsePost(file) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Frontmatter manquant : ${file}`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    meta[kv[1]] = val;
  }
  const bodyMd = m[2].trim();
  const bodyHtml = markdown(bodyMd);
  const words = stripTags(bodyHtml).split(/\s+/).filter(Boolean).length;
  const cat = CATEGORIES.find((c) => c.name === meta.category) || CATEGORIES[0];
  return {
    ...meta,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    file,
    bodyHtml,
    bodyMd,
    words,
    readTime: Math.max(2, Math.round(words / 210)),
    cat,
  };
}

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map(parsePost)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

if (!posts.length) throw new Error('Aucun article trouvé.');

/* -------------------------------------------------------------------------- */
/* Fragments de page                                                          */
/* -------------------------------------------------------------------------- */
const THEME_BOOT = `<script>(function(){try{var t=localStorage.getItem('aribaz-theme');if(t){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}}catch(e){}})();</script>`;

function head({ title, description, url, image = '/assets/img/og.png', type = 'website', extra = '' }) {
  const full = url.startsWith('http') ? url : SITE.url + url;
  const ogImage = SITE.url + image;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${full}">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${full}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="author" content="${SITE.author}">
<link rel="icon" href="/assets/img/favicon.png" type="image/png" sizes="64x64">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${SITE.name} — Flux RSS" href="/feed.xml">
<link rel="stylesheet" href="/assets/css/style.css">
${THEME_BOOT}
${extra}
</head>`;
}

function nav(active) {
  const links = [
    ['/', 'Actus', 'home'],
    ['/services.html', 'Services', 'services'],
    ['/apropos.html', 'À propos', 'apropos'],
  ];
  return `<a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="nav">
  <div class="nav-inner">
    <a class="brand" href="/" aria-label="${SITE.name} — accueil">
      <img src="/assets/img/logo.png" alt="${SITE.name}" width="86" height="27">
    </a>
    <nav class="nav-links" id="menu" aria-label="Navigation principale">
      ${links.map(([href, label, key]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <a class="nav-cta" href="${SITE.whatsapp}" target="_blank" rel="noopener"><span>WhatsApp</span> ${icon('arrow-up-right', 'ico-inline')}</a>
    </nav>
    <div class="nav-actions">
      <a class="icon-btn" href="/feed.xml" aria-label="Flux RSS" title="Flux RSS">${icon('rss')}</a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Changer de thème">${icon('sun')}</button>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
</header>`;
}

function footer() {
  const cats = CATEGORIES.map((c) => `<a href="/articles/#${c.slug}">${c.name}</a>`).join('');
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="/"><img src="/assets/img/logo.png" alt="${SITE.name}" width="104" height="32"></a>
        <p>${SITE.tagline} Une sélection d'outils, de réglages et d'astuces testés, expliqués simplement, publiés deux à quatre fois par mois.</p>
      </div>
      <div class="footer-cols">
        <div class="footer-col">
          <h4>Explorer</h4>
          <a href="/">Toutes les actus</a>
          <a href="/apropos.html">À propos</a>
          <a href="/feed.xml">Flux RSS</a>
        </div>
        <div class="footer-col">
          <h4>Thèmes</h4>
          ${cats}
        </div>
        <div class="footer-col">
          <h4>Suivre</h4>
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener">Chaîne WhatsApp</a>
          <a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${SITE.name}. Écrit et testé à la main.</span>
      <span><a href="/feed.xml">RSS</a> · <a href="${SITE.github}" target="_blank" rel="noopener">Code source</a></span>
    </div>
  </div>
</footer>`;
}

function artVisual(post) {
  if (!post.logo) return icon(post.icon);
  const full = LOGO_MANIFEST[post.logo] && LOGO_MANIFEST[post.logo].full;
  return `<span class="app-tile${full ? ' full' : ''}"><img src="/assets/img/logos/${post.logo}.png" alt="" loading="lazy" width="256" height="256"></span>`;
}

function card(post, { reveal = true, delay = 0 } = {}) {
  return `<a class="post-card${reveal ? ' reveal' : ''}" href="/articles/${post.slug}.html" data-post data-cat="${esc(post.category)}" data-search="${esc([post.title, post.excerpt, post.tags.join(' '), post.category].join(' '))}" style="transition-delay:${delay}ms">
  <div class="card-art ${post.cat.art}">${artVisual(post)}</div>
  <div class="card-body">
    <div class="card-meta"><span class="pill" data-cat="${esc(post.category)}">${esc(post.category)}</span><span>${fmtDate(post.date)}</span></div>
    <h3>${esc(post.title)}</h3>
    <p>${esc(post.excerpt)}</p>
    <div class="card-foot"><span>${post.readTime} min de lecture</span><span class="go">Lire ${icon('arrow')}</span></div>
  </div>
</a>`;
}

function ctaBand() {
  return `<section class="section-tight"><div class="wrap">
  <div class="cta-band reveal">
    <h2>Les actus arrivent d'abord sur WhatsApp.</h2>
    <p>Deux à quatre publications par mois, sans spam : des outils gratuits, des réglages utiles et des astuces testées. Le site garde tout, la chaîne te prévient.</p>
    <div class="hero-actions" style="margin-bottom:0">
      <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} Rejoindre la chaîne ARIBAZ</a>
      <a class="btn btn-ghost" href="/feed.xml">${icon('rss')} S'abonner par RSS</a>
    </div>
  </div>
</div></section>`;
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */
const latest = posts.slice(0, 6);
const featured = posts.find((p) => p.featured === true || p.featured === 'true') || posts[0];
const others = latest.filter((p) => p !== featured).slice(0, 5);
const others_all = posts.filter((p) => p !== featured);

function homePage() {
  const title = `${SITE.name} — ${SITE.tagline}`;
  const desc = SITE.description;
  const ticker = ['Productivité', 'Sécurité', 'Filtrage', 'Alternatives', 'Mobile', 'Zéro pub', 'Zéro cookie', 'Open source', 'Sans abonnement'];
  const tickerHtml = ticker.map((t) => `<span>${t}</span><span class="sep">✦</span>`).join('');
  const body = `${nav('home')}
<main id="contenu">
  <section class="hero">
    <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
    <div class="wrap">
      <a class="eyebrow" href="/articles/${posts[0].slug}.html"><span class="dot"></span>Nouvelle actu · ${fmtDate(posts[0].date)}<svg viewBox="0 0 24 24" aria-hidden="true" class="eyebrow-arrow"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <h1 class="display">
        <span class="line"><span>La tech qui sert</span></span>
        <span class="line"><span>à <span class="gradient-text">quelque chose.</span></span></span>
      </h1>
      <p class="lede">Des outils gratuits, des réglages précis et les pièges évités. Zéro abonnement, zéro blabla, zéro « leader du marché ».</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#dernieres">Voir ce qui vient de sortir ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} La chaîne WhatsApp</a>
      </div>
      <div class="hero-meta">
        <span>${icon('layers')} <b data-count-to="${posts.length}">0</b>&nbsp;actus publiées</span>
        <span>${icon('clock')} <b>2 à 4</b>&nbsp;par mois</span>
        <span>${icon('check')} <b>0</b>&nbsp;cookie, <b>0</b>&nbsp;pub</span>
      </div>
    </div>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">${tickerHtml}${tickerHtml}</div></div>

  <section class="section" data-featured-section>
    <div class="wrap">
      <div class="section-head">
        <div><h2>Le dossier <span class="accent">du moment</span></h2><p>Si tu ne lis qu'une chose cette semaine, prends celle-là.</p></div>
        <a class="link-arrow" href="#journal">Parcourir ${icon('arrow')}</a>
      </div>
      <a class="featured reveal" href="/articles/${featured.slug}.html">
        <div class="card-art ${featured.cat.art}">${artVisual(featured)}</div>
        <div class="featured-body">
          <div class="card-meta"><span class="pill" data-cat="${esc(featured.category)}">${esc(featured.category)}</span><span>${fmtDate(featured.date)}</span><span>${featured.readTime} min</span></div>
          <h3>${esc(featured.title)}</h3>
          <p>${esc(featured.excerpt)}</p>
          <span class="link-arrow">Lire l'article ${icon('arrow')}</span>
        </div>
      </a>
    </div>
  </section>

  <section class="section" id="journal" style="padding-top:0">
    <div class="wrap">
      <div class="section-head">
        <div><h2>Toutes les <span class="accent">actus</span></h2><p>${posts.length} fiches pratiques. Un problème du quotidien, une réponse en cinq minutes.</p></div>
        <span class="result-count" data-count>${posts.length} articles</span>
      </div>
      <div class="toolbar">
        <div class="search">
          ${icon('search')}
          <input type="search" data-search placeholder="Rechercher un outil, un thème…" aria-label="Rechercher un article" autocomplete="off">
        </div>
        <div class="chips" role="group" aria-label="Filtrer par thème">
          <button class="chip" type="button" data-filter="Tous" data-slug="tous" aria-pressed="true">Tous</button>
          ${CATEGORIES.map((c) => `<button class="chip" type="button" data-filter="${esc(c.name)}" data-slug="${c.slug}" aria-pressed="false">${esc(c.name)}</button>`).join('')}
        </div>
      </div>
      <div class="card-grid">
        ${others_all.map((p, i) => card(p, { delay: i * 30 })).join('\n        ')}
      </div>
      <div class="empty-state" data-empty hidden>Aucun article ne correspond à cette recherche. Essaie un autre mot-clé.</div>
    </div>
  </section>

  <section class="section section-soft">
    <div class="wrap">
      <div class="section-head">
        <div><h2>Cinq tiroirs, <span class="accent">pas un de plus.</span></h2><p>Gagner du temps, fermer la porte, filtrer la maison, quitter les géants, régler ton téléphone.</p></div>
      </div>
      <div class="value-grid">
        ${CATEGORIES.map((c) => {
          const n = posts.filter((p) => p.category === c.name).length;
          return `<a class="value reveal" href="/articles/#${c.slug}" style="text-decoration:none;color:inherit">
            <div class="ico" style="background:var(--bg-soft)">${icon(iconForCat(c.name))}</div>
            <h3>${c.name}</h3>
            <p>${c.blurb}</p>
            <p style="margin-top:12px;font-size:12.5px;color:var(--ink-faint)">${n} article${n > 1 ? 's' : ''}</p>
          </a>`;
        }).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="cta-band reveal" style="background:linear-gradient(120deg,#0a1220,#131b33 55%,#1b1030)">
        <h2>Un truc cassé ? Un site à lancer ?</h2>
        <p>Réparation, micro-soudure, sites web, cartes de mariage, filtrage, DevOps. Le même soin que dans les articles, appliqué à ton matériel.</p>
        <div class="hero-actions" style="margin-bottom:0">
          <a class="btn btn-primary" href="/services.html">Voir les services ${icon('arrow')}</a>
          <a class="btn btn-ghost" href="/services.html#contact">Demander un devis</a>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
</body>
</html>`;
  return head({ title, description: desc, url: '/' }) + body;
}

function iconForCat(name) {
  const map = { Productivité: 'boltless', Sécurité: 'shield', Filtrage: 'eye', Alternatives: 'layers', Mobile: 'phone' };
  const v = map[name];
  return ICONS[v] ? v : (name === 'Productivité' ? 'clipboard' : 'layers');
}

function articlesPage() {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Toutes les actus — ${SITE.name}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${SITE.url}/">
<meta http-equiv="refresh" content="0; url=/">
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; font-family:ui-sans-serif,-apple-system,"SF Pro Text",Helvetica,Arial,sans-serif; background:#fff; color:#1d1d1f; text-align:center; padding:24px; }
  @media (prefers-color-scheme: dark) { body { background:#000; color:#f5f5f7; } }
  img { height:38px; margin:0 auto 28px; }
  p { color:#6e6e73; font-size:15px; }
  a { color:#0071e3; }
</style>
</head>
<body>
  <div>
    <img src="/assets/img/logo.png" alt="${SITE.name}">
    <p>Toutes les actus sont maintenant sur la page d'accueil.</p>
    <p><a href="/">Continuer vers ${SITE.name}</a></p>
  </div>
</body>
</html>`;
}

function articlePage(post, prev, next) {
  const related = posts.filter((p) => p !== post && p.category === post.category).slice(0, 3);
  const fill = posts.filter((p) => p !== post && p.category !== post.category && !related.includes(p)).slice(0, 3 - related.length);
  const rel = [...related, ...fill];
  const title = `${post.title} — ${SITE.name}`;
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: SITE.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `${SITE.url}/articles/${post.slug}.html`,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  })}</script>`;

  return head({ title, description: post.excerpt, url: `/articles/${post.slug}.html`, type: 'article', extra: jsonld }) + `${nav('articles')}
<div class="progress" aria-hidden="true"></div>
<main id="contenu">
  <article>
    <header class="article-hero">
      <div class="wrap wrap-narrow">
        <div class="meta">
          <a class="pill" data-cat="${esc(post.category)}" href="/articles/#${post.cat.slug}">${esc(post.category)}</a>
          <span>${fmtDate(post.date)}</span>
          <span>·</span>
          <span>${post.readTime} min de lecture</span>
        </div>
        <h1>${esc(post.title)}</h1>
        <p class="dek">${esc(post.excerpt)}</p>
      </div>
      <div class="wrap">
        <div class="article-art ${post.cat.art}">${artVisual(post)}</div>
      </div>
    </header>

    <div class="wrap">
      <div class="article-body">
        ${post.bodyHtml}
      </div>

      ${post.source ? `<div class="source-box">
        <div>
          <div class="k">Site officiel</div>
          <div class="v">${esc(post.sourceLabel || post.source.replace(/^https?:\/\//, ''))}</div>
        </div>
        <a class="btn btn-primary" href="${post.source}" target="_blank" rel="noopener">Ouvrir le site ${icon('arrow-up-right')}</a>
      </div>` : ''}

      <div class="article-footer">
        <div class="tags">
          ${post.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}
        </div>
        <div class="share">
          <span class="muted" style="font-size:13px">Partager</span>
          <a class="icon-btn" href="https://wa.me/?text=${encodeURIComponent(post.title + ' ' + SITE.url + '/articles/' + post.slug + '.html')}" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp">${icon('whatsapp')}</a>
          <button class="icon-btn" type="button" data-share="${SITE.url}/articles/${post.slug}.html" aria-label="Copier le lien">${icon('link')}</button>
        </div>
      </div>

      <nav class="post-nav" aria-label="Articles voisins">
        ${next ? `<a href="/articles/${next.slug}.html"><span class="dir">← Plus récent</span><span class="t">${esc(next.title)}</span></a>` : '<span></span>'}
        ${prev ? `<a class="next" href="/articles/${prev.slug}.html"><span class="dir">Plus ancien →</span><span class="t">${esc(prev.title)}</span></a>` : '<span></span>'}
      </nav>
    </div>
  </article>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div><h2>À lire ensuite</h2><p>Dans le même esprit.</p></div>
        <a class="link-arrow" href="/">Toutes les actus ${icon('arrow')}</a>
      </div>
      <div class="card-grid">${rel.map((p) => card(p, { reveal: false })).join('')}</div>
    </div>
  </section>

  ${ctaBand()}
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
</body>
</html>`;
}


/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */
const SERVICES = [
  {
    num: '01', title: 'Réparer', sub: 'Le matériel avant la poubelle.',
    desc: 'Un portable qui chauffe, un disque qui claque, une carte mère que le fabricant a déclarée morte : on regarde avant de remplacer.',
    items: [
      { icon: 'wrench', title: 'Réparation ordinateur & Mac', text: 'Diagnostic complet, SSD, RAM, batterie, écran, nappes. Sauvegarde des données incluse quand c\u2019est possible.', bullets: ['Diagnostic honnête, pas de devis à l\u2019aveugle', 'Récupération de données', 'Nettoyage & pâte thermique'] },
      { icon: 'chip', title: 'Micro-soudure & carte mère', text: 'Quand le devis officiel dit « irréparable », il reste souvent quelque chose à tenter.', bullets: ['Diagnostic au composant', 'Remplacement de connecteurs', 'Réparation d\u2019alimentations'] },
      { icon: 'bike', title: 'Électronique & mobilité électrique', text: 'Vélos électriques, contrôleurs, batteries, affichages : le même métier, avec du couple en plus.', bullets: ['Contrôleurs 48V', 'Double batterie & autonomie', 'Diagnostic de capteurs'] },
    ],
  },
  {
    num: '02', title: 'Construire', sub: 'Du code, du son et du papier qu\u2019on ne jette pas.',
    desc: 'Des sites qui chargent vite, des cartes de mariage qu\u2019on a envie d\u2019ouvrir, du son qui ne grésille pas.',
    items: [
      { icon: 'globe', title: 'Sites web & e-commerce', text: 'Vitrine, boutique, multilingue. Conçu pour être rapide, lisible et modifiable sans moi.', bullets: ['WordPress / WooCommerce', 'Paiement Stripe & facturation', 'Performance & SEO de base'] },
      { icon: 'heart', title: 'Cartes de mariage numériques', text: 'Un lien élégant, avec les infos, le plan et les réponses — plutôt qu\u2019un PDF illisible sur téléphone.', bullets: ['Design sur mesure', 'RSVP en ligne', 'Compte à rebours & plan'] },
      { icon: 'music', title: 'Ingénieur du son', text: 'Sonorisation d\u2019événement, captation, nettoyage et mixage de voix.', bullets: ['Sonorisation événement', 'Enregistrement & montage', 'Restauration audio'] },
      { icon: 'code', title: 'Automatisation & scripts', text: 'Tout ce que tu fais trois fois par semaine peut être fait par une machine.', bullets: ['Bash / zsh / cron', 'Sauvegardes automatiques', 'Synchronisation de fichiers'] },
    ],
  },
  {
    num: '03', title: 'Protéger', sub: 'Un internet propre, et des données chez toi.',
    desc: 'Filtrage, sauvegardes, réseau : ce qui doit tourner sans toi, et sans dépendre d\u2019un géant.',
    items: [
      { icon: 'layers', title: 'DevOps & auto-hébergement', text: 'Proxmox, NAS, Docker, sauvegardes : une infrastructure qui tient debout et se répare toute seule.', bullets: ['Proxmox / OMV / Docker', 'Sauvegardes 3-2-1 vérifiées', 'Monitoring & alertes'] },
      { icon: 'eye', title: 'Filtrage internet & contrôle parental', text: 'DNS, filtres d\u2019images, contrôle parental : un web plus sain, sans transformer la maison en prison.', bullets: ['DNS filtrants', 'Family Link & co.', 'Filtres navigateur'] },
      { icon: 'wifi', title: 'Réseau & Wi-Fi', text: 'Du câble, du 10 GbE, du PoE, et un Wi-Fi qui couvre vraiment la pièce du fond.', bullets: ['Câblage & baie', 'SFP+ / PoE', 'Wi-Fi maillé'] },
      { icon: 'shield', title: 'Conseil & audit', text: 'Avant d\u2019acheter, demande. Ça coûte moins cher que de se tromper.', bullets: ['Choix de matériel', 'Audit sécurité & sauvegardes', 'Détection d\u2019arnaques'] },
    ],
  },
];

function servicesPage() {
  const title = `Services — ${SITE.name}`;
  const desc = "Réparation, micro-soudure, sites web, cartes de mariage, sonorisation, DevOps, filtrage internet. Du travail propre, expliqué sans jargon.";
  const body = `${nav('services')}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow"><span class="dot"></span>Services</span>
      <h1 class="display" style="font-size:clamp(36px,6vw,64px);max-width:18ch">Ce que je sais faire <span class="gradient-text">de mes dix doigts.</span></h1>
      <p class="lede" style="margin-inline:0;max-width:52ch">Réparer plutôt que remplacer, construire plutôt que sous-traiter. Si ton besoin n'est pas dans la liste, écris quand même : c'est souvent là que ça devient intéressant.</p>
      <div class="hero-meta" style="justify-content:flex-start">
        <span>${icon('check')} Jérusalem & à distance</span>
        <span>${icon('clock')} Réponse sous 24 h</span>
        <span>${icon('shield')} Devis gratuit</span>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:26px">
    <div class="wrap">
      ${SERVICES.map((f) => `<div class="family">
        <div class="family-head"><span class="family-num">${f.num}</span><h2>${f.title}</h2></div>
        <p>${f.sub} ${f.desc}</p>
        <div class="svc-grid">
          ${f.items.map((it) => `<article class="svc">
            <div class="ico">${icon(it.icon)}</div>
            <h3>${it.title}</h3>
            <p>${it.text}</p>
            <ul>${it.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
            <div class="svc-foot"><span>Sur devis</span><strong>${icon('arrow')}</strong></div>
          </article>`).join('')}
        </div>
      </div>`).join('\n      ')}
    </div>
  </section>

  <section class="section section-soft">
    <div class="wrap">
      <div class="section-head"><div><h2>Comment ça se passe</h2><p>Quatre étapes, aucune surprise.</p></div></div>
      <div class="steps">
        <div class="step"><h3>Tu racontes</h3><p>Une photo, un symptôme, une idée. Pas besoin de vocabulaire technique.</p></div>
        <div class="step"><h3>Je diagnostique</h3><p>Réponse rapide, devis clair, et la vérité si ce n'est pas réparable.</p></div>
        <div class="step"><h3>On avance</h3><p>Intervention, livraison, mise en ligne. Tu suis l'avancement.</p></div>
        <div class="step"><h3>Je reste là</h3><p>Les questions arrivent après. C'est normal, je réponds.</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap wrap-narrow">
      <div class="section-head"><div><h2>Ce que je ne fais pas</h2><p>Autant le dire tout de suite.</p></div></div>
      <ul class="dont" style="padding:0">
        <li>${icon('check')}<span><b>Réparer à l'aveugle.</b> Pas de « ça sera la carte mère » sans test.</span></li>
        <li>${icon('check')}<span><b>Un devis surprise.</b> Le prix annoncé est le prix payé.</span></li>
        <li>${icon('check')}<span><b>Vendre du vent.</b> Si un antivirus suffit, je le dis.</span></li>
        <li>${icon('check')}<span><b>Te rendre dépendant.</b> Je documente ce que je fais.</span></li>
      </ul>
    </div>
  </section>

  <section class="section" id="contact" style="padding-top:0">
    <div class="wrap">
      <div class="section-head"><div><h2>Parlons de ton projet</h2><p>Décris-moi le problème en deux lignes, je te dis si je peux aider.</p></div></div>
      <div class="contact-grid">
        <div class="contact-card wa">
          <h3>${icon('whatsapp')} La chaîne WhatsApp</h3>
          <p>Les actus, les coulisses, et le moyen le plus rapide de me joindre. Deux à quatre messages par mois.</p>
          <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">Rejoindre la chaîne ${icon('arrow-up-right')}</a>
        </div>
        <div class="contact-card">
          <h3>Demander un devis</h3>
          <p>Réparation, site, carte de mariage, filtrage, réseau. Explique ton besoin, je réponds sous 24 h ouvrées.</p>
          <a class="btn btn-primary" href="mailto:?subject=${encodeURIComponent('Demande de devis — ARIBAZ')}&body=${encodeURIComponent('Bonjour ARIBAZ,\n\nVoici mon besoin :\n\n\n\nMon matériel / contexte :\n\n\n\nMerci !')}">Écrire le message ${icon('arrow')}</a>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
</body>
</html>`;
  return head({ title, description: desc, url: '/services.html' }) + body;
}


function aboutPage() {
  const title = `À propos — ${SITE.name}`;
  const desc = "Ariel, artisan du numérique à Jérusalem : réparation, micro-soudure, Linux, développement, filtrage. Linux, fer à souder et sainte horreur du gaspillage.";
  const body = `${nav('apropos')}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow"><span class="dot"></span>À propos</span>
      <h1 class="display" style="max-width:22ch">Je répare des machines, je code des trucs, et je soude ce que les autres <span class="gradient-text">jettent.</span></h1>
      <p class="lede" style="margin-inline:0">Ariel. Jérusalem, avec un pied en France. Linux, fer à souder, Rust — et une sainte horreur du gaspillage.</p>
    </div>
  </section>

  <section class="section" style="padding-top:12px">
    <div class="wrap">
      <div class="about-grid">
        <div class="prose">
          <p class="lead">Il y a deux façons de vivre avec la technologie : la subir, ou la comprendre. J'ai choisi la deuxième, et ça m'occupe à plein temps.</p>

          <h2>Le parcours en trois lignes</h2>
          <p>Ingénierie système, développement logiciel, artisanat hardware. Un parcours entre la France et Israël, beaucoup d'autodidaxie, et une conviction : celui qui comprend toutes les couches n'a besoin de demander la permission à personne.</p>
          <p>Je ne suis pas un consommateur de technologie. Je suis de ceux qui ouvrent le capot — parfois littéralement.</p>

          <h2>Ce que je fais de mes journées</h2>
          <p><strong>Côté machines.</strong> Diagnostic au composant, micro-soudure, assemblages Mini-ITX compacts, stations de travail qu'on pousse dans leurs retranchements. Réparer une carte mère ou un contrôleur de vélo électrique relève du même métier : comprendre, mesurer, intervenir.</p>
          <p><strong>Côté systèmes.</strong> Linux au quotidien, Proxmox, NAS, 10 GbE, SFP+, PoE. Virtualisation, sauvegardes versionnées, automatisation en bash et zsh. Le genre d'infrastructure qui ne fait pas de bruit et ne tombe pas.</p>
          <p><strong>Côté code.</strong> Du full-stack, du Rust, du Next.js, du WordPress quand c'est le bon outil. GEDER-Core, mon outil de filtrage et de sécurité multiplateforme, est né de cette obsession : reprendre le contrôle de ce qui entre dans la maison.</p>

          <div class="quote-block">« Le meilleur matériel, c'est celui qu'on n'a pas encore jeté. <span>Et le meilleur logiciel, c'est celui qu'on peut lire.</span> »</div>

          <h2>Ma religion technique</h2>
          <p>Open source, auto-hébergement, chiffrement, souveraineté des données. Pas par idéologie : parce que ce sont les seules options qui me laissent propriétaire de mes outils. Un abonnement cloud, c'est une location. Une sauvegarde qu'on ne peut pas restaurer, c'est une décoration.</p>

          <h2>Et en dehors de la technique ?</h2>
          <p>La psychologie humaine, la communication, l'éducation, les mécanismes du commerce. Comprendre comment les gens apprennent et décident m'aide autant à réparer un ordinateur qu'à expliquer une astuce sur WhatsApp — c'est le même problème : rendre le complexe évident.</p>

          <h2>Pourquoi ce site</h2>
          <p>Les actus partent d'abord sur une chaîne WhatsApp, parce que c'est là que les gens sont. Mais un fil de discussion n'est pas une bibliothèque : ce site range tout, corrige les coquilles, et garde les bonnes astuces trouvables deux ans plus tard.</p>
          <p>Deux à quatre publications par mois. Aucun cookie, aucun traqueur, aucune pub. Ça aussi, c'est un choix de conception.</p>
        </div>

        <aside>
          <div class="fact-list">
            <div class="fact"><span class="n">2</span><span class="l">pays, un aller-retour permanent entre la France et Israël</span></div>
            <div class="fact"><span class="n">10</span><span class="l">gigabits par seconde sur le réseau de la maison</span></div>
            <div class="fact"><span class="n">64</span><span class="l">Go de RAM ECC, parce que les erreurs silencieuses existent</span></div>
            <div class="fact"><span class="n">48</span><span class="l">volts, la tension préférée des vélos qu'on bricole</span></div>
            <div class="fact"><span class="n">0</span><span class="l">abonnement cloud propriétaire pour mes données</span></div>
          </div>
          <div style="margin-top:18px">
            <a class="btn btn-primary" href="/services.html" style="width:100%">Voir les services ${icon('arrow')}</a>
          </div>
        </aside>
      </div>

      <div class="value-grid" style="margin-top:56px">
        <div class="value reveal"><div class="ico">${icon('wrench')}</div><h3>Réparer d'abord</h3><p>La meilleure machine est celle qui fonctionne encore. Diagnostic avant remplacement, toujours.</p></div>
        <div class="value reveal"><div class="ico">${icon('code')}</div><h3>Comprendre le système</h3><p>Du code bas niveau à l'architecture réseau : si on ne sait pas comment ça marche, on ne sait pas pourquoi ça casse.</p></div>
        <div class="value reveal"><div class="ico">${icon('shield')}</div><h3>Reprendre le contrôle</h3><p>Open source, auto-hébergé, chiffré. Des outils qui t'appartiennent vraiment.</p></div>
      </div>

      <div class="hero-actions" style="justify-content:flex-start;margin-top:36px">
        <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} Rejoindre la chaîne</a>
        <a class="btn btn-ghost" href="/">Lire les actus ${icon('arrow')}</a>
      </div>
    </div>
  </section>
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
</body>
</html>`;
  return head({ title, description: desc, url: '/apropos.html' }) + body;
}

function notFoundPage() {
  return head({ title: `Page introuvable — ${SITE.name}`, description: 'Cette page n\u2019existe pas (ou plus).', url: '/404.html' }) + `${nav('')}
<main id="contenu">
  <section class="hero" style="text-align:center">
    <div class="wrap">
      <span class="eyebrow"><span class="dot" style="background:var(--orange)"></span>Erreur 404</span>
      <h1 class="display">Cette page a <span class="gradient-text">disparu.</span></h1>
      <p class="lede">Le lien est peut-être périmé. Tout le journal reste accessible depuis la page des actus.</p>
      <div class="hero-actions"><a class="btn btn-primary" href="/articles/">Voir toutes les actus ${icon('arrow')}</a></div>
    </div>
  </section>
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* Flux & SEO                                                                 */
/* -------------------------------------------------------------------------- */
function feed() {
  const items = posts.slice(0, 20).map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}/articles/${p.slug}.html</link>
      <guid isPermaLink="true">${SITE.url}/articles/${p.slug}.html</guid>
      <pubDate>${rfcDate(p.date)}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
      <content:encoded><![CDATA[${p.bodyHtml}]]></content:encoded>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name} — ${SITE.tagline}</title>
    <link>${SITE.url}/</link>
    <description>${esc(SITE.description)}</description>
    <language>fr-FR</language>
    <lastBuildDate>${rfcDate(posts[0].date)}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function sitemap() {
  const urls = [
    { loc: '/', pri: '1.0', mod: posts[0].date },
    { loc: '/services.html', pri: '0.7', mod: posts[0].date },
    { loc: '/apropos.html', pri: '0.5', mod: posts[0].date },
    ...posts.map((p) => ({ loc: `/articles/${p.slug}.html`, pri: '0.8', mod: p.date })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.mod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>`;
}

/* -------------------------------------------------------------------------- */
/* Écriture                                                                   */
/* -------------------------------------------------------------------------- */
function write(rel, content) {
  const dest = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

fs.mkdirSync(path.join(ROOT, 'articles'), { recursive: true });

write('index.html', homePage());
write('articles/index.html', articlesPage());
posts.forEach((p, idx) => {
  const prev = posts[idx + 1] || null; // plus ancien
  const next = posts[idx - 1] || null; // plus récent
  write(`articles/${p.slug}.html`, articlePage(p, prev, next));
});
write('apropos.html', aboutPage());
write('services.html', servicesPage());
write('404.html', notFoundPage());
write('feed.xml', feed());
write('sitemap.xml', sitemap());
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
write('.nojekyll', '');
write('data/posts.json', JSON.stringify(posts.map((p) => ({
  title: p.title, slug: p.slug, date: p.date, category: p.category,
  tags: p.tags, excerpt: p.excerpt, readTime: p.readTime, url: `/articles/${p.slug}.html`,
})), null, 2));

console.log(`✓ ${posts.length} articles générés`);
console.log(`  index.html, articles/ (${posts.length + 1} pages), apropos.html, feed.xml, sitemap.xml`);
console.log(`  dernier : ${posts[0].date} — ${posts[0].title}`);
