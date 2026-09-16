// ------------------------------------------------------
// Ticking timecode HUD (HH:MM:SS:FF at 24fps, purely cosmetic)
// ------------------------------------------------------
(function tickTimecode(){
  const tc = document.getElementById('tc');
  const mtc = document.getElementById('mtc');
  if(!tc && !mtc) return;
  const start = Date.now();
  const fps = 24;

  function pad(n, len){ return String(n).padStart(len, '0'); }

  function frame(){
    const elapsedMs = Date.now() - start;
    const totalFrames = Math.floor(elapsedMs / (1000 / fps));
    const ff = totalFrames % fps;
    const totalSeconds = Math.floor(totalFrames / fps);
    const ss = totalSeconds % 60;
    const mm = Math.floor(totalSeconds / 60) % 60;
    const hh = Math.floor(totalSeconds / 3600);
    const stamp = `${pad(hh,2)}:${pad(mm,2)}:${pad(ss,2)}:${pad(ff,2)}`;
    if(tc) tc.textContent = stamp;
    if(mtc) mtc.textContent = stamp;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ------------------------------------------------------
// Scrubber nav: click to smooth-scroll, playhead follows section in view
// ------------------------------------------------------
(function scrubberNav(){
  const marks = Array.from(document.querySelectorAll('.mark'));
  const playhead = document.getElementById('playhead');
  if(!marks.length || !playhead) return;

  const targets = marks
    .map(m => ({ mark: m, el: document.querySelector(m.dataset.target) }))
    .filter(t => t.el);

  marks.forEach(m => {
    m.addEventListener('click', () => {
      const el = document.querySelector(m.dataset.target);
      if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function updatePlayhead(){
    const viewportMid = window.scrollY + window.innerHeight * 0.35;
    let active = targets[0];
    for(const t of targets){
      if(t.el.offsetTop <= viewportMid) active = t;
    }
    if(active){
      playhead.style.left = active.mark.style.left;
    }
  }

  window.addEventListener('scroll', updatePlayhead, { passive: true });
  window.addEventListener('resize', updatePlayhead);
  updatePlayhead();
})();

// ------------------------------------------------------
// Stat count-up: animate each .num from 0 to its data-value once visible
// ------------------------------------------------------
(function countUpStats(){
  const nums = Array.from(document.querySelectorAll('.stat .num'));
  if(!nums.length) return;

  function formatNumber(n, decimals){
    return decimals
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString('en-US');
  }

  function animate(el){
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const startTime = performance.now();

    function easeOutQuad(t){ return t * (2 - t); }

    function step(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutQuad(progress);
      const current = target * eased;
      el.textContent = formatNumber(current, decimals) + suffix;
      if(progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
})();
