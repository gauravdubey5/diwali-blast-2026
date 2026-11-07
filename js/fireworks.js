/**
 * DIWALI BLAST 2026 - HTML5 CANVAS FIREWORKS ENGINE
 * High-performance fireworks simulation with physics, object pooling,
 * custom burst archetypes (Peony, Chrysanthemum, Willow, Ring, Heart, Star),
 * Cartoon Bomb blast, Anar (Flowerpot) fountains, Sparkler trails, and Grand Finale.
 */

import { Particle, ParticleType, ParticlePool } from './particles.js';
import { soundManager } from './sound.js';

// Festive color palettes
export const PALETTES = {
  GOLDEN_ROYAL: ['#FFE066', '#FFD700', '#FFB703', '#FB8500', '#FFF3B0'],
  VIBRANT_FESTIVE: ['#FF007F', '#00F5D4', '#7B2CBF', '#FFD700', '#00BBF9'],
  EMERALD_RUBY: ['#00F59B', '#FF0055', '#FFCC00', '#38B000', '#FF4D6D'],
  SUNSET_BLISS: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'],
  TRICOLOR_PRIDE: ['#FF9933', '#FFFFFF', '#138808', '#FFD700'],
  COSMIC_MAGIC: ['#E0AAFF', '#C77DFF', '#9D4EDD', '#7B2CBF', '#FF007F'],
  WHITE_GLITTER: ['#FFFFFF', '#F0F8FF', '#FFF8DC', '#FFE4B5']
};

export class Rocket {
  constructor(options = {}) {
    this.x = options.x !== undefined ? options.x : window.innerWidth * 0.5;
    this.y = options.y !== undefined ? options.y : window.innerHeight;
    this.startX = this.x;
    this.targetX = options.targetX !== undefined ? options.targetX : options.x;
    this.targetY = options.targetY !== undefined ? options.targetY : window.innerHeight * (0.15 + Math.random() * 0.35);

    // Calculate trajectory velocities
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.hypot(dx, dy);

    this.speed = options.speed || (14 + Math.random() * 4);
    const flightSteps = distance / this.speed;

    this.vx = dx / flightSteps;
    this.vy = dy / flightSteps;
    this.gravity = 0.04;

    this.color = options.color || '#ffd700';
    this.palette = options.palette || PALETTES.GOLDEN_ROYAL;
    this.type = options.type || 'PEONY'; // PEONY, CHRYSANTHEMUM, WILLOW, RING, HEART, STAR, MULTI_BREAK
    this.trail = [];
    this.alive = true;
    this.size = options.size || 2.8;

    // Pan based on X position (-1.0 to 1.0)
    const pan = (this.x / window.innerWidth) * 2 - 1;
    soundManager.playRocketLaunch(pan);
  }

  update(dt = 1.0) {
    if (!this.alive) return false;

    // Add trail coordinate
    this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
    if (this.trail.length > 8) {
      this.trail.shift();
    }

    // Apply movement
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Check if reached or surpassed target altitude (or velocity reversed)
    if (this.y <= this.targetY || this.vy >= 0) {
      this.alive = false;
      return false; // Time to explode!
    }

    return true;
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    // Draw rocket trail sparks
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Glowing head
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Animated Cartoon Bomb
 */
export class Bomb {
  constructor(x, y, onExplode) {
    this.x = x;
    this.y = y;
    this.onExplode = onExplode;
    this.fuseTime = 2.0; // 2 seconds countdown
    this.timer = this.fuseTime;
    this.alive = true;
    this.radius = 26;
    this.pulse = 0;

    // Play fuse sizzle sound
    soundManager.playFuseSizzle(this.fuseTime);
  }

  update(dt = 1.0, particlePool, activeParticles) {
    if (!this.alive) return false;

    this.timer -= (dt / 60);
    this.pulse += 0.15 * dt;

    // Spawn sparks from top of burning fuse
    const fuseProgress = Math.max(0, this.timer / this.fuseTime);
    const fuseStartX = this.x;
    const fuseStartY = this.y - this.radius;
    const fuseEndX = this.x + 18;
    const fuseEndY = this.y - this.radius - 22;

    const sparkX = fuseStartX + (fuseEndX - fuseStartX) * fuseProgress;
    const sparkY = fuseStartY + (fuseEndY - fuseStartY) * fuseProgress;

    // Emit lively sparks
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      const p = particlePool.acquire({
        type: ParticleType.SPARKLER,
        x: sparkX,
        y: sparkY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        color: Math.random() > 0.4 ? '#ffd700' : '#ffffff',
        decay: 0.06,
        size: 1.8,
        gravity: 0.08
      });
      activeParticles.push(p);
    }

    if (this.timer <= 0) {
      this.alive = false;
      if (this.onExplode) this.onExplode(this.x, this.y);
      return false;
    }

    return true;
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    const fuseProgress = Math.max(0, this.timer / this.fuseTime);

    // Fuse cord
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.radius);
    ctx.quadraticCurveTo(this.x + 8, this.y - this.radius - 12, this.x + 18, this.y - this.radius - 22);
    ctx.strokeStyle = '#cda274';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Burning fuse indicator
    const fuseStartX = this.x;
    const fuseStartY = this.y - this.radius;
    const fuseEndX = this.x + 18;
    const fuseEndY = this.y - this.radius - 22;
    const sparkX = fuseStartX + (fuseEndX - fuseStartX) * fuseProgress;
    const sparkY = fuseStartY + (fuseEndY - fuseStartY) * fuseProgress;

    // Glowing spark tip
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 4 + Math.sin(this.pulse * 2) * 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 15;
    ctx.fill();

    // Bomb body (Festive red/gold sphere with brass cap)
    const scale = 1.0 + Math.sin(this.pulse) * 0.06;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);

    // Drop shadow on ground
    ctx.beginPath();
    ctx.ellipse(0, this.radius + 8, this.radius * 0.9, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Sphere body gradient
    const grad = ctx.createRadialGradient(-7, -8, 2, 0, 0, this.radius);
    grad.addColorStop(0, '#ff4d6d');
    grad.addColorStop(0.4, '#c9184a');
    grad.addColorStop(0.8, '#590d22');
    grad.addColorStop(1, '#200109');

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    // Decorative golden Diwali ribbon / band
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius - 1, 9, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center festive star/symbol
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', 0, 0);

    // Brass collar
    ctx.fillStyle = '#e0a96d';
    ctx.fillRect(-6, -this.radius - 4, 12, 5);

    ctx.restore();
  }
}

/**
 * Anar (Flowerpot Fountain)
 */
export class AnarFountain {
  constructor(x, y, duration = 6.0) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.timer = duration;
    this.alive = true;
    this.height = 36;
    this.width = 30;

    soundManager.playAnarFountain(duration);
  }

  update(dt = 1.0, particlePool, activeParticles) {
    if (!this.alive) return false;

    this.timer -= (dt / 60);

    // Calculate intensity curve: build up, peak, taper off
    const progress = 1.0 - (this.timer / this.duration);
    let intensity = 1.0;
    if (progress < 0.15) {
      intensity = progress / 0.15; // Ramp up
    } else if (progress > 0.85) {
      intensity = (1.0 - progress) / 0.15; // Ramp down
    }

    // Number of sparks per frame based on intensity
    const count = Math.floor((12 + Math.random() * 12) * Math.max(0.2, intensity));

    const nozzleX = this.x;
    const nozzleY = this.y - this.height;

    for (let i = 0; i < count; i++) {
      // Parabolic fountain physics: vertical velocity with slight horizontal spray
      const spreadAngle = (Math.PI / 2) + (Math.random() - 0.5) * 0.45;
      const initialSpeed = (8 + Math.random() * 10) * (0.6 + intensity * 0.6);

      const vx = Math.cos(spreadAngle) * initialSpeed;
      const vy = -Math.sin(spreadAngle) * initialSpeed;

      // Color shifts: white-hot at base, rich gold/orange in mid-air
      let sparkColor = '#ffd700';
      const rand = Math.random();
      if (rand < 0.25) {
        sparkColor = '#ffffff';
      } else if (rand < 0.6) {
        sparkColor = '#ffe066';
      } else if (rand < 0.85) {
        sparkColor = '#ff9e00';
      } else {
        sparkColor = '#ff0055'; // occasional vibrant accent
      }

      const p = particlePool.acquire({
        type: ParticleType.ANAR_JET,
        x: nozzleX + (Math.random() - 0.5) * 6,
        y: nozzleY,
        vx: vx,
        vy: vy,
        gravity: 0.18, // Gravity pulls sparks gracefully back down
        friction: 0.985,
        decay: 0.018 + Math.random() * 0.015,
        size: 2.4,
        color: sparkColor,
        sparkleIntensity: 1,
        trailLength: 2
      });
      activeParticles.push(p);
    }

    if (this.timer <= 0) {
      this.alive = false;
      return false;
    }

    return true;
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    // Draw terracotta/brass cone container
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + 5, this.y - this.height);
    ctx.lineTo(this.x - 5, this.y - this.height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(this.x - 15, this.y, this.x + 15, this.y);
    grad.addColorStop(0, '#78290f');
    grad.addColorStop(0.5, '#c05621');
    grad.addColorStop(1, '#4a1508');
    ctx.fillStyle = grad;
    ctx.fill();

    // Golden bands on pot
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nozzle white-hot glow
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Main Fireworks Engine Controller
 */
export class FireworksEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.particlePool = new ParticlePool(2000, 7000);

    this.activeRockets = [];
    this.activeParticles = [];
    this.activeBombs = [];
    this.activeAnars = [];

    this.isRunning = false;
    this.autoFireworks = true; // Auto background fireworks
    this.autoInterval = null;
    this.sparklerMode = false;
    this.isMuted = true;

    this.lastTime = performance.now();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Screen flash & shake states
    this.screenFlashAlpha = 0;
    this.shakeIntensity = 0;

    // Callbacks
    this.onFinaleProgress = null;

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width <= 768 || ('ontouchstart' in window);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.75 : 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Initial clear with midnight sky color
    this.ctx.fillStyle = '#06030c';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());

    // Pause physics if tab is hidden to prevent lag spikes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoFireworks();
      } else if (this.autoFireworks) {
        this.startAutoFireworks();
      }
    });
  }

  handleResize() {
    this.initCanvas();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();

    if (this.autoFireworks) {
      this.startAutoFireworks();
    }
  }

  stop() {
    this.isRunning = false;
    this.stopAutoFireworks();
  }

  startAutoFireworks() {
    this.stopAutoFireworks();
    this.autoFireworks = true;
    this.autoInterval = setInterval(() => {
      if (!this.autoFireworks || document.hidden) return;
      // Launch random background firework
      const startX = this.width * (0.15 + Math.random() * 0.7);
      const targetX = startX + (Math.random() - 0.5) * 200;
      const targetY = this.height * (0.12 + Math.random() * 0.35);

      const types = ['PEONY', 'CHRYSANTHEMUM', 'WILLOW', 'RING', 'MULTI_BREAK', 'STAR', 'HEART'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      const paletteKeys = Object.keys(PALETTES);
      const chosenPalette = PALETTES[paletteKeys[Math.floor(Math.random() * paletteKeys.length)]];

      this.launchRocket({
        x: startX,
        targetX: targetX,
        targetY: targetY,
        type: chosenType,
        palette: chosenPalette,
        size: 2.8
      });
    }, 1800);
  }

  stopAutoFireworks() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }

  toggleAutoFireworks() {
    if (this.autoFireworks) {
      this.stopAutoFireworks();
      this.autoFireworks = false;
    } else {
      this.startAutoFireworks();
      this.autoFireworks = true;
    }
    return this.autoFireworks;
  }

  clearScreen() {
    // Return all particles to pool
    this.activeParticles.forEach(p => this.particlePool.release(p));
    this.activeParticles = [];
    this.activeRockets = [];
    this.activeBombs = [];
    this.activeAnars = [];

    this.ctx.fillStyle = '#06030c';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  triggerScreenFlash(alpha = 0.8) {
    this.screenFlashAlpha = Math.max(this.screenFlashAlpha, alpha);
  }

  triggerScreenShake(intensity = 12) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  // ==========================================
  // FIREWORK CREATION & BURST ARTIFACTS
  // ==========================================

  /**
   * 1. Launch a single rocket
   */
  launchRocket(options = {}) {
    const rocket = new Rocket(options);
    this.activeRockets.push(rocket);
    return rocket;
  }

  /**
   * 2. Explode a rocket at given coordinates based on its archetype
   */
  explode(x, y, type = 'PEONY', palette = PALETTES.GOLDEN_ROYAL) {
    const pan = (x / this.width) * 2 - 1;

    switch (type) {
      case 'CHRYSANTHEMUM':
        this.createChrysanthemumBurst(x, y, palette, pan);
        break;
      case 'WILLOW':
        this.createWillowBurst(x, y, palette, pan);
        break;
      case 'RING':
        this.createRingBurst(x, y, palette, pan);
        break;
      case 'HEART':
        this.createHeartBurst(x, y, palette, pan);
        break;
      case 'STAR':
        this.createStarBurst(x, y, palette, pan);
        break;
      case 'MULTI_BREAK':
        this.createMultiBreakBurst(x, y, palette, pan);
        break;
      case 'PEONY':
      default:
        this.createPeonyBurst(x, y, palette, pan);
        break;
    }
  }

  /**
   * Classic spherical Peony burst
   */
  createPeonyBurst(x, y, palette, pan = 0) {
    soundManager.playExplosion({ size: 1.0, pan });
    const count = this.isMobile ? 80 : (120 + Math.floor(Math.random() * 40));
    const baseColor = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      const color = Math.random() > 0.25 ? baseColor : palette[Math.floor(Math.random() * palette.length)];

      const p = this.particlePool.acquire({
        type: ParticleType.SPARK,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.07,
        friction: 0.97,
        decay: 0.016 + Math.random() * 0.012,
        size: 2.2,
        color: color,
        trailLength: 3
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * Chrysanthemum burst: leaves trailing glitter and ends with crackles
   */
  createChrysanthemumBurst(x, y, palette, pan = 0) {
    soundManager.playExplosion({ size: 1.2, pan, crackles: true });
    const count = this.isMobile ? 90 : 140;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 6.5;
      const color = palette[Math.floor(Math.random() * palette.length)];

      const p = this.particlePool.acquire({
        type: ParticleType.CHRYSANTHEMUM,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.06,
        friction: 0.978,
        decay: 0.012 + Math.random() * 0.01,
        size: 2.6,
        color: color,
        secondaryColor: '#fff3b0',
        sparkleIntensity: 1,
        trailLength: 5,
        crackleAtEnd: true
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * Kamuro / Golden Willow: heavy golden weeping willow cascading downward
   */
  createWillowBurst(x, y, palette = PALETTES.GOLDEN_ROYAL, pan = 0) {
    soundManager.playExplosion({ size: 1.3, pan });
    const count = 150;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 4.8;

      const p = this.particlePool.acquire({
        type: ParticleType.WILLOW,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        gravity: 0.045, // very gentle descent
        friction: 0.985,
        decay: 0.007 + Math.random() * 0.005, // very long life
        size: 2.8,
        color: '#ffd700',
        secondaryColor: '#ffe882',
        flicker: true,
        sparkleIntensity: 1.5,
        trailLength: 6
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * Ring / Saturn Shell: Expanding circular halo with inner core
   */
  createRingBurst(x, y, palette, pan = 0) {
    soundManager.playExplosion({ size: 1.1, pan });
    const ringCount = 80;
    const ringColor = palette[0];
    const coreColor = palette[1] || '#ffffff';

    // Outer Ring
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 5.2;

      const p = this.particlePool.acquire({
        type: ParticleType.SPARK,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.55, // flattened elliptical perspective
        gravity: 0.04,
        friction: 0.975,
        decay: 0.015,
        size: 2.5,
        color: ringColor,
        trailLength: 3
      });
      this.activeParticles.push(p);
    }

    // Inner Core
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.2;
      const p = this.particlePool.acquire({
        type: ParticleType.SPARK,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.05,
        friction: 0.96,
        decay: 0.02,
        size: 2.0,
        color: coreColor,
        trailLength: 2
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * Heart Shaped Firework
   */
  createHeartBurst(x, y, palette, pan = 0) {
    soundManager.playExplosion({ size: 1.1, pan });
    const count = 90;
    const heartColor = '#ff1a75';

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      // Parametric heart formula
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      const speedFactor = 0.28;
      const p = this.particlePool.acquire({
        type: ParticleType.SPARK,
        x, y,
        vx: hx * speedFactor,
        vy: hy * speedFactor,
        gravity: 0.04,
        friction: 0.975,
        decay: 0.014,
        size: 2.5,
        color: heartColor,
        trailLength: 3
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * 5-Pointed Star Firework
   */
  createStarBurst(x, y, palette, pan = 0) {
    soundManager.playExplosion({ size: 1.1, pan });
    const points = 5;
    const countPerSpoke = 18;
    const starColor = '#ffd700';

    for (let p = 0; p < points; p++) {
      const spokeAngle = (p / points) * Math.PI * 2 - Math.PI / 2;
      for (let s = 1; s <= countPerSpoke; s++) {
        const speed = (s / countPerSpoke) * 5.8;
        const part = this.particlePool.acquire({
          type: ParticleType.SPARK,
          x, y,
          vx: Math.cos(spokeAngle) * speed + (Math.random() - 0.5) * 0.4,
          vy: Math.sin(spokeAngle) * speed + (Math.random() - 0.5) * 0.4,
          gravity: 0.04,
          friction: 0.975,
          decay: 0.015,
          size: 2.4,
          color: starColor,
          trailLength: 3
        });
        this.activeParticles.push(part);
      }
    }
  }

  /**
   * Multi-Break Shell: primary burst throws out secondary explosive clusters
   */
  createMultiBreakBurst(x, y, palette, pan = 0) {
    this.createPeonyBurst(x, y, palette, pan);
    // Secondary delayed cluster bursts
    const clusterCount = 4;
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2;
      const dist = 50 + Math.random() * 30;
      const subX = x + Math.cos(angle) * dist;
      const subY = y + Math.sin(angle) * dist;

      setTimeout(() => {
        this.createPeonyBurst(subX, subY, PALETTES.GOLDEN_ROYAL, (subX / this.width) * 2 - 1);
      }, 350 + i * 120);
    }
  }

  /**
   * 3. Bomb Blast (Cartoon Lakshmi / Sutli Bomb)
   */
  triggerBomb(x, y) {
    const bomb = new Bomb(x, y, (blastX, blastY) => {
      // Massive visual blast execution
      soundManager.playBombBlast();
      this.triggerScreenFlash(0.95);
      this.triggerScreenShake(20);

      // Expanding Shockwave
      const shockwave = this.particlePool.acquire({
        type: ParticleType.SHOCKWAVE,
        x: blastX,
        y: blastY,
        radius: 10,
        maxRadius: Math.min(this.width, this.height) * 0.65,
        growthRate: 18,
        color: '#ffd700',
        lineWidth: 6,
        alpha: 1.0,
        decay: 0.025
      });
      this.activeParticles.push(shockwave);

      // Massive shrapnel & explosion sparks (300 particles)
      for (let i = 0; i < 280; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4.0 + Math.random() * 14.0;
        const rand = Math.random();
        let color = '#ff4d6d';
        if (rand < 0.4) color = '#ffd700';
        else if (rand < 0.7) color = '#ff9e00';
        else if (rand < 0.9) color = '#ffffff';

        const p = this.particlePool.acquire({
          type: ParticleType.BOMB_SHRAPNEL,
          x: blastX,
          y: blastY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.12,
          friction: 0.965,
          decay: 0.015 + Math.random() * 0.02,
          size: 2.8 + Math.random() * 2.0,
          color: color,
          trailLength: 4
        });
        this.activeParticles.push(p);
      }

      // Smoke puffs
      for (let s = 0; s < 18; s++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;
        const smoke = this.particlePool.acquire({
          type: ParticleType.SMOKE,
          x: blastX + Math.cos(angle) * dist,
          y: blastY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.8 - Math.random() * 1.5,
          gravity: -0.02, // drifts up
          friction: 0.98,
          decay: 0.008,
          size: 15 + Math.random() * 15,
          color: 'rgba(180, 160, 200, 0.25)',
          alpha: 0.45
        });
        this.activeParticles.push(smoke);
      }
    });

    this.activeBombs.push(bomb);
    return bomb;
  }

  /**
   * 4. Anar Fountain (Flower Pot)
   */
  triggerAnar(x, y) {
    const anar = new AnarFountain(x, y, 6.5);
    this.activeAnars.push(anar);
    return anar;
  }

  /**
   * 5. Sparkler Interaction (Phuljhadi)
   */
  triggerSparkler(x, y, density = 15) {
    soundManager.playSparkler(0.15);

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 6.0;
      const color = Math.random() > 0.35 ? '#ffd700' : (Math.random() > 0.5 ? '#ffffff' : '#ff9e00');

      const p = this.particlePool.acquire({
        type: ParticleType.SPARKLER,
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.08,
        friction: 0.94,
        decay: 0.035 + Math.random() * 0.03,
        size: 2.2,
        color: color,
        sparkleIntensity: 1.5,
        trailLength: 2
      });
      this.activeParticles.push(p);
    }
  }

  /**
   * 6. Multi-Rocket Show (Cake Battery / Salvo)
   */
  launchMultiRocketShow(count = 14) {
    const stepDelay = 140; // milliseconds between launches

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.isRunning) return;
        const progress = i / (count - 1); // 0 to 1
        const startX = this.width * (0.15 + progress * 0.7) + (Math.random() - 0.5) * 40;
        const targetX = startX + (progress - 0.5) * 180;
        const targetY = this.height * (0.12 + Math.random() * 0.28);

        const types = ['PEONY', 'CHRYSANTHEMUM', 'WILLOW', 'RING', 'STAR'];
        const chosenType = types[i % types.length];
        const palettes = [PALETTES.GOLDEN_ROYAL, PALETTES.VIBRANT_FESTIVE, PALETTES.EMERALD_RUBY, PALETTES.SUNSET_BLISS];
        const chosenPalette = palettes[i % palettes.length];

        this.launchRocket({
          x: startX,
          targetX: targetX,
          targetY: targetY,
          type: chosenType,
          palette: chosenPalette,
          size: 3.0
        });
      }, i * stepDelay);
    }
  }

  /**
   * 7. Grand Finale Experience
   */
  triggerGrandFinale(onComplete) {
    this.stopAutoFireworks();
    this.triggerScreenFlash(0.4);

    // Wave 1: Twin ground Anar fountains at left and right
    const leftAnar = this.triggerAnar(this.width * 0.18, this.height - 20);
    const rightAnar = this.triggerAnar(this.width * 0.82, this.height - 20);

    // Wave 2: Salvo of 16 rockets across the sky
    setTimeout(() => {
      this.launchMultiRocketShow(16);
    }, 1200);

    // Wave 3: Massive Golden Kamuro Willow Cascades that blanket the heavens
    setTimeout(() => {
      for (let w = 0; w < 5; w++) {
        setTimeout(() => {
          const wx = this.width * (0.2 + w * 0.15);
          const wy = this.height * (0.15 + (w % 2) * 0.08);
          this.createWillowBurst(wx, wy, PALETTES.GOLDEN_ROYAL, (wx / this.width) * 2 - 1);
        }, w * 350);
      }
    }, 3800);

    // Wave 4: Synchronized Bomb Blasts
    setTimeout(() => {
      this.triggerBomb(this.width * 0.35, this.height * 0.5);
      this.triggerBomb(this.width * 0.65, this.height * 0.5);
    }, 6200);

    // Wave 5: Climax Chrysanthemum Barrage
    setTimeout(() => {
      for (let c = 0; c < 8; c++) {
        setTimeout(() => {
          const cx = this.width * (0.1 + Math.random() * 0.8);
          const cy = this.height * (0.12 + Math.random() * 0.3);
          this.createChrysanthemumBurst(cx, cy, PALETTES.VIBRANT_FESTIVE, (cx / this.width) * 2 - 1);
        }, c * 220);
      }
    }, 8500);

    // Wave 6: Grand Finale Golden Blanket
    setTimeout(() => {
      this.triggerScreenFlash(0.8);
      this.createWillowBurst(this.width * 0.5, this.height * 0.22, PALETTES.GOLDEN_ROYAL, 0);

      if (onComplete) {
        onComplete();
      }

      // Resume auto fireworks after finale
      setTimeout(() => {
        if (this.autoFireworks) {
          this.startAutoFireworks();
        }
      }, 4000);
    }, 11500);
  }

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================

  animate(currentTime = performance.now()) {
    if (!this.isRunning) return;

    requestAnimationFrame((t) => this.animate(t));

    const dt = Math.min((currentTime - this.lastTime) / 16.667, 3.0); // Capped delta time
    this.lastTime = currentTime;

    // Apply Screen Shake if active
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 0.8 * dt);
    }

    this.ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      this.ctx.translate(shakeX, shakeY);
    }

    // Motion blur trailing clear
    // Semi-transparent black clear creates stunning silky trails behind sparks
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'rgba(6, 3, 14, 0.18)';
    this.ctx.fillRect(-20, -20, this.width + 40, this.height + 40);

    // 1. Update and Draw Rockets
    for (let i = this.activeRockets.length - 1; i >= 0; i--) {
      const rocket = this.activeRockets[i];
      const isAlive = rocket.update(dt);
      if (!isAlive) {
        // Rocket arrived at target: Explode!
        this.explode(rocket.x, rocket.y, rocket.type, rocket.palette);
        this.activeRockets.splice(i, 1);
      } else {
        rocket.draw(this.ctx);
      }
    }

    // 2. Update and Draw Anar Fountains
    for (let i = this.activeAnars.length - 1; i >= 0; i--) {
      const anar = this.activeAnars[i];
      const isAlive = anar.update(dt, this.particlePool, this.activeParticles);
      if (!isAlive) {
        this.activeAnars.splice(i, 1);
      } else {
        anar.draw(this.ctx);
      }
    }

    // 3. Update and Draw Bombs
    for (let i = this.activeBombs.length - 1; i >= 0; i--) {
      const bomb = this.activeBombs[i];
      const isAlive = bomb.update(dt, this.particlePool, this.activeParticles);
      if (!isAlive) {
        this.activeBombs.splice(i, 1);
      } else {
        bomb.draw(this.ctx);
      }
    }

    // 4. Update and Draw Particles
    // Use additive blending ('lighter') for luminous fireworks intensity
    this.ctx.globalCompositeOperation = 'lighter';
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      const isAlive = p.update(dt);
      if (!isAlive) {
        this.particlePool.release(p);
        this.activeParticles.splice(i, 1);
      } else {
        p.draw(this.ctx);
      }
    }

    // 5. Render Screen Flash Overlay
    if (this.screenFlashAlpha > 0.01) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = `rgba(255, 245, 220, ${this.screenFlashAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.screenFlashAlpha -= 0.04 * dt;
    }

    this.ctx.restore();
  }
}

