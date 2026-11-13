const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const openingHero = document.getElementById('openingHero');

if (openingHero) {
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      openingHero.classList.add('is-hidden');
    }, 1700);
  });
}

let liquidAnimating = false;
let pendingTheme = null;
const PAINT_TRANSITION_MS = 1800;

const themeMap = {
  charcoal: '#111111',
  gold: '#F4C542',
  marfil: '#F2EEE5',
  terracotta: '#A83227',
  champagne: '#D7C6A1',
  burgundy: '#6D3541',
  white: '#FFFFFF'
};

const applyTheme = (theme) => {
  if (!theme) return;
  document.body.setAttribute('data-theme', theme);
};

const createWavePath = (width, height, progress) => {
  const points = [];
  const steps = Math.ceil(width / 8);
  const baseY = -height * 0.15 + (height * 1.3 * progress);

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const wave1 = Math.sin(x * 0.009 + progress * 5) * 34;
    const wave2 = Math.sin(x * 0.019 - progress * 7) * 17;
    const wave3 = Math.sin(x * 0.004 + progress * 3) * 24;
    const amplitude = Math.sin(progress * Math.PI * 0.85);
    const y = baseY + (wave1 + wave2 + wave3) * amplitude;
    points.push([x, y]);
  }

  let path = `M 0 0 L ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const middleX = (previous[0] + current[0]) / 2;
    const middleY = (previous[1] + current[1]) / 2;
    path += ` Q ${previous[0]} ${previous[1]} ${middleX} ${middleY}`;
  }

  const last = points[points.length - 1];
  path += ` L ${last[0]} ${last[1]} L ${width} 0 Z`;
  return path;
};

const runLiquidPaintTransition = (paintColor, onComplete = () => {}) => {
  if (liquidAnimating || !paintColor) return;

  liquidAnimating = true;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'paint-layer');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('fill', paintColor);
  svg.appendChild(path);
  document.body.appendChild(svg);

  const duration = PAINT_TRANSITION_MS;
  const start = performance.now();

  const animate = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    path.setAttribute('d', createWavePath(width, height, eased));

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      svg.remove();
      liquidAnimating = false;
      if (pendingTheme) {
        applyTheme(pendingTheme);
        pendingTheme = null;
      }
      onComplete();
    }
  };

  requestAnimationFrame(animate);
};

const triggerSelectionAnimation = (element, onAfterAnimation = () => {}) => {
  if (!element) return;
  document.querySelectorAll('.pulse-select').forEach((item) => item.classList.remove('pulse-select'));
  element.classList.remove('pulse-select');
  void element.offsetWidth;
  element.classList.add('pulse-select');

  const sourceTheme = element.closest('[data-theme]')?.dataset.theme || 'gold';
  const paintColor = themeMap[sourceTheme] || '#F4C542';

  runLiquidPaintTransition(paintColor, () => {
    applyTheme(sourceTheme);
    onAfterAnimation();
  });

  window.setTimeout(() => element.classList.remove('pulse-select'), PAINT_TRANSITION_MS);
};

if (navToggle && siteNav) {
  const navSubmenus = document.querySelectorAll('.nav-item--submenu');

  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navSubmenus.forEach((menuItem) => {
    const toggle = menuItem.querySelector('.nav-drop-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menuItem.classList.contains('is-open');

      navSubmenus.forEach((other) => {
        if (other !== menuItem) {
          other.classList.remove('is-open');
          const otherToggle = other.querySelector('.nav-drop-toggle');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
        }
      });

      menuItem.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target)) {
      navSubmenus.forEach((menuItem) => {
        menuItem.classList.remove('is-open');
        const toggle = menuItem.querySelector('.nav-drop-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    const linkLabel = (link.textContent || '').trim().toLowerCase();
    const href = link.getAttribute('href') || '';
    const isHeaderHomeLink = linkLabel === 'inicio' && link.closest('.site-nav') && (
      href === 'https://tevezmarketing.digital' ||
      href === 'https://tevezmarketing.digital/' ||
      href === '/' ||
      href === ''
    );

    if (isHeaderHomeLink) {
      link.classList.add('home-nav-link');
      return;
    }

    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');

      if (!href) return;

      const isExternal = /^https?:\/\//i.test(href) || href.startsWith('//');
      const isAnchor = href.startsWith('#');

      if (isAnchor) {
        event.preventDefault();
        const targetId = href.slice(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        const targetTheme = targetSection.dataset.theme || 'gold';
        const paintColor = themeMap[targetTheme] || '#F4C542';

        runLiquidPaintTransition(paintColor, () => {
          applyTheme(targetTheme);
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }

      if (isExternal) {
        event.preventDefault();
        const paintColor = '#F4C542';
        runLiquidPaintTransition(paintColor, () => {
          window.location.href = href;
        });
      }
    });
  });
}

const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card) => {
  const link = card.querySelector('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;

  link.addEventListener('click', (event) => {
    const targetUrl = href.startsWith('/') ? new URL(href, window.location.origin).toString() : href;
    event.preventDefault();
    event.stopPropagation();
    triggerSelectionAnimation(card, () => {
      window.location.assign(targetUrl);
    });
  });
});

const interactiveTargets = document.querySelectorAll('.price-card, .method-step, .principle-card, .review-card');
interactiveTargets.forEach((card) => {
  card.addEventListener('click', () => triggerSelectionAnimation(card));
});

const leadModal = document.getElementById('lead-qualifier');
const leadClose = document.querySelector('.lead-close');
const leadTriggers = document.querySelectorAll('.lead-trigger');

const closeLeadModal = () => {
  if (!leadModal) return;
  leadModal.classList.remove('is-open');
  leadModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

const openLeadModal = () => {
  if (!leadModal) return;
  leadModal.classList.add('is-open');
  leadModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};

leadTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openLeadModal();
  });
});

if (leadClose) {
  leadClose.addEventListener('click', closeLeadModal);
}

if (leadModal) {
  leadModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'true') {
      closeLeadModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && leadModal?.classList.contains('is-open')) {
    closeLeadModal();
  }
});

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const intentValue = formData.get('intent') || 'asesoria';
    const cityValue = (formData.get('city') || '').toString().trim();
    const nameValue = (formData.get('name') || '').toString().trim();

    const intentText = intentValue === 'servicio' ? 'quiero comprar un servicio' : 'quiero asesoría';
    const cityText = cityValue || 'no especificó ciudad';
    const safeName = nameValue || 'Cliente';

    const message = `Hola Tévez, ${intentText}. Soy de ${cityText} y mi nombre es ${safeName}. Quiero que me ayuden a definir la mejor opción para mi negocio.`;
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=573170183313&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

    closeLeadModal();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

const progressBar = document.querySelector('#scroll-progress');
if (progressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? (scrollTop / height) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

const themeSections = document.querySelectorAll('[data-theme]');

if ('IntersectionObserver' in window && themeSections.length) {
  const themeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const nextTheme = entry.target.dataset.theme;
        if (liquidAnimating) {
          pendingTheme = nextTheme;
        } else {
          applyTheme(nextTheme);
        }
      }
    });
  }, { threshold: 0.55 });

  themeSections.forEach((section) => themeObserver.observe(section));
} else if (themeSections.length) {
  applyTheme(themeSections[0].dataset.theme);
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

