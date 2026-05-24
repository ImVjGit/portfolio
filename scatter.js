'use strict';

class Scatter {
  constructor(element, opts = {}) {
    this.el = element;
    this.type = opts.type || 'text';
    this.dotSize = opts.dotSize || 2;
    this.gap = opts.gap || 4;
    this.color = opts.color || '#f0f0f0';
    this.hoverColor = opts.hoverColor || '#f97316';
    this.radius = opts.radius || 80;
    this.force = opts.force || 12;
    this.waveAmp = opts.waveAmp || 6;
    this.waveFreq = opts.waveFreq || 0.04;
    this.hoverOnly = opts.hoverOnly !== undefined ? opts.hoverOnly : false;
    this.particles = [];
    this.mouse = { x: -999, y: -999, prevX: -999, prevY: -999, velX: 0, velY: 0 };
    this.animId = null;
    this.running = true;
    this.fade = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2';
    this.el.style.position = 'relative';
    this.el.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    if (this.type === 'text') this.sampleText();
    else if (this.type === 'image') this.sampleImage(opts.src);

    window.addEventListener('resize', () => {
      this.resize();
      if (this.type === 'text') this.sampleText();
    });

    document.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.velX = this.mouse.x - this.mouse.prevX;
      this.mouse.velY = this.mouse.y - this.mouse.prevY;
    });

    document.addEventListener('mouseleave', () => {
      this.mouse.x = -999;
      this.mouse.y = -999;
    });

    this.loop();
  }

  resize() {
    const rect = this.el.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.w = rect.width;
    this.h = rect.height;
  }

  sampleText() {
    const text = this.el.textContent.trim();
    if (!text) return;
    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d');
    const style = getComputedStyle(this.el);
    const fontSize = parseInt(style.fontSize);
    offscreen.width = this.w;
    offscreen.height = this.h;
    octx.fillStyle = '#fff';
    octx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(text, this.w / 2, this.h / 2);

    const imageData = octx.getImageData(0, 0, this.w, this.h);
    const data = imageData.data;
    this.particles = [];
    for (let y = 0; y < this.h; y += this.gap) {
      for (let x = 0; x < this.w; x += this.gap) {
        const i = (y * this.w + x) * 4;
        if (data[i + 3] > 128) {
          this.particles.push({
            x, y, ox: x, oy: y,
            vx: 0, vy: 0,
            baseColor: this.color,
            hoverColor: this.hoverColor,
            hovered: false
          });
        }
      }
    }
  }

  sampleImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      const octx = offscreen.getContext('2d');
      offscreen.width = this.w;
      offscreen.height = this.h;
      octx.drawImage(img, 0, 0, this.w, this.h);
      const imageData = octx.getImageData(0, 0, this.w, this.h);
      const data = imageData.data;
      this.particles = [];
      for (let y = 0; y < this.h; y += this.gap * 1.5) {
        for (let x = 0; x < this.w; x += this.gap * 1.5) {
          const i = (y * this.w + x) * 4;
          if (data[i + 3] > 100) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            this.particles.push({
              x, y, ox: x, oy: y,
              vx: 0, vy: 0,
              baseColor: `rgb(${r},${g},${b})`,
              hoverColor: this.hoverColor,
              hovered: false
            });
          }
        }
      }
    };
    img.src = src;
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  update() {
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const near = mx > -50 && mx < this.w + 50 && my > -50 && my < this.h + 50;

    if (this.hoverOnly) {
      this.fade += near ? 0.08 : -0.06;
      this.fade = Math.max(0, Math.min(1, this.fade));
    } else {
      this.fade = 1;
    }

    for (const p of this.particles) {
      const dx = mx - p.ox;
      const dy = my - p.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let forceX = 0, forceY = 0;
      p.hovered = false;

      if (dist < this.radius) {
        p.hovered = true;
        const t = 1 - dist / this.radius;
        const wave = Math.sin(dist * this.waveFreq - performance.now() * 0.003) * this.waveAmp * t;
        const angle = Math.atan2(dy, dx);
        const push = this.force * t * t;
        forceX = -Math.cos(angle) * push + (dx / dist) * wave;
        forceY = -Math.sin(angle) * push + (dy / dist) * wave;
      }

      p.vx += forceX;
      p.vy += forceY;
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.x += p.vx;
      p.y += p.vy;

      const dxo = p.x - p.ox;
      const dyo = p.y - p.oy;
      if (Math.abs(dxo) < 0.5 && Math.abs(dyo) < 0.5 && dist >= this.radius) {
        p.x = p.ox;
        p.y = p.oy;
        p.vx = 0;
        p.vy = 0;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    if (this.fade < 0.01) return;
    ctx.clearRect(0, 0, w, h);
    const size = this.dotSize;

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.globalAlpha = this.fade;
      ctx.fillStyle = p.hovered ? p.hoverColor : p.baseColor;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  destroy() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.canvas.remove();
  }
}

if (typeof window !== 'undefined') window.Scatter = Scatter;
