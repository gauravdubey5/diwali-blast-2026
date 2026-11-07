/**
 * DIWALI BLAST 2026 - PARTICLE & PHYSICS ENGINE
 * Advanced particle simulation with object pooling, realistic gravity,
 * air resistance, trail buffers, and multiple festive particle archetypes.
 */

// Particle types enum
export const ParticleType = {
  SPARK: 'SPARK',                     // Standard firework spark with trail
  CHRYSANTHEMUM: 'CHRYSANTHEMUM',     // Long-trail chrysanthemum spark with lingering glitter
  WILLOW: 'WILLOW',                   // Golden willow spark that drifts slowly with gravity
  CRACKLE: 'CRACKLE',                 // Dragon egg spark that crackles at end of life
  SPARKLER: 'SPARKLER',               // High-speed erratic starburst spark for phuljhadi
  ANAR_JET: 'ANAR_JET',               // High-velocity vertical spray spark for flower pot
  BOMB_SHRAPNEL: 'BOMB_SHRAPNEL',     // Heavy explosive debris and fiery sparks
  SMOKE: 'SMOKE',                     // Soft translucent drifting smoke puff
  SHOCKWAVE: 'SHOCKWAVE',             // Expanding radial shockwave ring
  GLITTER: 'GLITTER'                  // Tiny twinkling golden micro-spark
};

/**
 * Particle Class
 * Reusable particle object designed for high-performance pooling.
 */
export class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.type = ParticleType.SPARK;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.gravity = 0.08;
    this.friction = 0.985;
    this.alpha = 1.0;
    this.decay = 0.015;
    this.size = 2.5;
    this.baseSize = 2.5;
    this.color = '#ffd700';
    this.secondaryColor = null;
    this.flicker = false;
    this.trailLength = 4;
    this.trail = []; // Array of {x, y, alpha}
    this.life = 1.0;
    this.maxLife = 1.0;
    this.crackleAtEnd = false;
    this.sparkleIntensity = 0;
    this.radius = 0;
    this.maxRadius = 0;
    this.growthRate = 0;
    this.lineWidth = 2;
    this.rotation = 0;
    this.vRotation = 0;
  }

  /**
   * Initialize a particle with specific physics parameters
   */
  init(options) {
    this.active = true;
    this.type = options.type || ParticleType.SPARK;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
    this.gravity = options.gravity !== undefined ? options.gravity : 0.07;
    this.friction = options.friction !== undefined ? options.friction : 0.985;
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0;
    this.decay = options.decay || 0.015;
    this.size = options.size || 2.5;
    this.baseSize = this.size;
    this.color = options.color || '#ffd700';
    this.secondaryColor = options.secondaryColor || null;
    this.flicker = !!options.flicker;
    this.trailLength = options.trailLength !== undefined ? options.trailLength : 3;
    this.trail = [];
    this.life = 1.0;
    this.maxLife = options.maxLife || 1.0;
    this.crackleAtEnd = !!options.crackleAtEnd;
    this.sparkleIntensity = options.sparkleIntensity || 0;
    this.radius = options.radius || 0;
    this.maxRadius = options.maxRadius || 0;
    this.growthRate = options.growthRate || 0;
    this.lineWidth = options.lineWidth || 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRotation = (Math.random() - 0.5) * 0.1;

    // Seed initial trail point
    if (this.trailLength > 0) {
      this.trail.push({ x: this.x, y: this.y });
    }
  }

  /**
   * Update particle physics per frame
   * @param {number} dt Delta time multiplier (1.0 = normal 60fps)
   * @returns {boolean} True if particle is still alive, false if dead
   */
  update(dt = 1.0) {
    if (!this.active) return false;

    // Shockwave expansion logic
    if (this.type === ParticleType.SHOCKWAVE) {
      this.radius += this.growthRate * dt;
      this.alpha -= this.decay * dt;
      if (this.radius >= this.maxRadius || this.alpha <= 0) {
        this.active = false;
        return false;
      }
      return true;
    }

    // Save trail point before moving
    if (this.trailLength > 0) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }
    }

    // Apply acceleration, friction, and gravity
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    this.vy += this.gravity * dt;

    this.vx *= Math.pow(this.friction, dt);
    this.vy *= Math.pow(this.friction, dt);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Rotation update
    this.rotation += this.vRotation * dt;

    // Life and alpha decay
    this.alpha -= this.decay * dt;
    this.life -= (this.decay / this.maxLife) * dt;

    // Special behavior per particle type
    if (this.type === ParticleType.WILLOW) {
      // Golden willow particles gently shrink and twinkle
      this.size = Math.max(0.6, this.baseSize * (this.alpha * 0.9 + 0.1));
    } else if (this.type === ParticleType.ANAR_JET) {
      // Anar fountain sparks shimmer rapidly
      this.size = this.baseSize * (0.8 + Math.random() * 0.4);
    } else if (this.type === ParticleType.SMOKE) {
      // Smoke expands as it rises and fades
      this.size += 0.3 * dt;
    } else if (this.type === ParticleType.SPARKLER) {
      // Sparkler sparks have erratic jitter
      this.vx += (Math.random() - 0.5) * 0.8;
      this.vy += (Math.random() - 0.5) * 0.8;
    }

    // Check if dead
    if (this.alpha <= 0 || (this.y > window.innerHeight + 100 && this.vy > 0)) {
      this.active = false;
      return false;
    }

    return true;
  }

  /**
   * Render particle onto canvas context
   */
  draw(ctx) {
    if (!this.active || this.alpha <= 0) return;

    ctx.save();

    // Shockwave rendering
    if (this.type === ParticleType.SHOCKWAVE) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.radius), 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      ctx.lineWidth = this.lineWidth * (this.alpha);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Calculate effective alpha (incorporate twinkle/flicker)
    let currentAlpha = this.alpha;
    if (this.flicker) {
      currentAlpha *= 0.4 + Math.random() * 0.6;
    }
    currentAlpha = Math.max(0, Math.min(1, currentAlpha));
    ctx.globalAlpha = currentAlpha;

    // Draw motion trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.lineTo(this.x, this.y);

      // Trailing line style
      ctx.strokeStyle = this.secondaryColor || this.color;
      ctx.lineWidth = Math.max(0.5, this.size * 0.8);
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw particle head
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Extra luminous glow for intense sparks (Chrysanthemum / Sparkler / Willow)
    if (this.sparkleIntensity > 0 && currentAlpha > 0.4) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (1.8 + this.sparkleIntensity), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = currentAlpha * 0.45;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * ParticlePool Class
 * High-performance object pool that eliminates garbage collection stalls.
 */
export class ParticlePool {
  constructor(initialSize = 1500, maxSize = 6000) {
    this.pool = [];
    this.maxSize = maxSize;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Particle());
    }
  }

  /**
   * Acquire an active particle initialized with options
   */
  acquire(options) {
    let particle;
    if (this.pool.length > 0) {
      particle = this.pool.pop();
    } else {
      particle = new Particle();
    }
    particle.init(options);
    return particle;
  }

  /**
   * Return a dead particle to the pool for reuse
   */
  release(particle) {
    if (!particle) return;
    particle.reset();
    if (this.pool.length < this.maxSize) {
      this.pool.push(particle);
    }
  }

  /**
   * Current size of available pooled particles
   */
  availableCount() {
    return this.pool.length;
  }
}

