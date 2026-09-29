(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.65 } });
  window.addEventListener('load', refreshIcons);

  const topbar = $('#topbar');
  const backTop = $('#backTop');
  const updateChrome = () => {
    const y = window.scrollY;
    topbar?.classList.toggle('scrolled', y > 24);
    backTop?.classList.toggle('show', y > 600);
  };
  updateChrome();
  addEventListener('scroll', updateChrome, { passive: true });
  backTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const menu = $('#mobileMenu');
  const menuBtn = $('#menuBtn');
  const menuClose = $('#menuClose');
  let menuScrollY = 0;
  function openMenu(){
    menuScrollY = window.scrollY;
    menu?.classList.add('open');
    menu?.setAttribute('aria-hidden','false');
    menuBtn?.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
  }
  function closeMenu(){
    menu?.classList.remove('open');
    menu?.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    requestAnimationFrame(() => window.scrollTo(0, menuScrollY));
  }
  menuBtn?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  $$('#mobileMenu a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    menu?.classList.remove('open');
    menu?.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
  }));
  addEventListener('keydown', e => { if(e.key === 'Escape' && menu?.classList.contains('open')) closeMenu(); });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold:.12, rootMargin:'0px 0px -40px' }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('visible'));

  $$('.carousel').forEach(carousel => {
    const viewport = $('.carousel-viewport', carousel);
    const track = $('.carousel-track', carousel);
    const slides = $$('.carousel-track > *', carousel);
    const prev = $('.prev', carousel);
    const next = $('.next', carousel);
    const dotsWrap = $('.carousel-dots', carousel);
    let index = 0;
    let startX = 0, startY = 0, currentX = 0, dragging = false, axis = null;

    const dots = () => $$('.carousel-dot', carousel);

    function perView(){
      if(carousel.classList.contains('review-carousel')) return innerWidth <= 640 ? 1 : innerWidth <= 980 ? 2 : 3;
      return 1;
    }
    function maxIndex(){ return Math.max(0, slides.length - perView()); }
    function renderDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for(let i = 0; i <= maxIndex(); i++){
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === index ? ' active' : '');
        dot.setAttribute('aria-label', `Ir para posição ${i+1}`);
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);
      }
    }
    function go(i, animate = true){
      index = Math.max(0, Math.min(i, maxIndex()));
      track.style.transition = animate ? '' : 'none';
      const slide = slides[0];
      if(!slide) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const x = index * (slide.getBoundingClientRect().width + gap);
      track.style.transform = `translate3d(${-x}px,0,0)`;
      dots().forEach((d,n) => d.classList.toggle('active', n === index));
      prev.disabled = index === 0;
      next.disabled = index >= maxIndex();
    }
    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));

    viewport?.addEventListener('pointerdown', e => {
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      startX = currentX = e.clientX; startY = e.clientY; axis = null; dragging = true;
    });
    viewport?.addEventListener('pointermove', e => {
      if(!dragging) return;
      currentX = e.clientX;
      const dx = currentX - startX, dy = e.clientY - startY;
      if(!axis && Math.hypot(dx,dy) > 8) axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
      if(axis !== 'x') return;
      e.preventDefault();
      track.style.transition = 'none';
      const slide = slides[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const base = index * (slide.getBoundingClientRect().width + gap);
      track.style.transform = `translate3d(${-(base) + dx}px,0,0)`;
    }, { passive:false });
    const endDrag = () => {
      if(!dragging) return;
      dragging = false;
      const dx = currentX - startX;
      if(axis === 'x' && Math.abs(dx) > Math.min(80, viewport.clientWidth * .15)) go(index + (dx < 0 ? 1 : -1));
      else go(index);
      axis = null;
    };
    viewport?.addEventListener('pointerup', endDrag);
    viewport?.addEventListener('pointercancel', endDrag);
    addEventListener('resize', () => { index = Math.min(index, maxIndex()); renderDots(); go(index, false); }, { passive:true });
    renderDots();
    go(0, false);
  });

  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `rotateX(${-y*5}deg) rotateY(${x*7}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  $('#year').textContent = new Date().getFullYear();
})();
