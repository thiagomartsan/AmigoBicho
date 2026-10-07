(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const year = document.querySelector('#year');
  const openStatus = document.querySelector('#open-status');
  const statusDot = document.querySelector('.status-dot');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    menu?.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('open')) closeMenu(true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 940) closeMenu(false);
  });

  const updateOpenState = () => {
    if (!openStatus || !statusDot) return;
    try {
      const parts = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date());
      const value = (type) => parts.find((part) => part.type === type)?.value ?? '';
      const weekday = value('weekday').toLowerCase().replace('.', '');
      const now = Number(value('hour')) * 60 + Number(value('minute'));
      const isWeekday = ['seg','ter','qua','qui','sex'].some((day) => weekday.startsWith(day));
      const isSaturday = weekday.startsWith('sáb') || weekday.startsWith('sab');
      const open = (isWeekday && now >= 540 && now < 1080) || (isSaturday && now >= 540 && now < 720);
      openStatus.textContent = open ? 'Aberta agora' : 'Fechada agora';
      statusDot.classList.toggle('open', open);
      statusDot.classList.toggle('closed', !open);
    } catch {
      openStatus.textContent = 'Horário de atendimento';
    }
  };
  updateOpenState();
  window.setInterval(updateOpenState, 60_000);

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const navLinks = [...document.querySelectorAll('.main-nav > a[href^="#"]')];
  const sectionMap = navLinks.map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) })).filter((item) => item.section);
  if ('IntersectionObserver' in window && sectionMap.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.remove('active'));
      sectionMap.find((item) => item.section === visible.target)?.link.classList.add('active');
    }, { rootMargin: '-32% 0px -58% 0px', threshold: [0.05,0.12,0.25] });
    sectionMap.forEach((item) => navObserver.observe(item.section));
  }

  document.querySelectorAll('.faq-list details').forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    details.addEventListener('toggle', () => summary.setAttribute('aria-expanded', details.open ? 'true' : 'false'));
  });

  document.querySelectorAll('[data-event]').forEach((element) => {
    element.addEventListener('click', () => {
      if (window.__AMIGO_BICHO_DEBUG_EVENTS__) console.info('[Amigo Bicho event]', element.dataset.event);
    });
  });
})();
