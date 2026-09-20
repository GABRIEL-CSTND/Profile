/* ═══════════════════════════════════════
   script.js — Vanilla JS interactions
═══════════════════════════════════════ */

'use strict';

// ── Custom cursor + trail ────────────────────────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

// Ring lags behind using lerp
let ringX = window.innerWidth  / 2;
let ringY = window.innerHeight / 2;
let dotX  = ringX;
let dotY  = ringY;

// Trail config
const TRAIL_COUNT    = 14;    // how many dots in the tail
const TRAIL_INTERVAL = 10;    // ms between spawning a trail dot
const trailColors    = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24'];
let   lastTrailTime  = 0;

function spawnTrail(x, y) {
  const now = performance.now();
  if (now - lastTrailTime < TRAIL_INTERVAL) return;
  lastTrailTime = now;

  const dot = document.createElement('div');
  dot.className = 'cursor-trail';

  const size  = Math.random() * 6 + 3;          // 3–9 px
  const color = trailColors[Math.floor(Math.random() * trailColors.length)];

  dot.style.left   = x + 'px';
  dot.style.top    = y + 'px';
  dot.style.width  = size + 'px';
  dot.style.height = size + 'px';
  dot.style.background   = color;
  dot.style.boxShadow    = `0 0 ${size * 2}px ${color}`;
  // Add some randomness around 1.5s so it looks organic
  dot.style.animationDuration = (Math.random() * 0.4 + 1.3) + 's';

  document.body.appendChild(dot);
  // Wait slightly longer than max duration (1.7s) before removing from DOM
  setTimeout(() => dot.remove(), 1700);
}

document.addEventListener('mousemove', (e) => {
  const { clientX: x, clientY: y } = e;

  // Dot snaps immediately
  dotX = x; dotY = y;
  cursorDot.style.left = x + 'px';
  cursorDot.style.top  = y + 'px';

  // Glow follows lazily (handled by lerp loop)
  cursorGlow.style.left = x + 'px';
  cursorGlow.style.top  = y + 'px';

  // Spawn trail
  spawnTrail(x, y);
});

// Lerp ring position every frame
(function lerpRing() {
  ringX += (dotX - ringX) * 0.12;
  ringY += (dotY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(lerpRing);
})();

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
  cursorDot.style.opacity  = '0';
  cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursorGlow.style.opacity = '1';
  cursorDot.style.opacity  = '1';
  cursorRing.style.opacity = '1';
});

// Hover state on interactive elements
const interactives = document.querySelectorAll('a, button, .skill-category, .project-card, .fun-fact, input, textarea');
interactives.forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-hover');
    cursorGlow.style.background = 'radial-gradient(circle, rgba(167,139,250,.18) 0%, transparent 70%)';
  });
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-hover');
    cursorGlow.style.background = 'radial-gradient(circle, rgba(34,211,238,.12) 0%, transparent 70%)';
  });
});



// ── Particle canvas ─────────────────────────────────────────────────────────
const canvas  = document.getElementById('particles-canvas');
const ctx     = canvas.getContext('2d');
let   width   = window.innerWidth;
let   height  = window.innerHeight;
let   particles = [];
let   mouse   = { x: width / 2, y: height / 2 };

canvas.width  = width;
canvas.height = height;

window.addEventListener('resize', () => {
  width  = canvas.width  = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
});

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ── Game: Eat particles and explode ───────────────────────────────────────────
let eatenCount = 0;
const MAX_CURSOR_SIZE = 300;
let currentCursorRadius = 15;

function updateCursorSize() {
  const baseSize = 10;
  const growth = eatenCount * 1.5; 
  const newSize = Math.min(baseSize + growth, MAX_CURSOR_SIZE);
  currentCursorRadius = newSize / 2 + 5;
  document.documentElement.style.setProperty('--cursor-size', newSize + 'px');
}

let isExploding = false;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && eatenCount > 0 && !isExploding) {
    e.preventDefault(); // Prevent scrolling
    isExploding = true;
    
    // Smoothly shrink the cursor over 1.5 seconds (anticipation/charging effect)
    cursorDot.style.transition = 'width 1s cubic-bezier(0.8, 0, 0.2, 1), height 1s cubic-bezier(0.8, 0, 0.2, 1), background .2s';
    
    // Shrink visually back to 10px, and stop eating new dots while charging
    document.documentElement.style.setProperty('--cursor-size', '10px');
    currentCursorRadius = 0; 

    // Wait 1.5s then trigger the explosion
    setTimeout(() => {
      explodeCursor();
      isExploding = false;
      
      // Restore the fast, snappy transition for normal movement
      cursorDot.style.transition = 'width .1s var(--ease), height .1s var(--ease), background .2s';
    }, 1000);
  }
});

function explodeCursor() {
  // Cap at 60 dots to avoid lag
  const explodeCount = Math.min(eatenCount * 3, 60); 
  
  for (let i = 0; i < explodeCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    const size = Math.random() * 8 + 4;
    const color = trailColors[Math.floor(Math.random() * trailColors.length)];
    
    dot.style.left = mouse.x + 'px';
    dot.style.top = mouse.y + 'px';
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.background = color;
    dot.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    dot.style.animation = 'none'; // Disable default trail animation
    
    // Shoot outwards
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100 + 50 + (eatenCount * 1.5);
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    dot.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 500 + 600,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    });
    
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1200);
  }
  
  // Reset
  eatenCount = 0;
  updateCursorSize();
}

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x     = Math.random() * width;
    this.y     = Math.random() * height;
    // Make dots slightly larger
    this.size  = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    // Increase base alpha
    this.alpha = Math.random() * 0.5 + 0.5;
    
    // 🎨 CHANGE DOT COLORS HERE (Hue values from 0-360)
    // 190 = Cyan, 270 = Purple, 320 = Pink
    const hues  = [0, 60, 320];   
    this.hue   = hues[Math.floor(Math.random() * hues.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    const dx   = mouse.x - this.x;
    const dy   = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // EAT PARTICLE (if not heavily hovered on interactive elements)
    if (dist < currentCursorRadius && !document.body.classList.contains('cursor-hover')) {
      eatenCount++;
      updateCursorSize();
      this.reset();
      return; 
    }

    // Subtle mouse repulsion
    if (dist < 120 + currentCursorRadius) {
      this.x -= (dx / dist) * 0.5;
      this.y -= (dy / dist) * 0.5;
    }

    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = `hsl(${this.hue}, 90%, 70%)`;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = `hsl(${this.hue}, 90%, 70%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((width * height) / 10000), 120);
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 100) * 0.08;
        ctx.strokeStyle = `hsl(190, 90%, 70%)`;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// ── Navbar scroll behavior ───────────────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link highlight
  const sections = document.querySelectorAll('section[id]');
  let current = '';

  sections.forEach(sec => {
    const top    = sec.offsetTop - 120;
    const bottom = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      current = sec.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current
      ? 'var(--cyan)'
      : '';
  });
}, { passive: true });


// ── Smooth reveal on scroll ──────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      siblings.forEach((el, idx) => {
        if (!el.classList.contains('visible')) {
          setTimeout(() => el.classList.add('visible'), idx * 120);
        }
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── Animated stat counters ───────────────────────────────────────────────────
function animateCounter(el) {
  const target   = parseInt(el.dataset.target);
  const duration = 1400;
  const step     = target / (duration / 16);
  let   current  = 0;

  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current < target) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num[data-target]');
      const bars = entry.target.querySelectorAll('.stat-fill');
      nums.forEach(n => animateCounter(n));
      bars.forEach(b => setTimeout(() => b.classList.add('animate'), 300));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) statObserver.observe(statsSection);


// ── Terminal typewriter ──────────────────────────────────────────────────────
const terminalEl  = document.getElementById('terminal-text');
const terminalWrap = document.querySelector('.terminal');

const lines = [
  "whoami",
  "gabriel — Creative Developer & Problem Solver",
  "",
  "cat skills.txt",
  "React · Node.js · Python · CSS Magic · Git",
  "",
  "echo 'Always building, always learning 🚀'",
  "Always building, always learning 🚀",
  "",
  "git log --oneline -1",
  "a7f3d12 (HEAD) feat: added more coffee",
];

const terminalBody = document.getElementById('terminal-body');

let lineIdx = 0;
let charIdx = 0;
let text    = '';

function resetTerminal() {
  // Wipe everything and rebuild the skeleton the terminal body needs
  terminalBody.innerHTML =
    '<span class="prompt">❯ </span>' +
    '<span id="terminal-text"></span>' +
    '<span class="cursor-blink">_</span>';
}

function typeTerminal() {
  // Re-grab terminalEl since we wiped the DOM
  const termEl = document.getElementById('terminal-text');

  if (lineIdx >= lines.length) {
    // Pause then restart clean
    setTimeout(() => {
      lineIdx = 0; charIdx = 0; text = '';
      resetTerminal();
      setTimeout(typeTerminal, 400);
    }, 3500);
    return;
  }

  const line      = lines[lineIdx];
  const isCommand = lineIdx % 2 === 0;

  if (charIdx < line.length) {
    // Still typing current line
    text += line[charIdx];
    termEl.textContent = text;
    termEl.style.color = isCommand ? 'var(--cyan)' : 'var(--text-dim)';
    charIdx++;
    setTimeout(typeTerminal, isCommand ? 55 : 18);
  } else {
    // Line finished — commit it as a static node before termEl
    const span = document.createElement('span');
    span.style.color = isCommand ? 'var(--cyan)' : 'var(--text-dim)';
    span.textContent = text;

    if (isCommand) {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = '❯ ';
      span.prepend(promptSpan);
    }

    // Insert the finished line above the live cursor
    termEl.before(span);
    termEl.before(document.createElement('br'));

    // Reset for next line
    text = '';
    charIdx = 0;
    lineIdx++;
    termEl.textContent = '';
    termEl.style.color = '';

    const delay = isCommand ? 700 : 350;
    setTimeout(typeTerminal, delay);
  }
}


// Start when terminal is visible
const termObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      resetTerminal();               // always start with a clean slate
      setTimeout(typeTerminal, 600);
      termObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

if (terminalWrap) termObserver.observe(terminalWrap);



// ── Contact form ─────────────────────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn   = document.getElementById('submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('name');
    const emailEl   = document.getElementById('email');
    const messageEl = document.getElementById('message');

    if (!nameEl.value || !emailEl.value || !messageEl.value) return;

    // Simulate send
    submitBtn.querySelector('span').textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.style.display = 'none';
      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(() => {
        formSuccess.classList.remove('show');
        submitBtn.style.display = '';
        submitBtn.querySelector('span').textContent = 'Send message';
        submitBtn.disabled = false;
      }, 5000);
    }, 1200);
  });
}


// ── Footer year ───────────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ── Tilt effect on project cards ─────────────────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    card.style.transition = 'none';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'all .4s var(--ease, cubic-bezier(.4,0,.2,1))';
    card.style.transform  = 'translateY(0) rotateX(0) rotateY(0)';
  });
});


// ── Staggered hero entrance ───────────────────────────────────────────────────
// Already handled via CSS animation-delay on title lines.
// Enhance avatar float tags with interactive title change
const tagTexts = {
  'tag-1': ['🚀 Builder',  '🔥 Maker',   '⚡ Creator'],
  'tag-2': ['🎨 Designer', '🖌️ Artist',  '🌈 Stylist'],
  'tag-3': ['⚡ Hacker',   '🛠️ Tinkerer', '🤖 Dev'],
};

Object.entries(tagTexts).forEach(([id, texts]) => {
  const el = document.getElementById(id);
  if (!el) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % texts.length;
    el.style.opacity = '0';
    el.style.transform = 'scale(.8)';
    el.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => {
      el.textContent = texts[i];
      el.style.opacity = '1';
      el.style.transform = '';
    }, 300);
  }, 3000 + Math.random() * 1000);
});
