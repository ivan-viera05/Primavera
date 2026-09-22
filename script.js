/* ==========================================================
   REGALO DE PRIMAVERA - FLORES AMARILLAS PARA ARI 🌻💛
   Lógica interactiva, canvas de pétalos y sintetizador musical
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Elementos del DOM ---
  const envelopeSection = document.getElementById('envelope-section');
  const letterSection = document.getElementById('letter-section');
  const envelope = document.getElementById('envelope');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const openBtn = document.getElementById('open-btn');
  const resetBtn = document.getElementById('reset-envelope-btn');
  const rainBtn = document.getElementById('rain-btn');
  const musicBtn = document.getElementById('music-btn');
  const musicIcon = document.getElementById('music-icon');
  const reasonCards = document.querySelectorAll('.reason-card');
  const bouquetDisplay = document.getElementById('bouquet-display');

  // ========================================================
  // 1. SISTEMA DE PÉTALOS Y DESTELLES (CANVAS)
  // ========================================================
  const canvas = document.getElementById('petal-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Tipos de partículas: pétalos amarillos y motas de polen/brillos
  const petals = [];
  const TOTAL_PETALS = 45;

  class Petal {
    constructor(isBurst = false, originX = null, originY = null) {
      this.reset(isBurst, originX, originY);
    }

    reset(isBurst = false, originX = null, originY = null) {
      if (isBurst && originX !== null && originY !== null) {
        this.x = originX;
        this.y = originY;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;
      } else {
        this.x = Math.random() * width;
        this.y = Math.random() * -height * 0.5 - 20;
        this.vx = Math.random() * 1.5 - 0.75;
        this.vy = Math.random() * 1.8 + 1.2;
      }

      this.size = Math.random() * 14 + 10;
      this.angle = Math.random() * 360;
      this.angularSpeed = (Math.random() - 0.5) * 2;
      this.opacity = Math.random() * 0.4 + 0.6;
      this.colorType = Math.random() > 0.3 ? 'golden' : 'light';
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.04 + 0.02;
      this.isSparkle = Math.random() < 0.25;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 1.2;
      this.y += this.vy;
      this.angle += this.angularSpeed;

      // Gravedad suave para explosiones
      if (this.vy < 3) this.vy += 0.05;

      // Reaparecer al salir de pantalla
      if (this.y > height + 25 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (this.isSparkle) {
        // Dibujar destello dorado
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(0, 0, Math.random() * 2.5 + 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dibujar pétalo ovalado estilizado
        const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
        if (this.colorType === 'golden') {
          gradient.addColorStop(0, '#FFF176');
          gradient.addColorStop(0.6, '#FFD54F');
          gradient.addColorStop(1, '#FFB300');
        } else {
          gradient.addColorStop(0, '#FFFDE7');
          gradient.addColorStop(0.7, '#FFF59D');
          gradient.addColorStop(1, '#FFE082');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Forma de pétalo curvo
        ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nervadura central sutil
        ctx.strokeStyle = 'rgba(230, 160, 20, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.8);
        ctx.lineTo(0, this.size * 0.8);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Inicializar partículas
  for (let i = 0; i < TOTAL_PETALS; i++) {
    petals.push(new Petal());
  }

  // Bucle de animación Canvas
  function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // Función para lluvia intensa o explosión
  function spawnFlowerBurst(count = 25, originX = width / 2, originY = height / 2) {
    for (let i = 0; i < count; i++) {
      petals.push(new Petal(true, originX, originY));
    }
    // Mantener la lista bajo control
    if (petals.length > 120) {
      petals.splice(0, petals.length - 100);
    }
  }

  // ========================================================
  // 2. APERTURA Y CIERRE DEL SOBRE INTERACTIVO
  // ========================================================
  let isOpen = false;

  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    // Iniciar o activar audio si el usuario aún no interactuó
    playMusic();

    // 1. Abrir solapa del sobre
    envelope.classList.add('is-open');

    // Efecto de explosión de pétalos desde el sobre
    const rect = envelopeWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    spawnFlowerBurst(40, centerX, centerY);

    // Emojis flotantes alrededor del sobre
    createFloatingFlower(centerX - 40, centerY, '🌻');
    createFloatingFlower(centerX + 40, centerY, '💛');
    createFloatingFlower(centerX, centerY - 30, '✨');

    // 2. Transición hacia la carta
    setTimeout(() => {
      envelopeSection.classList.add('hide-away');
      setTimeout(() => {
        envelopeSection.style.display = 'none';
        letterSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Segunda lluvia festiva al desplegar la carta
        spawnFlowerBurst(35, width / 2, 100);
      }, 500);
    }, 900);
  }

  function resetEnvelope() {
    letterSection.classList.add('hidden');
    envelopeSection.style.display = 'flex';
    envelopeSection.classList.remove('hide-away');
    envelope.classList.remove('is-open');
    isOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Event Listeners para abrir
  if (envelopeWrapper) envelopeWrapper.addEventListener('click', openEnvelope);
  if (openBtn) openBtn.addEventListener('click', openEnvelope);
  if (resetBtn) resetBtn.addEventListener('click', resetEnvelope);

  // ========================================================
  // 3. FLORES FLOTANTES AL TOCAR O CLICKEAR LA PANTALLA
  // ========================================================
  const flowerIcons = ['🌻', '🌼', '💛', '✨', '🌸', '💐'];

  function createFloatingFlower(x, y, forcedChar = null) {
    const burst = document.createElement('div');
    burst.className = 'click-flower-burst';
    burst.textContent = forcedChar || flowerIcons[Math.floor(Math.random() * flowerIcons.length)];
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    document.body.appendChild(burst);

    setTimeout(() => {
      burst.remove();
    }, 1200);
  }

  document.addEventListener('click', (e) => {
    // No generar si es clic en botones interactivos para no entorpecer
    if (e.target.closest('button') || e.target.closest('.reason-card')) return;
    createFloatingFlower(e.clientX, e.clientY);
  });

  // ========================================================
  // 4. BOTONES MÁGICOS Y RAMO INTERACTIVO
  // ========================================================
  if (rainBtn) {
    rainBtn.addEventListener('click', () => {
      spawnFlowerBurst(50, width / 2, 80);
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          createFloatingFlower(
            Math.random() * width,
            Math.random() * (height * 0.6) + 100,
            flowerIcons[Math.floor(Math.random() * flowerIcons.length)]
          );
        }, i * 120);
      }
    });
  }

  if (bouquetDisplay) {
    bouquetDisplay.addEventListener('click', (e) => {
      const rect = bouquetDisplay.getBoundingClientRect();
      spawnFlowerBurst(25, rect.left + rect.width / 2, rect.top + rect.height / 2);
      createFloatingFlower(e.clientX, e.clientY, '🌻');
    });
  }

  // ========================================================
  // 5. TARJETAS DE RAZONES INTERACTIVAS
  // ========================================================
  reasonCards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('revealed');
      const rect = card.getBoundingClientRect();
      createFloatingFlower(rect.left + rect.width / 2, rect.top + 20, '💛');
      spawnFlowerBurst(10, rect.left + rect.width / 2, rect.top + 20);
    });
  });

  // ========================================================
  // 6. MÚSICA: "RUNNING HOME TO YOU" - BARRY ALLEN ⚡💛
  // Soporte triple: YouTube API + Audio MP3 Local + Web Audio Fallback
  // ========================================================
  const playerCard = document.querySelector('.music-player-card');
  const localAudio = document.getElementById('local-audio');
  let isPlaying = false;
  let ytPlayer = null;
  let isYtReady = false;
  let useLocalAudio = false;

  // Intentar comprobar si el archivo local MP3 está presente
  if (localAudio) {
    localAudio.addEventListener('canplaythrough', () => {
      useLocalAudio = true;
    });
    localAudio.addEventListener('error', () => {
      useLocalAudio = false;
    });
  }

  // Inicialización de YouTube Iframe API
  window.initYouTubePlayer = function () {
    if (typeof YT !== 'undefined' && YT.Player) {
      try {
        ytPlayer = new YT.Player('yt-player-target', {
          height: '100',
          width: '180',
          videoId: 'b4wS9W38sQ0', // Barry Allen - Running Home to You
          playerVars: {
            autoplay: 0,
            controls: 1,
            loop: 1,
            playlist: 'b4wS9W38sQ0',
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              isYtReady = true;
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                setMusicPlayingState(true);
              } else if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED
              ) {
                setMusicPlayingState(false);
              }
            },
            onError: () => {
              // Si YouTube tiene restricción de dominio, usamos fallback suave
              console.log('YouTube fallback a melodía de respaldo');
            },
          },
        });
      } catch (err) {
        console.warn('Error inicializando YouTube player:', err);
      }
    }
  };

  if (window.YT && window.YT.Player) {
    window.initYouTubePlayer();
  } else {
    window.onYouTubeIframeAPIReady = window.initYouTubePlayer;
  }

  function setMusicPlayingState(playing) {
    isPlaying = playing;
    if (playerCard) {
      if (playing) {
        playerCard.classList.add('is-playing');
      } else {
        playerCard.classList.remove('is-playing');
      }
    }
  }

  function playMusic() {
    if (isPlaying) return;

    // 1. Probar archivo local (Runnin-HometoYou.mp4)
    if (localAudio) {
      const promise = localAudio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setMusicPlayingState(true);
          })
          .catch(() => {
            playYouTubeOrSynth();
          });
        return;
      }
    }

    playYouTubeOrSynth();
  }

  function playYouTubeOrSynth() {
    // 2. Probar YouTube Player
    if (isYtReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        setMusicPlayingState(true);
        return;
      } catch (e) {
        console.warn('No se pudo reproducir video de YouTube:', e);
      }
    }

    // 3. Fallback: melodía sintetizada de respaldo
    startSynthMelody();
    setMusicPlayingState(true);
  }

  function pauseMusic() {
    if (!isPlaying) return;

    if (localAudio && !localAudio.paused) {
      localAudio.pause();
    }

    if (isYtReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }

    pauseSynthMelody();
    setMusicPlayingState(false);
  }

  function toggleMusic() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  if (playerCard) {
    playerCard.addEventListener('click', toggleMusic);
  } else if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // --- SINTETIZADOR DE RESPALDO (Por si no hay conexión de internet ni MP3) ---
  let audioCtx = null;
  let melodyInterval = null;
  let currentNoteIndex = 0;

  const NOTES = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
  };

  const backupMelody = [
    { note: NOTES.C4, dur: 0.6 },
    { note: NOTES.E4, dur: 0.6 },
    { note: NOTES.G4, dur: 0.6 },
    { note: NOTES.C5, dur: 0.9 },
    { note: NOTES.B4, dur: 0.5 },
    { note: NOTES.A4, dur: 0.6 },
    { note: NOTES.G4, dur: 0.6 },
    { note: NOTES.E4, dur: 0.8 },
  ];

  function initAudioCtx() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
  }

  function playBellNote(frequency, duration = 0.8) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.5);
  }

  function scheduleNextNote() {
    if (!isPlaying) return;
    const current = backupMelody[currentNoteIndex];
    playBellNote(current.note, current.dur);
    currentNoteIndex = (currentNoteIndex + 1) % backupMelody.length;
    melodyInterval = setTimeout(scheduleNextNote, current.dur * 850);
  }

  function startSynthMelody() {
    initAudioCtx();
    if (!audioCtx) return;
    scheduleNextNote();
  }

  function pauseSynthMelody() {
    if (melodyInterval) {
      clearTimeout(melodyInterval);
      melodyInterval = null;
    }
  }

  // Modificar openEnvelope para usar playMusic
  window.triggerMusicOnOpen = playMusic;

});
