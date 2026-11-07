/**
 * DIWALI BLAST 2026 - MAIN APPLICATION ENTRY POINT
 * Orchestrates fireworks engine, audio synthesis, user interactions,
 * hero onboarding sequence, and ambient festive celebration.
 */

import { FireworksEngine, PALETTES } from './fireworks.js';
import { InteractionManager } from './interactions.js';
import { soundManager } from './sound.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get canvas and instantiate Fireworks Engine
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) {
    console.error('Fireworks canvas element not found!');
    return;
  }

  const engine = new FireworksEngine(canvas);
  engine.start();

  // 2. Instantiate Interaction Manager
  const interactions = new InteractionManager(engine);

  // 3. Setup Hero Section "Start Celebration" button
  const btnStart = document.getElementById('btn-start-celebration');
  const heroSection = document.getElementById('hero-section');
  const nameInput = document.getElementById('visitor-name-input');
  const controlPanel = document.getElementById('control-panel');

  if (btnStart && heroSection) {
    btnStart.addEventListener('click', () => {
      // Initialize audio on user gesture
      soundManager.init();

      // Read visitor name
      const enteredName = nameInput ? nameInput.value.trim() : '';
      if (enteredName) {
        interactions.setUserName(enteredName);
      }

      // Smoothly hide hero section
      heroSection.classList.add('fade-out');
      setTimeout(() => {
        heroSection.style.display = 'none';
      }, 700);

      // Ensure control panel is visible and uncollapsed
      if (controlPanel) {
        controlPanel.classList.remove('hidden');
        controlPanel.classList.remove('collapsed');
      }

      // Opening Celebration Fireworks Salvo
      launchOpeningSalvo(engine, enteredName || 'Friend');
    });
  }

  // Allow pressing Enter in the name input to start celebration
  if (nameInput && btnStart) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnStart.click();
      }
    });
  }

  // 4. Opening Celebration Salvo
  function launchOpeningSalvo(engine, name) {
    interactions.showToast(`✨ Welcome to Diwali Blast 2026, ${name}! 🪔✨`, 4000);

    // Launch 3 staggered opening celebratory rockets
    setTimeout(() => {
      engine.launchRocket({
        x: engine.width * 0.25,
        targetX: engine.width * 0.25,
        targetY: engine.height * 0.25,
        type: 'CHRYSANTHEMUM',
        palette: PALETTES.GOLDEN_ROYAL,
        size: 3.2
      });
    }, 200);

    setTimeout(() => {
      engine.launchRocket({
        x: engine.width * 0.75,
        targetX: engine.width * 0.75,
        targetY: engine.height * 0.25,
        type: 'CHRYSANTHEMUM',
        palette: PALETTES.VIBRANT_FESTIVE,
        size: 3.2
      });
    }, 600);

    setTimeout(() => {
      engine.launchRocket({
        x: engine.width * 0.5,
        targetX: engine.width * 0.5,
        targetY: engine.height * 0.18,
        type: 'WILLOW',
        palette: PALETTES.GOLDEN_ROYAL,
        size: 3.8
      });
    }, 1100);
  }

  // 5. Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.info('Prefers-reduced-motion detected: adjusting auto-fireworks frequency.');
    engine.stopAutoFireworks();
  }

  // 6. Developer Console Greeting
  console.log(
    `%c 🪔 DIWALI BLAST 2026 🪔 %c\n%c Crafted with HTML5 Canvas, Web Audio API & Vanilla JavaScript. %c\n May your life shine brighter than ever! ✨`,
    'background: #ffd700; color: #000; font-weight: bold; font-size: 16px; padding: 6px 12px; border-radius: 4px;',
    '',
    'color: #ffb703; font-size: 13px;',
    'color: #e0aaff; font-size: 12px;'
  );

  // Expose global object for debugging / testing
  window.DiwaliBlast = {
    engine,
    interactions,
    soundManager
  };
});

