/* =========================================================
   Place XAI — page-level interactions (scroll reveal)
   Header / theme / drawer live in layout.js
   ========================================================= */
(function () {
  const targets = document.querySelectorAll('.tile, .panel, .card, .big-quote, .mission-sub, .section-head, .pub, .person');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 55 + 'ms';
  });
  if (targets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    targets.forEach(el => io.observe(el));
  }

  /* ---------- solutions showcase (home) ---------- */
  const stage = document.getElementById('solStage');
  const thumbsWrap = document.getElementById('solThumbs');
  if (stage && thumbsWrap) {
    const cards = [...stage.querySelectorAll('.solution-card')];
    const thumbs = [...thumbsWrap.querySelectorAll('.sol-thumb')];
    let index = 0, timer = null;

    function show(i) {
      index = (i + cards.length) % cards.length;
      cards.forEach((c, k) => c.classList.toggle('active', k === index));
      thumbs.forEach((t, k) => t.classList.toggle('active', k === index));
    }
    function restart() { clearInterval(timer); timer = setInterval(() => show(index + 1), 4600); }

    thumbs.forEach((t, i) => t.addEventListener('click', () => { show(i); restart(); }));
    const section = stage.closest('.solutions');
    section.addEventListener('mouseenter', () => clearInterval(timer));
    section.addEventListener('mouseleave', restart);
    show(0);
    restart();
  }
})();
