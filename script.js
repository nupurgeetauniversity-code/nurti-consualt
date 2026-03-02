/* ============================================
   NUTRI CONSULT — SCRIPT.JS
   Interactions, Animations, Canvas, Carousel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVBAR SCROLL EFFECT ---------- */
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    scrollTop.classList.toggle('show', y > 500);
  });

  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- MOBILE MENU ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* ---------- HERO CANVAS — PARTICLE / DNA GRID ---------- */
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,255,136' : '0,170,255';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 200);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const opacity = (1 - dist / 130) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,170,255,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    animFrame = requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  /* ---------- SCROLL-REVEAL ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- COUNT-UP ANIMATION ---------- */
  const countElements = document.querySelectorAll('.count-up');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.counted) return;
        el.dataset.counted = 'true';
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const startTime = performance.now();

        function updateCount(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = target;
          }
        }
        requestAnimationFrame(updateCount);
      }
    });
  }, { threshold: 0.5 });

  countElements.forEach(el => countObserver.observe(el));

  /* ---------- PROGRESS BAR ANIMATION ---------- */
  const progressFills = document.querySelectorAll('.progress-fill');
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.dataset.width;
        fill.style.width = width + '%';
        fill.classList.add('animated');
      }
    });
  }, { threshold: 0.5 });

  progressFills.forEach(el => progressObserver.observe(el));

  /* ---------- TESTIMONIAL CAROUSEL ---------- */
  const track = document.getElementById('testimonialTrack');
  const navContainer = document.getElementById('testimonialNav');
  const cards = track.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  let autoSlideInterval;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('testimonial-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    navContainer.appendChild(dot);
  });

  const dots = navContainer.querySelectorAll('.testimonial-dot');

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  document.getElementById('prevSlide').addEventListener('click', () => {
    goToSlide(currentSlide === 0 ? cards.length - 1 : currentSlide - 1);
    resetAutoSlide();
  });
  document.getElementById('nextSlide').addEventListener('click', () => {
    goToSlide(currentSlide === cards.length - 1 ? 0 : currentSlide + 1);
    resetAutoSlide();
  });

  function autoSlide() {
    autoSlideInterval = setInterval(() => {
      goToSlide(currentSlide === cards.length - 1 ? 0 : currentSlide + 1);
    }, 5000);
  }
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlide();
  }
  autoSlide();

  /* ---------- CONTACT FORM ---------- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });

  /* ---------- SMOOTH SCROLL for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ---------- ACTIVE NAV LINK HIGHLIGHT ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinksAll.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = '#ffffff';
      }
    });
  });

});
