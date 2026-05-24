'use strict';

/* ─── Instant Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('bootOverlay');
  if (overlay) overlay.remove();
  initApp();
});
function initApp() {
  /* Cursor Glow */
  const glow = document.getElementById('cursorGlow');
  let glowTimer;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
    clearTimeout(glowTimer);
    glowTimer = setTimeout(() => glow.style.opacity = '0', 2000);
  });
  document.addEventListener('mouseleave', () => glow.style.opacity = '0');

  const isMobile = window.innerWidth < 768;
  const scatterOpts = isMobile ? { gap: 6, dotSize: 1.5, radius: 0 } : { gap: 4, dotSize: 2, radius: 80 };

  new Scatter(document.getElementById('scatterName'), {
    ...scatterOpts, color: '#f0f0f0', hoverColor: '#f97316'
  });

  const profileEl = document.getElementById('scatterProfile');
  if (profileEl) {
    new Scatter(profileEl, {
      type: 'image', src: 'assets/profile.jpg?v=2',
      gap: isMobile ? 5 : 3, dotSize: isMobile ? 2 : 3,
      radius: isMobile ? 0 : 60, hoverColor: '#f97316',
      hoverOnly: true
    });
  }

  /* Background animation */
  if (!isMobile) new BgAnim();

  /* Nav */
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  const navObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    }
  }, { threshold: 0.3 });
  sections.forEach(s => navObserver.observe(s));

  /* Nav click → leaf burst */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const leaf = document.querySelector(`.section-leaf[data-section="${id}"]`);
      if (leaf) {
        leaf.classList.remove('burst');
        void leaf.offsetWidth;
        leaf.classList.add('burst');
        setTimeout(() => leaf.classList.remove('burst'), 1500);
      }
    });
  });

  /* Scroll Reveal */
  const ro = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        if (e.target.dataset.pct) {
          const pct = e.target.dataset.pct;
          if (pct) e.target.style.setProperty('--pct', pct + '%');
          e.target.classList.add('animated');
        }
        if (e.target.dataset.target) animateCount(e.target);
      }
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
  document.querySelectorAll('.skill-bar-fill').forEach(el => ro.observe(el));
  document.querySelectorAll('.metric-value').forEach(el => ro.observe(el));

  function animateCount(el) {
    const t = parseInt(el.dataset.target);
    if (!t || el.dataset.counted) return;
    el.dataset.counted = 'true';
    let cur = 0;
    const step = Math.ceil(t / 40);
    const iv = setInterval(() => {
      cur += step;
      if (cur >= t) { cur = t; clearInterval(iv); }
      el.textContent = cur;
    }, 30);
  }

  /* RAG */
  new RAGChat();

  /* Resume Modal */
  const resumeBtn = document.getElementById('resumeBtn');
  const overlay = document.getElementById('resumeOverlay');
  const modal = document.getElementById('resumeModal');
  const closeBtn = document.getElementById('resumeClose');
  const downloadBtn = document.getElementById('resumeDownload');
  const emailBtn = document.getElementById('resumeEmailBtn');
  const emailForm = document.getElementById('resumeEmailForm');
  const emailInput = document.getElementById('resumeEmailInput');
  const emailSend = document.getElementById('resumeEmailSend');
  const resumePath = 'resume.pdf';

  function openResumeModal() {
    overlay.classList.add('show');
    emailForm.classList.remove('show');
    emailInput.value = '';
  }
  function closeResumeModal() {
    overlay.classList.remove('show');
  }

  resumeBtn.addEventListener('click', openResumeModal);
  closeBtn.addEventListener('click', closeResumeModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeResumeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeResumeModal();
  });

  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = resumePath;
    a.download = 'Vijay_Girange_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    closeResumeModal();
  });

  emailBtn.addEventListener('click', () => {
    emailForm.classList.toggle('show');
    if (emailForm.classList.contains('show')) emailInput.focus();
  });

  emailSend.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      emailInput.style.borderColor = '#ef4444';
      return;
    }
    emailInput.style.borderColor = '';
    const a = document.createElement('a');
    a.href = 'mailto:' + email + '?subject=Resume%20-%20Vijay%20Girange&body=Hi%20Vijay%2C%0A%0AI%20would%20like%20your%20resume.%20Please%20attach%20it.%0A%0AThanks';
    a.click();
    closeResumeModal();
  });

  emailInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') emailSend.click();
  });

  /* ─── Stats Tracking ─── */
  function getStat(key) { return parseInt(localStorage.getItem(key)) || 0 }
  function setStat(key, val) { localStorage.setItem(key, val); return val }
  function incStat(key) { const v = getStat(key) + 1; setStat(key, v); return v }
  function updateDisplay(id, val) { const el = document.getElementById(id); if (el) el.textContent = val }

  /* Visit count */
  const visitKey = 'vg_visits_' + new Date().toDateString();
  const visits = incStat(visitKey);
  updateDisplay('statVisits', visits);

  /* Stats toggle */
  const statsEl = document.getElementById('footerStats');
  const toggleBtn = document.getElementById('statsToggle');
  if (toggleBtn && statsEl) {
    /* Init counts silently */
    function refreshStats() {
      updateDisplay('statVisits', getStat('vg_visits_' + new Date().toDateString()));
      updateDisplay('statResumes', getStat('vg_resumes'));
      updateDisplay('statEmails', getStat('vg_emails'));
    }
    refreshStats();
    toggleBtn.addEventListener('click', () => {
      statsEl.classList.toggle('show');
      refreshStats();
    });
  }

  /* Resume downloads — track & stat */
  const dlBtn = document.getElementById('resumeDownload');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      updateDisplay('statResumes', incStat('vg_resumes'));
    });
  }

  /* Emails sent (contact form) */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      const orig = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      try {
        const data = new FormData(this);
        const res = await fetch(this.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          updateDisplay('statEmails', incStat('vg_emails'));
          btn.textContent = '✓ Sent!';
          this.reset();
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
        } else {
          btn.textContent = '✗ Failed';
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
        }
      } catch {
        btn.textContent = '✗ Failed';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
      }
    });
  }

  /* Copy to Clipboard */
  document.querySelectorAll('.copy-val').forEach(el => {
    el.addEventListener('click', async function() {
      const text = this.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        const orig = this.textContent;
        this.textContent = '✓ Copied!';
        this.style.color = '#6DB33F';
        this.style.textShadow = '0 0 12px rgba(109,179,63,0.3)';
        setTimeout(() => {
          this.textContent = orig;
          this.style.color = '';
          this.style.textShadow = '';
        }, 1500);
      } catch {}
    });
  });
}

class RAGChat {
  constructor() {
    this.input = document.getElementById('ragInput');
    this.send = document.getElementById('ragSend');
    this.msgs = document.getElementById('ragMessages');
    this.pipeline = document.getElementById('ragPipeline');
    this.engine = new RAGEngine({ pipelineEl: this.pipeline });
    this.busy = false;
    this.tagIndex = null;
    if (this.input) this.bind();
    this.engine.init().then(() => this.buildTagIndex());
  }

  buildTagIndex() {
    this.tagIndex = {};
    for (const chunk of this.engine.kb) {
      for (const tag of chunk.tags) {
        const words = tag.toLowerCase().split(/\s+/);
        for (const w of words) {
          if (w.length < 3) continue;
          if (!this.tagIndex[w]) this.tagIndex[w] = [];
          if (!this.tagIndex[w].find(c => c.id === chunk.id))
            this.tagIndex[w].push(chunk);
        }
      }
    }
  }

  bind() {
    this.send.addEventListener('click', () => this.ask());
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.ask(); }
    });
  }

  async ask(query) {
    const q = query || this.input.value.trim();
    if (this.busy || !q) return;
    this.addMsg('user', q);
    if (!query) this.input.value = '';
    this.busy = true;
    this.send.textContent = '⋯';
    try {
      const a = await this.engine.answer(q);
      this.addMsg('rag', a);
    } catch (e) {
      this.addMsg('rag', 'Hit an error. Try again.');
    }
    this.busy = false;
    this.send.textContent = '⏎';
  }

  addMsg(type, text) {
    const d = document.createElement('div');
    d.className = 'rag-msg rag-msg-' + type;
    const c = document.createElement('div');
    c.className = 'rag-msg-content';
    c.textContent = text;
    d.appendChild(c);
    this.msgs.appendChild(d);

    if (type === 'rag') this.addKeywords(text, d);

    /* Auto-scroll to the new message */
    requestAnimationFrame(() => {
      this.msgs.scrollTo({ top: this.msgs.scrollHeight, behavior: 'smooth' });
    });
  }

  promptLabels = {
    skills: { q: 'Know about his {w} skill → where he used it?', icon: '⚡' },
    experience: { q: 'Curious about his {w} experience?', icon: '💼' },
    projects: { q: 'See his {w} projects?', icon: '🚀' },
    education: { q: 'Know about his {w} background?', icon: '🎓' },
    achievements: { q: 'See his {w} achievements?', icon: '🏆' },
    summary: { q: 'More about his {w}?', icon: '👤' },
    default: { q: 'Want to know about {w}?', icon: '✦' },
  };

  addKeywords(text, msgEl) {
    if (!this.tagIndex) return;
    const textLower = text.toLowerCase();
    const scored = [];

    for (const [word, chunks] of Object.entries(this.tagIndex)) {
      if (!textLower.includes(word)) continue;
      const section = chunks[0].section;
      const prompt = this.promptLabels[section] || this.promptLabels.default;
      scored.push({
        word, chunks, section,
        prompt: prompt.q.replace('{w}', word),
        icon: prompt.icon,
        priority: section === 'summary' ? 5 : section === 'experience' ? 4 : section === 'skills' ? 3 : section === 'projects' ? 3 : 1
      });
    }

    scored.sort((a, b) => b.priority - a.priority || a.word.length - b.word.length);
    const top = scored.slice(0, 3);
    if (top.length === 0) return;

    const rows = document.createElement('div');
    rows.className = 'rag-tags';

    top.forEach((item, i) => {
      const row = document.createElement('button');
      row.className = 'rag-prompt';
      row.style.setProperty('--delay', (i * 0.5) + 's');
      row.innerHTML = `<span class="rag-prompt-icon">${item.icon}</span><span class="rag-prompt-text">${item.prompt}</span> <span class="rag-prompt-cta">→</span>`;
      row.addEventListener('click', () => this.ask(item.word));
      rows.appendChild(row);
    });

    msgEl.appendChild(rows);
  }
}

document.addEventListener('DOMContentLoaded', boot);
