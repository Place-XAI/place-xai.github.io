/* =========================================================
   Place XAI — shared chrome (header + footer) for every page.
   Single-row nav with click/hover dropdowns that list the
   separate sub-pages. Owns theme toggle, mobile drawer,
   active-link state and header scroll shadow.
   ========================================================= */
(function () {
  const root = document.documentElement;

  const NAV = [
    { label: 'Insights', children: [
      { label: 'News',      href: 'news.html' },
      { label: 'AI Digest', href: 'daily-digest.html' },
      { label: 'Events',    href: 'events.html' },
    ]},
    { label: 'PlaceXAI', children: [
      { label: 'Projects',     href: 'projects.html' },
      { label: 'Publications', href: 'publications.html' },
      { label: 'Datasets',     href: 'datasets.html' },
      { label: 'Open Courses', href: 'courses.html' },
    ]},
    { label: 'Products', children: [
      { label: 'FlowX',            href: 'flowx.html' },
      { label: 'KNIME GIS',        href: 'knime.html' },
      { label: 'PlaceXAI Toolkit', href: 'toolkit.html' },
    ]},
    { label: 'Network', href: 'network.html' },
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const BRAND_SVG = `<img class="brand-logo" src="logos/psi.svg" width="32" height="32" alt="Place XAI" />`;

  const isActive = (item) =>
    item.href ? item.href === page : (item.children || []).some(c => c.href === page);

  const navHtml = NAV.map(item => {
    if (!item.children) {
      return `<a class="nav-link${isActive(item) ? ' active' : ''}" href="${item.href}">${item.label}</a>`;
    }
    const links = item.children.map(c =>
      `<a href="${c.href}"${c.href === page ? ' class="here"' : ''}>${c.label}</a>`
    ).join('');
    return `<div class="nav-item has-drop${isActive(item) ? ' active' : ''}">
        <button class="nav-link" aria-expanded="false">${item.label}<span class="caret"></span></button>
        <div class="drop"><div class="drop-inner">${links}</div></div>
      </div>`;
  }).join('');

  const drawerHtml = NAV.map(item => {
    if (!item.children) return `<a class="m-link" href="${item.href}">${item.label}</a>`;
    const links = item.children.map(c => `<a href="${c.href}">${c.label}</a>`).join('');
    return `<div class="m-group"><span class="m-head">${item.label}</span>${links}</div>`;
  }).join('');

  /* ---------- header ---------- */
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'header';
  header.innerHTML = `
    <div class="nav-wrap">
      <a class="brand" href="index.html" aria-label="Place XAI home">
        <span class="brand-mark" aria-hidden="true">${BRAND_SVG}</span>
        <span class="brand-text"><strong>PLACE&nbsp;XAI</strong><em>Explainable AI for Places</em></span>
      </a>
      <nav class="primary-nav" aria-label="Primary">${navHtml}</nav>
      <div class="nav-actions">
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle color theme" title="Toggle theme">
          <svg class="ic-sun" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.6" y1="4.6" x2="6.4" y2="6.4"/><line x1="17.6" y1="17.6" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.4" y2="17.6"/><line x1="17.6" y1="6.4" x2="19.4" y2="4.6"/></g></svg>
          <svg class="ic-moon" viewBox="0 0 24 24" width="18" height="18"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor"/></svg>
        </button>
        <a class="btn btn-primary collaborate" href="network.html#join">Collaborate</a>
        <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>`;

  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.id = 'mobileDrawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `<nav>${drawerHtml}<a class="btn btn-primary" href="network.html#join">Collaborate</a></nav>`;

  /* ---------- footer ---------- */
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container footer-grid">
      <div class="footer-brand">
        <span class="brand-mark" aria-hidden="true">${BRAND_SVG}</span>
        <div><strong>PLACE&nbsp;XAI</strong><p class="muted">Explainable AI for Places</p></div>
      </div>
      <div class="footer-col"><h5>Insights</h5><a href="news.html">News</a><a href="daily-digest.html">AI Digest</a><a href="events.html">Events</a></div>
      <div class="footer-col"><h5>PlaceXAI</h5><a href="projects.html">Projects</a><a href="publications.html">Publications</a><a href="datasets.html">Datasets</a><a href="courses.html">Open Courses</a></div>
      <div class="footer-col"><h5>Products</h5><a href="flowx.html">FlowX</a><a href="knime.html">KNIME GIS</a><a href="toolkit.html">PlaceXAI Toolkit</a></div>
      <div class="footer-col"><h5>Network</h5><a href="network.html">Core Team</a><a href="network.html#join">Join</a></div>
    </div>
    <div class="container footer-bottom">
      <span>© 2026 Place XAI Lab. All rights reserved.</span>
      <span class="footer-links"><a href="index.html">Privacy</a><a href="index.html">Terms</a><a href="mailto:hello@place-x.ai">Contact</a></span>
    </div>`;

  document.body.prepend(drawer);
  document.body.prepend(header);
  document.body.appendChild(footer);

  /* ---------- theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('pxai-theme', t);
    if (window.__setGlobeTheme) window.__setGlobeTheme(t);
  }
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- dropdowns: hover (CSS) + click toggle for touch/keyboard ---------- */
  const items = [...header.querySelectorAll('.has-drop')];
  items.forEach(it => {
    const btn = it.querySelector('.nav-link');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const open = !it.classList.contains('open');
      items.forEach(o => { o.classList.remove('open'); o.querySelector('.nav-link').setAttribute('aria-expanded','false'); });
      it.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-drop')) items.forEach(o => { o.classList.remove('open'); o.querySelector('.nav-link').setAttribute('aria-expanded','false'); });
  });

  /* ---------- header shadow ---------- */
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile drawer ---------- */
  const burger = document.getElementById('hamburger');
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();
