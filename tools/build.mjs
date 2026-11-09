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
    ['/articles/', 'Actus', 'articles'],
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
          <a href="/articles/">Toutes les actus</a>
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

function card(post, { reveal = true, delay = 0 } = {}) {
  return `<a class="post-card${reveal ? ' reveal' : ''}" href="/articles/${post.slug}.html" data-post data-cat="${esc(post.category)}" data-search="${esc([post.title, post.excerpt, post.tags.join(' '), post.category].join(' '))}" style="transition-delay:${delay}ms">
  <div class="card-art ${post.cat.art}">${icon(post.icon)}</div>
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

function homePage() {
  const title = `${SITE.name} — ${SITE.tagline}`;
  const desc = SITE.description;
  const body = `${nav('home')}
<main id="contenu">
  <section class="hero">
    <div class="wrap">
      <span class="eyebrow"><span class="dot"></span>Nouvelle actu · ${fmtDate(posts[0].date)}</span>
      <h1 class="display">La tech qui rend service, <span class="gradient-text">vraiment.</span></h1>
      <p class="lede">Des outils gratuits, des réglages précis et des astuces testées pour un numérique plus simple, plus sûr et plus propre. Pas de hype : juste ce qui marche.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#dernieres">Lire les dernières actus ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} La chaîne WhatsApp</a>
      </div>
      <div class="hero-meta">
        <span>${icon('layers')} ${posts.length} actus publiées</span>
        <span>${icon('clock')} 2 à 4 par mois</span>
        <span>${icon('check')} Gratuit, open source, sans pub</span>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:16px">
    <div class="wrap">
      <div class="section-head">
        <div><h2>À la une</h2><p>Le dossier du moment, à lire en premier.</p></div>
        <a class="link-arrow" href="/articles/">Tout voir ${icon('arrow')}</a>
      </div>
      <a class="featured reveal" href="/articles/${featured.slug}.html">
        <div class="card-art ${featured.cat.art}">${icon(featured.icon)}</div>
        <div class="featured-body">
          <div class="card-meta"><span class="pill" data-cat="${esc(featured.category)}">${esc(featured.category)}</span><span>${fmtDate(featured.date)}</span><span>${featured.readTime} min</span></div>
          <h3>${esc(featured.title)}</h3>
          <p>${esc(featured.excerpt)}</p>
          <span class="link-arrow">Lire l'article ${icon('arrow')}</span>
        </div>
      </a>
    </div>
  </section>

  <section class="section" id="dernieres" style="padding-top:0">
    <div class="wrap">
      <div class="section-head">
        <div><h2>Les dernières actus</h2><p>Un problème du quotidien, une solution concrète.</p></div>
        <a class="link-arrow" href="/articles/">Toutes les actus ${icon('arrow')}</a>
      </div>
      <div class="card-grid">
        ${others.map((p, i) => card(p, { delay: i * 40 })).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section section-soft">
    <div class="wrap">
      <div class="section-head">
        <div><h2>Parcourir par thème</h2><p>Cinq angles, une même idée : moins de friction, plus de maîtrise.</p></div>
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
  const title = `Toutes les actus — ${SITE.name}`;
  const desc = `Le journal complet : ${posts.length} fiches pratiques sur la productivité, la sécurité, le filtrage et les alternatives libres.`;
  const chips = ['Tous', ...CATEGORIES.map((c) => c.name)]
    .map((c, i) => {
      const slug = c === 'Tous' ? 'tous' : CATEGORIES.find((x) => x.name === c).slug;
      return `<button class="chip" type="button" data-filter="${esc(c)}" data-slug="${slug}" aria-pressed="${i === 0}">${esc(c)}</button>`;
    })
    .join('');
  return head({ title, description: desc, url: '/articles/' }) + `${nav('articles')}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow"><span class="dot"></span>Le journal</span>
      <h1 class="display" style="font-size:clamp(38px,6vw,64px);max-width:16ch;margin-inline:0">Toutes les actus,<br><span class="gradient-text">classées, filtrables.</span></h1>
      <p class="lede" style="margin-inline:0">${posts.length} fiches pratiques, écrites pour être lues en trois minutes et appliquées tout de suite.</p>
    </div>
  </section>

  <section class="section" style="padding-top:20px">
    <div class="wrap">
      <div class="toolbar">
        <div class="search">
          ${icon('search')}
          <input type="search" data-search placeholder="Rechercher un outil, un thème…" aria-label="Rechercher un article" autocomplete="off">
        </div>
        <div class="chips" role="group" aria-label="Filtrer par thème">${chips}</div>
        <span class="result-count" data-count>${posts.length} articles</span>
      </div>
      <div class="card-grid">
        ${posts.map((p) => card(p, { reveal: false })).join('\n        ')}
      </div>
      <div class="empty-state" data-empty hidden>Aucun article ne correspond à cette recherche. Essaie un autre mot-clé.</div>
    </div>
  </section>

  ${ctaBand()}
</main>
${footer()}
<script src="/assets/js/app.js" defer></script>
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
        <div class="article-art ${post.cat.art}">${icon(post.icon)}</div>
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
        <a class="link-arrow" href="/articles/">Toutes les actus ${icon('arrow')}</a>
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

function aboutPage() {
  const title = `À propos — ${SITE.name}`;
  const desc = "ARIBAZ, c'est un guide de survie numérique : des outils gratuits, des réglages utiles et des astuces testées, publiés deux à quatre fois par mois.";
  const body = `${nav('apropos')}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow"><span class="dot"></span>À propos</span>
      <h1 class="display" style="max-width:20ch">Un guide de survie numérique, sans blabla.</h1>
      <p class="lede" style="margin-inline:0">${SITE.name} rassemble les outils et les réglages qui rendent un ordinateur, un téléphone et une connexion internet plus simples, plus sûrs et plus agréables à utiliser.</p>
    </div>
  </section>

  <section class="section" style="padding-top:10px">
    <div class="wrap wrap-narrow">
      <div class="prose">
        <p class="lead">Tout part d'une chaîne WhatsApp : des astuces courtes, concrètes, testées, partagées avec quelques centaines de personnes. Ce site est l'endroit où tout reste rangé, cherchable et lisible — sans faire défiler deux ans de messages.</p>

        <h2>Ce que tu trouveras ici</h2>
        <p><strong>De la tech pratique.</strong> Des raccourcis, des logiciels gratuits, des alternatives open source, des réglages qu'on oublie de mentionner dans les notices.</p>
        <p><strong>De l'hygiène numérique.</strong> Bloqueurs de publicité, gestionnaires de mots de passe, vérification de fuites de données : ce qui protège vraiment, sans discours anxiogène.</p>
        <p><strong>Du filtrage utile.</strong> DNS familiaux, contrôle parental, filtres d'images : pour un internet plus propre à la maison, à l'école ou au bureau.</p>

        <h2>La règle éditoriale</h2>
        <p>Un article = un problème réel + une solution applicable en moins de cinq minutes + le piège à éviter. Pas de comparatif interminable, pas de « top 10 » gonflé à l'IA, pas de lien sponsorisé déguisé.</p>
        <p>Chaque fiche se termine par un <strong>Pro-Tip</strong> : le détail technique, la limite de l'outil ou la correction qui évite de se tromper. C'est la partie qui fait la différence entre un article recopié et une recommandation vécue.</p>

        <h2>Le rythme</h2>
        <p>Deux à quatre publications par mois, sans calendrier fixe. Les actus partent d'abord sur la chaîne WhatsApp, puis sont archivées ici, enrichies et corrigées.</p>
        <p>Le site est statique, sans cookies, sans analytics, sans publicité. Il est hébergé sur GitHub Pages et son code est public.</p>
      </div>

      <div class="value-grid">
        <div class="value reveal"><div class="ico">${icon('check')}</div><h3>Testé, pas recopié</h3><p>Chaque outil est installé, chaque réglage vérifié avant publication.</p></div>
        <div class="value reveal"><div class="ico">${icon('lock')}</div><h3>Sans cookies</h3><p>Aucun traqueur, aucune bannière de consentement, aucun compte à créer.</p></div>
        <div class="value reveal"><div class="ico">${icon('rss')}</div><h3>Ouvert</h3><p>Flux RSS complet, code source public, articles réutilisables.</p></div>
      </div>

      <div class="hero-actions" style="justify-content:flex-start;margin-top:36px">
        <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} Rejoindre la chaîne</a>
        <a class="btn btn-ghost" href="/articles/">Parcourir les actus ${icon('arrow')}</a>
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
    { loc: '/articles/', pri: '0.9', mod: posts[0].date },
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
