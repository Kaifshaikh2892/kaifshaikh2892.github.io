/* ARIBAZ — interactions légères, sans dépendance. */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Thème ---------- */
  var STORAGE_KEY = 'aribaz-theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function systemTheme() { return media.matches ? 'dark' : 'light'; }

  function applyTheme(theme) {
    if (theme) {
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    } else {
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    }
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      var current = theme || systemTheme();
      btn.setAttribute('aria-label', current === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
      btn.innerHTML = current === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5 8.6 8.6 0 1 0 20.5 14.2Z"/></svg>';
    }
  }

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  applyTheme(stored);

  media.addEventListener('change', function () { if (!stored) applyTheme(null); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    e.preventDefault();
    var next = (root.getAttribute('data-theme') || systemTheme()) === 'dark' ? 'light' : 'dark';
    stored = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch (err) {}
    applyTheme(next);
  });

  /* ---------- Navigation mobile ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Ombre de la navbar ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Révélation au scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Filtre + recherche ---------- */
  var searchInput = document.querySelector('[data-search]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-post]'));
  var countEl = document.querySelector('[data-count]');
  var emptyEl = document.querySelector('[data-empty]');
  var activeCat = 'Tous';

  function normalize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function applyFilters() {
    var q = normalize(searchInput ? searchInput.value.trim() : '');
    var shown = 0;
    items.forEach(function (el) {
      var cat = el.dataset.cat || '';
      var hay = normalize(el.dataset.search || el.textContent);
      var okCat = activeCat === 'Tous' || cat === activeCat;
      var okQ = !q || hay.indexOf(q) !== -1;
      var ok = okCat && okQ;
      el.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) {
      countEl.textContent = shown === 0 ? 'Aucun article' : shown + (shown > 1 ? ' articles' : ' article');
    }
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeCat = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
  if (items.length) applyFilters();

  /* ---------- Progression de lecture ---------- */
  var progress = document.querySelector('.progress');
  var article = document.querySelector('.article-body');
  if (progress && article) {
    var update = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.4;
      var done = Math.min(Math.max(-rect.top + 80, 0), Math.max(total, 1));
      progress.style.width = (done / Math.max(total, 1)) * 100 + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- Partage ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-share]');
    if (!btn) return;
    e.preventDefault();
    var url = btn.dataset.share || location.href;
    var title = document.title;
    if (navigator.share && btn.dataset.native === '1') {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var old = btn.getAttribute('aria-label');
        btn.setAttribute('aria-label', 'Lien copié !');
        btn.classList.add('is-copied');
        setTimeout(function () {
          btn.setAttribute('aria-label', old || 'Copier le lien');
          btn.classList.remove('is-copied');
        }, 1600);
      }).catch(function () { window.prompt('Copier ce lien :', url); });
    } else {
      window.prompt('Copier ce lien :', url);
    }
  });
})();
