/**
 * DIWALI BLAST 2026 - USER INTERACTIONS & UI BINDINGS
 * Handles all 7 fireworks buttons, utility toggles, touch & mouse sparkler,
 * canvas click triggers, keyboard shortcuts, personalized greetings, and WhatsApp sharing.
 */

import { soundManager } from './sound.js';
import { PALETTES } from './fireworks.js';

export class InteractionManager {
  constructor(engine) {
    this.engine = engine;
    this.activeMode = 'ROCKET'; // ROCKET, BOMB, MEGA, ANAR, SPARKLER, MULTI, FINALE
    this.userName = 'Friend';
    this.isDragging = false;
    this.lastSparklerTime = 0;

    this.initElements();
    this.bindEvents();
    this.checkUrlParams();
  }

  initElements() {
    // Control Buttons
    this.btnRocket = document.getElementById('btn-launch-rocket');
    this.btnBomb = document.getElementById('btn-bomb-blast');
    this.btnMega = document.getElementById('btn-mega-fireworks');
    this.btnAnar = document.getElementById('btn-anar-fountain');
    this.btnSparkler = document.getElementById('btn-sparkler-mode');
    this.btnMulti = document.getElementById('btn-multi-rocket');
    this.btnFinale = document.getElementById('btn-grand-finale');

    // Utility Buttons
    this.btnSound = document.getElementById('btn-toggle-sound');
    this.btnAuto = document.getElementById('btn-toggle-auto');
    this.btnClear = document.getElementById('btn-clear-screen');
    this.btnReplay = document.getElementById('btn-replay-hero');
    this.btnOpenWishes = document.getElementById('btn-open-wishes');
    this.btnTogglePanel = document.getElementById('btn-toggle-panel');
    this.controlPanel = document.getElementById('control-panel');

    // Modals & Overlays
    this.heroSection = document.getElementById('hero-section');
    this.grandFinaleOverlay = document.getElementById('grand-finale-overlay');
    this.btnFinaleClose = document.getElementById('btn-finale-close');
    this.wishesModal = document.getElementById('wishes-modal');
    this.btnCloseWishes = document.getElementById('btn-close-wishes');

    // Wishes fields
    this.wishesNameInput = document.getElementById('wishes-name-input');
    this.wishesRecipientInput = document.getElementById('wishes-recipient-input');
    this.wishesPreview = document.getElementById('wishes-preview-text');
    this.btnCopyGreeting = document.getElementById('btn-copy-greeting');
    this.btnWhatsappShare = document.getElementById('btn-whatsapp-share');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');

    // Diyas
    this.diyas = document.querySelectorAll('.interactive-diya');
  }

  bindEvents() {
    // Canvas interactions (Clicks, touches, drags)
    const canvas = this.engine.canvas;
    canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', () => { this.isDragging = false; });
    window.addEventListener('pointercancel', () => { this.isDragging = false; });

    // 1. Launch Rocket
    if (this.btnRocket) {
      this.btnRocket.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnRocket);
        const startX = this.engine.width * (0.2 + Math.random() * 0.6);
        const targetX = startX + (Math.random() - 0.5) * 200;
        const targetY = this.engine.height * (0.15 + Math.random() * 0.3);
        this.engine.launchRocket({
          x: startX,
          targetX: targetX,
          targetY: targetY,
          type: 'PEONY',
          palette: PALETTES.GOLDEN_ROYAL
        });
        this.showToast('🚀 Rocket Launched!');
      });
    }

    // 2. Bomb Blast
    if (this.btnBomb) {
      this.btnBomb.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnBomb);
        const bx = this.engine.width * (0.35 + Math.random() * 0.3);
        const by = this.engine.height * (0.65 + Math.random() * 0.15);
        this.engine.triggerBomb(bx, by);
        this.showToast('💥 Bomb Placed & Fuse Lit!');
      });
    }

    // 3. Mega Fireworks
    if (this.btnMega) {
      this.btnMega.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnMega);
        const startX = this.engine.width * 0.5 + (Math.random() - 0.5) * 100;
        const targetY = this.engine.height * 0.22;
        this.engine.launchRocket({
          x: startX,
          targetX: startX,
          targetY: targetY,
          type: 'MULTI_BREAK',
          palette: PALETTES.VIBRANT_FESTIVE,
          size: 3.5
        });
        this.showToast('🎆 Mega Chrysanthemum Cluster!');
      });
    }

    // 4. Anar Fountain
    if (this.btnAnar) {
      this.btnAnar.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnAnar);
        const ax = this.engine.width * (0.25 + Math.random() * 0.5);
        const ay = this.engine.height - 30;
        this.engine.triggerAnar(ax, ay);
        this.showToast('🔥 Anar (Flowerpot) Fountain Lit!');
      });
    }

    // 5. Sparkler Mode
    if (this.btnSparkler) {
      this.btnSparkler.addEventListener('click', () => {
        soundManager.init();
        this.engine.sparklerMode = !this.engine.sparklerMode;
        if (this.engine.sparklerMode) {
          this.btnSparkler.classList.add('active-sparkler');
          document.body.classList.add('cursor-sparkler');
          this.showToast('✨ Sparkler Active! Move mouse or touch to draw sparks.');
          // Initial sparkler burst at center
          this.engine.triggerSparkler(this.engine.width * 0.5, this.engine.height * 0.5, 40);
        } else {
          this.btnSparkler.classList.remove('active-sparkler');
          document.body.classList.remove('cursor-sparkler');
          this.showToast('Sparkler Mode Deactivated');
        }
      });
    }

    // 6. Multi-Rocket Show
    if (this.btnMulti) {
      this.btnMulti.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnMulti);
        this.engine.launchMultiRocketShow(14);
        this.showToast('🌈 Multi-Rocket Battery Salvo Launched!');
      });
    }

    // 7. Grand Finale
    if (this.btnFinale) {
      this.btnFinale.addEventListener('click', () => {
        soundManager.init();
        this.setActiveButton(this.btnFinale);
        this.showToast('🎇 Initiating Grand Diwali Finale Spectacle!');

        this.engine.triggerGrandFinale(() => {
          this.showGrandFinaleOverlay();
        });
      });
    }

    // Secondary: Sound Toggle
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        this.updateSoundButtonState(isMuted);
        this.showToast(isMuted ? '🔇 Audio Muted' : '🔊 Festive Audio Enabled');
      });
    }

    // Secondary: Auto Fireworks Toggle
    if (this.btnAuto) {
      this.btnAuto.addEventListener('click', () => {
        const isAuto = this.engine.toggleAutoFireworks();
        this.updateAutoButtonState(isAuto);
        this.showToast(isAuto ? '🔄 Auto Fireworks Enabled' : '⏸️ Auto Fireworks Paused');
      });
    }

    // Secondary: Clear Sky
    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => {
        this.engine.clearScreen();
        this.showToast('🧹 Sky Cleared');
      });
    }

    // Secondary: Replay Celebration / Hero
    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        if (this.heroSection) {
          this.heroSection.classList.remove('hidden');
          this.heroSection.style.display = 'flex';
          this.heroSection.style.opacity = '1';
          this.heroSection.style.pointerEvents = 'auto';
        }
        this.showToast('🔁 Welcome Back to Diwali Blast 2026!');
      });
    }

    // Secondary: Open Wishes Modal
    if (this.btnOpenWishes) {
      this.btnOpenWishes.addEventListener('click', () => {
        this.openWishesModal();
      });
    }

    // Floating Panel Minimize / Maximize Toggle
    if (this.btnTogglePanel && this.controlPanel) {
      this.btnTogglePanel.addEventListener('click', () => {
        const isCollapsed = this.controlPanel.classList.toggle('collapsed');
        this.btnTogglePanel.setAttribute('aria-expanded', String(!isCollapsed));
        this.btnTogglePanel.title = isCollapsed ? 'Expand Controls' : 'Minimize Controls';
      });
    }

    // Grand Finale Overlay Close
    if (this.btnFinaleClose && this.grandFinaleOverlay) {
      this.btnFinaleClose.addEventListener('click', () => {
        this.grandFinaleOverlay.classList.remove('visible');
      });
    }

    // Wishes Modal Close
    if (this.btnCloseWishes && this.wishesModal) {
      this.btnCloseWishes.addEventListener('click', () => {
        this.wishesModal.classList.remove('visible');
      });
    }

    // Wishes Name Input change
    if (this.wishesNameInput) {
      this.wishesNameInput.addEventListener('input', () => this.updateWishesPreview());
    }
    if (this.wishesRecipientInput) {
      this.wishesRecipientInput.addEventListener('input', () => this.updateWishesPreview());
    }

    // Copy Greeting
    if (this.btnCopyGreeting) {
      this.btnCopyGreeting.addEventListener('click', () => this.copyGreetingToClipboard());
    }

    // WhatsApp Share
    if (this.btnWhatsappShare) {
      this.btnWhatsappShare.addEventListener('click', () => this.shareViaWhatsapp());
    }

    // Interactive Diyas
    this.diyas.forEach((diya) => {
      diya.addEventListener('click', (e) => {
        soundManager.init();
        soundManager.playBellChime();
        const rect = diya.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 3;
        this.engine.triggerSparkler(cx, cy, 25);
        this.showToast('🪔 Diya Blessed with Light & Chimes!');
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handlePointerDown(e) {
    soundManager.init();
    this.isDragging = true;
    const rect = this.engine.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.engine.sparklerMode) {
      this.engine.triggerSparkler(x, y, 20);
      return;
    }

    // If clicked in bottom 18% of screen, spawn an Anar fountain or launch rocket
    if (y > this.engine.height * 0.85) {
      this.engine.triggerAnar(x, this.engine.height - 20);
      this.showToast('🔥 Ground Anar Fountain Ignited!');
    } else {
      // Launch rocket directly targeting the clicked position
      const startX = this.engine.width * 0.5 + (Math.random() - 0.5) * 100;
      const palettes = Object.values(PALETTES);
      const chosenPalette = palettes[Math.floor(Math.random() * palettes.length)];
      const types = ['PEONY', 'CHRYSANTHEMUM', 'WILLOW', 'RING', 'STAR', 'HEART'];
      const chosenType = types[Math.floor(Math.random() * types.length)];

      this.engine.launchRocket({
        x: startX,
        targetX: x,
        targetY: y,
        type: chosenType,
        palette: chosenPalette,
        size: 3.0
      });
    }
  }

  handlePointerMove(e) {
    const now = performance.now();
    // In sparkler mode or when dragging, create continuous sizzling sparkler trails
    if (this.engine.sparklerMode || this.isDragging) {
      if (now - this.lastSparklerTime > 35) { // 28 updates/sec throttle
        this.lastSparklerTime = now;
        const rect = this.engine.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.engine.triggerSparkler(x, y, 10);
      }
    }
  }

  handleKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    soundManager.init();

    switch (e.key) {
      case '1':
        if (this.btnRocket) this.btnRocket.click();
        break;
      case '2':
        if (this.btnBomb) this.btnBomb.click();
        break;
      case '3':
        if (this.btnMega) this.btnMega.click();
        break;
      case '4':
        if (this.btnAnar) this.btnAnar.click();
        break;
      case '5':
        if (this.btnSparkler) this.btnSparkler.click();
        break;
      case '6':
        if (this.btnMulti) this.btnMulti.click();
        break;
      case '7':
        if (this.btnFinale) this.btnFinale.click();
        break;
      case ' ':
        e.preventDefault();
        if (this.btnRocket) this.btnRocket.click();
        break;
      case 'm':
      case 'M':
        if (this.btnSound) this.btnSound.click();
        break;
      case 'a':
      case 'A':
        if (this.btnAuto) this.btnAuto.click();
        break;
      case 'c':
      case 'C':
        if (this.btnClear) this.btnClear.click();
        break;
      case 'r':
      case 'R':
        if (this.btnReplay) this.btnReplay.click();
        break;
      case 'w':
      case 'W':
        this.openWishesModal();
        break;
      case 'Escape':
        if (this.grandFinaleOverlay) this.grandFinaleOverlay.classList.remove('visible');
        if (this.wishesModal) this.wishesModal.classList.remove('visible');
        if (this.engine.sparklerMode && this.btnSparkler) this.btnSparkler.click();
        break;
    }
  }

  setActiveButton(button) {
    const allButtons = [this.btnRocket, this.btnBomb, this.btnMega, this.btnAnar, this.btnMulti, this.btnFinale];
    allButtons.forEach(b => {
      if (b) b.classList.remove('button-pressed');
    });
    if (button) {
      button.classList.add('button-pressed');
      setTimeout(() => button.classList.remove('button-pressed'), 300);
    }
  }

  updateSoundButtonState(isMuted) {
    if (!this.btnSound) return;
    const icon = this.btnSound.querySelector('.btn-icon');
    const label = this.btnSound.querySelector('.btn-label');
    if (isMuted) {
      if (icon) icon.textContent = '🔇';
      if (label) label.textContent = 'Sound OFF';
      this.btnSound.classList.remove('active');
    } else {
      if (icon) icon.textContent = '🔊';
      if (label) label.textContent = 'Sound ON';
      this.btnSound.classList.add('active');
    }
  }

  updateAutoButtonState(isAuto) {
    if (!this.btnAuto) return;
    const icon = this.btnAuto.querySelector('.btn-icon');
    const label = this.btnAuto.querySelector('.btn-label');
    if (isAuto) {
      if (icon) icon.textContent = '🔄';
      if (label) label.textContent = 'Auto ON';
      this.btnAuto.classList.add('active');
    } else {
      if (icon) icon.textContent = '⏸️';
      if (label) label.textContent = 'Auto OFF';
      this.btnAuto.classList.remove('active');
    }
  }

  showToast(message, duration = 3000) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;

    this.toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 350);
    }, duration);
  }

  // ==========================================
  // GRAND FINALE DISPLAY
  // ==========================================

  showGrandFinaleOverlay() {
    if (!this.grandFinaleOverlay) return;
    const nameSpan = document.getElementById('finale-user-name');
    if (nameSpan) {
      nameSpan.textContent = this.userName || 'Everyone';
    }
    this.grandFinaleOverlay.classList.add('visible');
  }

  // ==========================================
  // PERSONALIZED WISHES & WHATSAPP SHARING
  // ==========================================

  checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get('name') || params.get('from');
      if (nameParam) {
        this.userName = decodeURIComponent(nameParam.trim());
        const heroNameField = document.getElementById('visitor-name-input');
        if (heroNameField) {
          heroNameField.value = this.userName;
        }
        if (this.wishesNameInput) {
          this.wishesNameInput.value = this.userName;
        }
        this.updateWelcomeGreeting();
      }
    } catch (e) {}
  }

  setUserName(name) {
    if (!name || !name.trim()) return;
    this.userName = name.trim();
    if (this.wishesNameInput) this.wishesNameInput.value = this.userName;
    this.updateWelcomeGreeting();
  }

  updateWelcomeGreeting() {
    const greetingEl = document.getElementById('personalized-hero-greeting');
    if (greetingEl && this.userName) {
      greetingEl.innerHTML = `Happy Diwali, <span class="golden-highlight">${this.escapeHtml(this.userName)}</span>! 🪔✨`;
      greetingEl.classList.add('visible');
    }
    this.updateWishesPreview();
  }

  openWishesModal() {
    if (!this.wishesModal) return;
    if (this.wishesNameInput && !this.wishesNameInput.value) {
      this.wishesNameInput.value = this.userName !== 'Friend' ? this.userName : '';
    }
    this.updateWishesPreview();
    this.wishesModal.classList.add('visible');
  }

  getGreetingText() {
    const sender = this.wishesNameInput?.value.trim() || this.userName || 'A Friend';
    const recipient = this.wishesRecipientInput?.value.trim() || 'You & Your Family';

    const baseUrl = window.location.origin + window.location.pathname;
    const customLink = `${baseUrl}?name=${encodeURIComponent(sender)}`;

    return {
      plainText: `🪔✨ HAPPY DIWALI 2026! ✨🪔\n\nDear ${recipient},\n\nMay the divine light of Diwali illuminate your life with peace, boundless joy, good health, and sparkling prosperity!\n\nWarm festive wishes from ${sender}.\n\n🎆 Launch interactive fireworks here:\n${customLink}`,
      shareUrl: customLink,
      sender,
      recipient
    };
  }

  updateWishesPreview() {
    if (!this.wishesPreview) return;
    const { plainText } = this.getGreetingText();
    this.wishesPreview.textContent = plainText;
  }

  async copyGreetingToClipboard() {
    const { plainText } = this.getGreetingText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = plainText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.showToast('📋 Greeting & Fireworks Link Copied!');
    } catch (err) {
      this.showToast('Could not copy automatically. Please copy the text above.');
    }
  }

  shareViaWhatsapp() {
    const { plainText } = this.getGreetingText();
    const encoded = encodeURIComponent(plainText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    this.showToast('📱 Opening WhatsApp...');
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

